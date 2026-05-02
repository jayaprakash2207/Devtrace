# DevTrace — Deployment Guide

> **Stack:** React + Vite (Vercel) · Node.js + Express (Render) · MongoDB (Atlas)

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Node.js | ≥ 18 | Local dev & build |
| Git | any | Push to GitHub |
| GitHub account | — | Source for Vercel & Render |
| MongoDB Atlas account | free | Hosted database |
| Render account | free tier | Backend hosting |
| Vercel account | free tier | Frontend hosting |

---

## Architecture Overview

```
Browser
  │
  │  HTTPS
  ▼
Vercel  (React SPA — static CDN)
  │
  │  HTTPS  →  VITE_API_URL (e.g. https://devtrace-api.onrender.com)
  ▼
Render  (Express API — Web Service)
  │
  │  TLS  →  MONGO_URI (SRV connection string)
  ▼
MongoDB Atlas  (Managed cluster — M0 Free)
```

---

## Phase 1 — MongoDB Atlas

### 1.1 Create a free cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Sign up / Sign in**
2. Click **"Build a Database"**
3. Select **M0 Free** tier → choose a cloud provider + region closest to you
4. Name the cluster `devtrace` → click **"Create Deployment"**

### 1.2 Create a database user

> This is the user your Express app authenticates as — not your Atlas login.

1. In the left sidebar → **Database Access** → **"Add New Database User"**
2. Choose **Password** authentication
3. Set:
   - **Username:** `devtrace_app`
   - **Password:** click "Autogenerate Secure Password" — **copy it now**
4. Under **"Database User Privileges"** → select **"Read and Write to any database"**
5. Click **"Add User"**

### 1.3 Whitelist IP addresses

1. Left sidebar → **Network Access** → **"Add IP Address"**
2. For Render (backend): click **"Allow Access From Anywhere"** → `0.0.0.0/0`
   > Render assigns dynamic IPs so you must allow all. This is standard practice — your MongoDB user credentials are the actual security layer.
3. Click **"Confirm"**

### 1.4 Get the connection string

1. Left sidebar → **Database** → click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Select **Driver: Node.js**, Version: **5.5 or later**
4. Copy the string — it looks like:

```
mongodb+srv://devtrace_app:<password>@devtrace.abc12.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with the password you generated in step 1.2
6. Append the database name before `?`:

```
mongodb+srv://devtrace_app:YOUR_PASSWORD@devtrace.abc12.mongodb.net/devtrace?retryWrites=true&w=majority
```

**Save this string** — you will use it as `MONGO_URI` on Render.

---

## Phase 2 — Backend on Render

### 2.1 Push code to GitHub

```bash
# From the repo root (d:\DevTrace)
git init
git add .
git commit -m "initial commit"
git branch -M main

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/devtrace.git
git push -u origin main
```

> **Important:** confirm `.env` is listed in `.gitignore` before pushing. Never commit real secrets.

### 2.2 Create a Web Service on Render

1. Go to [render.com](https://render.com) → Dashboard → **"New +"** → **"Web Service"**
2. Connect your GitHub account → select the `devtrace` repository
3. Fill in the settings:

| Field | Value |
|-------|-------|
| **Name** | `devtrace-api` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

4. Click **"Advanced"** → **"Add Environment Variable"** and add every row below:

### 2.3 Backend environment variables

Add these one by one in Render's "Environment" tab:

```
NODE_ENV          = production
PORT              = 10000
MONGO_URI         = mongodb+srv://devtrace_app:YOUR_PASSWORD@devtrace.abc12.mongodb.net/devtrace?retryWrites=true&w=majority
JWT_SECRET        = (generate a random 64-char string — see tip below)
JWT_EXPIRES_IN    = 7d
CLIENT_URL        = https://devtrace.vercel.app
```

> **Tip — generate a strong JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copy the output and paste it as the value.

> **CLIENT_URL** is your Vercel URL. You can update it after deploying the frontend. Use a comma-separated list for multiple origins:
> `CLIENT_URL=https://devtrace.vercel.app,https://www.devtrace.app`

5. Click **"Create Web Service"**

Render will clone the repo, run `npm install`, then `node server.js`. The first deploy takes 2–4 minutes.

### 2.4 Verify the backend is live

Once the deploy shows **"Live"**, open the health endpoint in your browser:

```
https://devtrace-api.onrender.com/health
```

Expected response:
```json
{ "status": "ok", "timestamp": "2024-01-15T10:00:00.000Z" }
```

---

## Phase 3 — Frontend on Vercel

### 3.1 Import the project

1. Go to [vercel.com](https://vercel.com) → **"Add New Project"**
2. Click **"Import"** next to your `devtrace` GitHub repository
3. Under **"Configure Project"**:

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3.2 Frontend environment variables

Click **"Environment Variables"** and add:

```
VITE_API_URL = https://devtrace-api.onrender.com
```

> Do **not** add a trailing slash. This is the only env var the frontend needs in production.

4. Click **"Deploy"**

Vercel builds the app and publishes it to a `.vercel.app` subdomain in about 30–60 seconds.

### 3.3 Set your custom domain (optional)

1. Vercel Dashboard → your project → **"Settings"** → **"Domains"**
2. Add your domain → follow the DNS instructions

---

## Phase 4 — Connect Frontend ↔ Backend

### How the connection works

| Environment | API calls from browser | Handled by |
|-------------|----------------------|------------|
| Local dev | `http://localhost:5173/api/*` | Vite proxy → `localhost:5000/api/*` |
| Production | `https://devtrace-api.onrender.com/api/*` | Direct HTTPS via `VITE_API_URL` |

The key files involved:

**[client/src/api/axios.js](client/src/api/axios.js)**
```js
const BASE = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: BASE });
```
- In dev: `BASE = ''` → Vite proxy intercepts `/api/*`
- In prod: `BASE = 'https://devtrace-api.onrender.com'` → direct call

**[server/app.js](server/app.js)** — CORS reads from `CLIENT_URL`:
```js
const allowedOrigins = process.env.CLIENT_URL.split(',');
```

### After deploying both services

1. Copy your Vercel URL (e.g. `https://devtrace-abc.vercel.app`)
2. Go to Render → `devtrace-api` → **"Environment"**
3. Update `CLIENT_URL` to your Vercel URL
4. Render will auto-redeploy

Test the full flow:
1. Open the Vercel URL
2. Sign up for an account
3. Open browser DevTools → Network tab
4. Confirm API calls go to `devtrace-api.onrender.com` with status 200

---

## Phase 5 — Common Errors and Fixes

### Backend errors

---

#### ❌ `FATAL: JWT_SECRET is not set`

**Cause:** The `JWT_SECRET` environment variable is missing on Render.

**Fix:**
1. Render Dashboard → `devtrace-api` → **Environment**
2. Add `JWT_SECRET` → redeploy

---

#### ❌ `MongoServerError: bad auth — authentication failed`

**Cause:** Wrong username or password in `MONGO_URI`.

**Fix:**
1. Atlas → **Database Access** → click "Edit" on `devtrace_app`
2. Click "Edit Password" → set a new known password
3. Update `MONGO_URI` on Render with the new password
4. Trigger a manual redeploy on Render

---

#### ❌ `MongooseServerSelectionError: connection timed out`

**Cause:** MongoDB Atlas IP whitelist is blocking Render's IP.

**Fix:**
1. Atlas → **Network Access** → **"Add IP Address"**
2. Enter `0.0.0.0/0` (allow all) → **Confirm**
3. Wait 60 seconds for the change to propagate

---

#### ❌ `Cannot GET /api/auth/login` — 404 on Render

**Cause:** Wrong **Root Directory** in Render config — it's running from the repo root, not `server/`.

**Fix:**
1. Render → `devtrace-api` → **Settings**
2. Set **Root Directory** → `server`
3. Save → redeploy

---

#### ❌ Rate limiter fires immediately — `Too many requests`

**Cause:** Render sits behind a load balancer, so `req.ip` is always the proxy IP. Every request counts as the same "user".

**Fix:** Add `trust proxy` to `server/app.js`, right after `const app = express();`:

```js
app.set('trust proxy', 1);
```

Then redeploy.

---

### Frontend (CORS) errors

---

#### ❌ `Access-Control-Allow-Origin` header missing — browser blocks the request

**Cause:** `CLIENT_URL` on Render does not match the exact origin the browser sends.

**Diagnosis:** Open DevTools → Network → failing preflight request → check the `Origin` header value.

**Fix:**
1. Render → `devtrace-api` → Environment
2. Set `CLIENT_URL` to exactly what the browser sends, e.g.:
   ```
   CLIENT_URL=https://devtrace.vercel.app
   ```
   (No trailing slash. Include `www.` if that's what the browser sends.)
3. Redeploy

---

#### ❌ API calls hitting `localhost:5000` in production

**Cause:** `VITE_API_URL` was not set before the Vercel build ran.

**Fix:**
1. Vercel → your project → **Settings** → **Environment Variables**
2. Add `VITE_API_URL = https://devtrace-api.onrender.com`
3. Vercel → **Deployments** → click the latest → **"Redeploy"** → tick "Use existing build cache" = OFF

---

#### ❌ Page refreshing on `/dashboard` returns 404 on Vercel

**Cause:** Vercel tries to serve a file at `/dashboard` — it doesn't exist (React Router handles it client-side).

**Fix:** Confirm `client/vercel.json` exists and contains:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Redeploy.

---

#### ❌ `401 Unauthorized` on every request after login

**Cause:** The JWT was stored but the `Authorization` header is not being sent — likely a `VITE_API_URL` mismatch causing the browser to treat the requests as cross-origin and strip the header.

**Fix:**
1. Confirm `VITE_API_URL` has no trailing slash
2. Confirm `axios.js` `baseURL = import.meta.env.VITE_API_URL || ''`
3. Open DevTools → Application → Local Storage → confirm `dt_token` exists

---

### Render cold-start delay

**Symptom:** First API call after inactivity takes 30–50 seconds.

**Cause:** Render's free tier spins down services after 15 minutes of inactivity.

**Options:**
1. **Upgrade to Render Starter** ($7/mo) — always-on
2. **Use a cron ping:** a free service like [cron-job.org](https://cron-job.org) pings `https://devtrace-api.onrender.com/health` every 10 minutes
3. **Switch to Railway** — free tier does not sleep

---

## Environment Variable Reference

### Backend (`server/.env` / Render Environment)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | Disables dev logging |
| `PORT` | Yes | `10000` | Render sets this automatically |
| `MONGO_URI` | Yes | `mongodb+srv://...` | Atlas SRV string with `/devtrace` database |
| `JWT_SECRET` | Yes | 64-char hex string | Never reuse across environments |
| `JWT_EXPIRES_IN` | No | `7d` | Defaults to `7d` |
| `CLIENT_URL` | Yes | `https://devtrace.vercel.app` | Comma-separated for multiple origins |

### Frontend (`client/.env.production` / Vercel Environment)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_API_URL` | Yes | `https://devtrace-api.onrender.com` | No trailing slash. Leave blank for local dev |

---

## Redeploy Workflow

After pushing new code to `main`:
- **Render** redeploys automatically (CI is on by default)
- **Vercel** redeploys automatically

To force a manual redeploy:
- **Render:** Dashboard → `devtrace-api` → **"Manual Deploy"** → "Deploy latest commit"
- **Vercel:** Dashboard → your project → **"Deployments"** → latest → **"Redeploy"**

---

## Quick Smoke-Test Checklist

Run this after each deployment:

- [ ] `GET https://devtrace-api.onrender.com/health` → `{ "status": "ok" }`
- [ ] Open Vercel URL → Landing page loads
- [ ] Sign up with a new account → redirected to Dashboard
- [ ] Dashboard stat cards load without errors
- [ ] Create a Note → note appears in grid
- [ ] Refresh `/dashboard` → no 404
- [ ] DevTools Network → no requests to `localhost`
- [ ] DevTools Console → no CORS errors
