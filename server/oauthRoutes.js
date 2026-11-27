import express from 'express';
import crypto from 'node:crypto';
import { issueAppToken, clearAppToken } from './auth.js';

const router = express.Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const CALLBACK_URL = `${APP_BASE_URL}/api/auth/github/callback`;
const COOKIE_SECURE = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';

// Step 1: Redirect the user to GitHub to authorise the app.
// A short-lived random `state` value is stored in a cookie and checked on the
// callback to protect against CSRF.
router.get('/github', (req, res) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res
      .status(500)
      .send('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: '/',
  });

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
  authUrl.searchParams.set('scope', 'read:user');
  authUrl.searchParams.set('state', state);

  res.redirect(authUrl.toString());
});

// Step 2: GitHub redirects back here with a code. We exchange it for an access
// token, fetch the user's GitHub identity, then issue OUR OWN application JWT
// and store it in the Secure, HttpOnly `token` cookie.
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.oauth_state;

    if (!code || !state || !savedState || state !== savedState) {
      return res.status(400).send('Invalid OAuth state. Please try logging in again.');
    }
    res.clearCookie('oauth_state', { path: '/' });

    // Exchange the authorisation code for a GitHub access token.
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(401).send('Failed to obtain GitHub access token.');
    }

    // Use the GitHub access token to read the user's profile.
    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ai-capsule',
      },
    });

    if (!userResp.ok) {
      return res.status(401).send('Failed to read GitHub user profile.');
    }

    const ghUser = await userResp.json();

    // Issue the application JWT (not the GitHub token) in the `token` cookie.
    issueAppToken(res, ghUser);

    // Back to the protected dashboard.
    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Authentication failed.');
  }
});

// Log out: clear the application JWT cookie.
router.post('/logout', (req, res) => {
  clearAppToken(res);
  res.json({ ok: true });
});

export default router;
