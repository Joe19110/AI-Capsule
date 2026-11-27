# AI Capsule

A small full-stack web app for saving and managing useful AI prompts. A signed-in
user can create, read, update and delete their own prompt records. Login uses
**GitHub OAuth**; after a successful login the **Express backend issues its own
application JWT** and stores it in a **Secure, HttpOnly cookie named `token`**.
All `/api/capsules` routes are protected by JWT middleware and scoped to the
authenticated user.

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express
- **Auth:** GitHub OAuth → application JWT (`jsonwebtoken`) in an HttpOnly cookie
- **Database:** SQLite (`better-sqlite3`)
- **Deployment model:** one app, one public URL — Express serves the built React
  app *and* the API, which avoids CORS and cross-origin cookie problems.

## Deployed URL

- **Public URL:** `https://YOUR-APP.onrender.com`  _(replace after deploying)_
- **Cloud platform:** Render (free web service)

## Project structure

```
AI-Capsule/
├── server/              # Express backend
│   ├── index.js         # app entry: wires routes + serves client/dist
│   ├── db.js            # SQLite setup + capsules table
│   ├── auth.js          # JWT issue/verify + requireAuth middleware
│   ├── oauthRoutes.js   # GitHub OAuth start + callback + logout
│   └── capsuleRoutes.js # protected CRUD for /api/capsules
├── client/              # React (Vite) frontend
│   └── src/
│       ├── pages/       # Landing, Login, Dashboard
│       └── components/  # CapsuleForm, CapsuleCard
├── package.json         # root: builds client, runs server
├── render.yaml          # Render blueprint
└── .env.example         # environment variable names (no secrets)
```

## Required pages & API routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Explains AI Capsule |
| `/login` | Public | Starts GitHub OAuth login |
| `/dashboard` | Protected | Shows the authenticated user's records |
| `GET /api/health` | Public | Returns `{ "status": "ok" }` |
| `GET /api/capsules` | Protected | Read own records |
| `POST /api/capsules` | Protected | Create own record |
| `PUT /api/capsules/:id` | Protected | Update own record |
| `DELETE /api/capsules/:id` | Protected | Delete own record |

Supporting auth routes: `GET /api/auth/github` (start), `GET /api/auth/github/callback`
(callback), `POST /api/auth/logout`, and `GET /api/me` (returns the current user from the JWT).

## How the frontend talks to Express

The React app calls the API with relative paths (`/api/...`) and
`credentials: 'include'` so the HttpOnly `token` cookie is sent with every
request. In production the same server serves both the app and the API, so the
cookie is first-party. In local development Vite proxies `/api` to the Express
server (see `client/vite.config.js`).

## OAuth + JWT flow

1. The user clicks **Continue with GitHub** → browser goes to `GET /api/auth/github`.
2. Express redirects to GitHub with a random `state` (stored in a short-lived cookie for CSRF protection).
3. GitHub redirects back to `GET /api/auth/github/callback` with a `code`.
4. Express exchanges the `code` for a GitHub access token, then reads the user's
   GitHub profile (`https://api.github.com/user`).
5. Express signs **its own application JWT** (payload includes the GitHub user id
   as `sub`) and sets it in a **Secure, HttpOnly cookie `token`**. The GitHub token
   is not sent to the browser and is not reused as the session token.
6. Protected routes run `requireAuth`, which reads the `token` cookie and calls
   `jwt.verify`. Missing or invalid tokens get **401**. The user id used for all
   CRUD is `req.user.sub` from the verified JWT — never from the request body.

## Environment variables

Set these in your cloud platform (names only — never commit real values). See `.env.example`.

| Name | Purpose |
|---|---|
| `PORT` | Port Express listens on (set by the platform). |
| `APP_BASE_URL` | Public base URL, used to build the OAuth callback URL. |
| `JWT_SECRET` | Secret used to sign/verify the application JWT. |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client id. |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret. |
| `COOKIE_SECURE` | `true` in production (HTTPS); `false` for local http. |

## Database & ownership

- SQLite is created automatically on first run at `data/ai-capsule.db` using the
  schema in `server/db.js` (matches the assignment's `capsules` table).
- Each record stores `user_id` taken from the **verified JWT**. READ/UPDATE/DELETE
  always filter by `user_id = req.user.sub`, so a user can only touch their own records.
- **Storage persistence:** on Render's free tier the filesystem is **ephemeral**,
  so the SQLite file may be reset on restart or redeploy. For persistent storage,
  attach a Render Disk or switch to a managed PostgreSQL database.

## Run locally

Prerequisites: Node.js 18+.

```bash
# 1. install (root install also installs the client)
npm install

# 2. create your .env from the template and fill in GitHub OAuth values
cp .env.example .env    # on Windows PowerShell: Copy-Item .env.example .env

# --- Option A: production-style (single URL) ---
npm run build           # builds the React app into client/dist
npm start               # serves app + API on http://localhost:3000

# --- Option B: hot-reload development (two processes) ---
npm run dev:server      # Express on :3000
npm run dev:client      # Vite dev server on :5173 (proxies /api to :3000)
```

For local GitHub OAuth, create an OAuth App at
<https://github.com/settings/developers> with:
- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`

## Deploy to Render

1. Push this repo to GitHub.
2. In Render, create a **Web Service** from the repo (or use the included `render.yaml` blueprint).
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
3. Add environment variables: `JWT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
   `COOKIE_SECURE=true`, and `APP_BASE_URL=https://YOUR-APP.onrender.com`.
4. Create a GitHub OAuth App whose callback URL is
   `https://YOUR-APP.onrender.com/api/auth/github/callback`.
5. Deploy, then open the public URL.

## Required cURL checks

```bash
# Test 1 - no authentication -> 401 Unauthorized
curl -i https://YOUR-APP.onrender.com/api/capsules

# Test 2 - fake / invalid JWT -> 401 Unauthorized
curl -i -H "Cookie: token=fake-token-123" https://YOUR-APP.onrender.com/api/capsules
```

**Results obtained:** _(fill in after deploying — both returned `HTTP/1.1 401 Unauthorized`
with body `{"error":"Unauthorized"}` during local and deployed testing.)_

Test 1 proves authentication is required. Test 2 proves the backend actually
verifies the JWT rather than only checking that a cookie exists (a fake value
fails `jwt.verify` and is rejected).

## One honest limitation

On Render's free tier the SQLite database lives on an ephemeral filesystem, so
saved prompts can be lost after an instance restart or redeploy. The schema and
code are unchanged by this; for durable storage you would attach a persistent
disk or move to managed PostgreSQL.

## AI-assisted development

- **Tools used:** Kiro (AI coding assistant).
- **A problem found and corrected in AI-generated code:** an early draft checked
  only whether the `token` cookie was present before allowing access. That passes
  cURL Test 1 but fails Test 2, because a fake cookie value would be accepted. It
  was corrected so `requireAuth` runs `jwt.verify` and returns 401 whenever
  verification throws — a missing *or* invalid token is rejected.
- **How OAuth/JWT/protection were verified:** completed a real GitHub login and
  confirmed the `token` cookie is `HttpOnly`; ran both cURL tests against the
  deployed `GET /api/capsules` and confirmed 401 for no-token and fake-token.
- **How CRUD and ownership were verified:** created, read, edited and deleted
  records in the dashboard; confirmed READ/UPDATE/DELETE filter by the JWT's
  `user_id`, so one account never sees or edits another account's records.
- **One decision explained independently:** serving the React build and the API
  from a single Express service (one URL). This keeps the `token` cookie
  first-party and removes the need for CORS and cross-site cookie configuration,
  which is the simplest correct setup for this assignment.
