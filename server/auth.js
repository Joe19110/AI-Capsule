import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const TOKEN_NAME = 'token';
const COOKIE_SECURE = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';

// Issue the application JWT. This is OUR token, signed by the Express backend
// after a successful OAuth login - not the GitHub access token.
export function issueAppToken(res, user) {
  const payload = {
    sub: String(user.id),
    name: user.name || user.login || 'User',
    login: user.login || null,
    avatar: user.avatar_url || null,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.cookie(TOKEN_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAppToken(res) {
  res.clearCookie(TOKEN_NAME, { path: '/' });
}

// Middleware: verify the application JWT from the HttpOnly `token` cookie.
// Requests with no token OR an invalid token get 401 and never reach the
// protected handler.
export function requireAuth(req, res, next) {
  const token = req.cookies?.[TOKEN_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // user_id is taken from here, never from the client
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
