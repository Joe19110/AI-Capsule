import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { requireAuth } from './auth.js';
import oauthRoutes from './oauthRoutes.js';
import capsuleRoutes from './capsuleRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// ---- Public health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---- Lightweight "who am I" for the frontend to know if a session exists ----
app.get('/api/me', requireAuth, (req, res) => {
  res.json({
    id: req.user.sub,
    name: req.user.name,
    login: req.user.login,
    avatar: req.user.avatar,
  });
});

// ---- OAuth login / callback / logout ----
app.use('/api/auth', oauthRoutes);

// ---- Protected capsule CRUD ----
app.use('/api/capsules', capsuleRoutes);

// ---- Serve the built React client (single-URL deployment) ----
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // SPA fallback: any non-API GET returns index.html so React Router handles it.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(
      'Client build not found. Run "npm run build" to build the React app, then restart the server.'
    );
  });
}

app.listen(PORT, () => {
  console.log(`AI Capsule server listening on port ${PORT}`);
});
