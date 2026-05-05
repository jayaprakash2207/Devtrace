# DevTrace — Comprehensive Project Documentation

> **Version:** 1.0  
> **Stack:** React 18 · Vite · Node.js · Express · MongoDB Atlas · Google Gemini 2.0 Flash  
> **Live:** [devtraceproject.netlify.app](https://devtraceproject.netlify.app) · [API Health](https://devtrace-api.onrender.com/health)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Repository Layout](#3-repository-layout)
4. [Backend — Server](#4-backend--server)
   - 4.1 [Entry Point (`server.js`)](#41-entry-point-serverjs)
   - 4.2 [Application Setup (`app.js`)](#42-application-setup-appjs)
   - 4.3 [Database Models](#43-database-models)
   - 4.4 [Authentication & OAuth (`config/passport.js`)](#44-authentication--oauth-configpassportjs)
   - 4.5 [Middleware](#45-middleware)
   - 4.6 [Routes](#46-routes)
   - 4.7 [Controllers](#47-controllers)
   - 4.8 [Services](#48-services)
   - 4.9 [Utilities](#49-utilities)
5. [Frontend — Client](#5-frontend--client)
   - 5.1 [Entry Point & Routing (`App.jsx`)](#51-entry-point--routing-appjsx)
   - 5.2 [Axios Client (`api/axios.js`)](#52-axios-client-apiaxiosjs)
   - 5.3 [API Modules (`api/`)](#53-api-modules-api)
   - 5.4 [Context Providers](#54-context-providers)
   - 5.5 [Pages](#55-pages)
   - 5.6 [Components](#56-components)
6. [Authentication Flow](#6-authentication-flow)
   - 6.1 [Email / Password](#61-email--password)
   - 6.2 [Google OAuth](#62-google-oauth)
   - 6.3 [GitHub OAuth](#63-github-oauth)
   - 6.4 [Token Lifecycle](#64-token-lifecycle)
7. [Productivity Engine](#7-productivity-engine)
   - 7.1 [Scoring Model](#71-scoring-model)
   - 7.2 [Score Components](#72-score-components)
   - 7.3 [Additional Signals](#73-additional-signals)
   - 7.4 [Insight Generation](#74-insight-generation)
   - 7.5 [Grade System](#75-grade-system)
8. [Gemini AI Chat Integration](#8-gemini-ai-chat-integration)
9. [Activity Tracking](#9-activity-tracking)
10. [API Reference](#10-api-reference)
    - 10.1 [Auth Endpoints](#101-auth-endpoints)
    - 10.2 [Dashboard Endpoint](#102-dashboard-endpoint)
    - 10.3 [Notes Endpoints](#103-notes-endpoints)
    - 10.4 [Tasks Endpoints](#104-tasks-endpoints)
    - 10.5 [Analytics Endpoint](#105-analytics-endpoint)
    - 10.6 [Chat Endpoint](#106-chat-endpoint)
    - 10.7 [Activity Endpoint](#107-activity-endpoint)
    - 10.8 [Health Check](#108-health-check)
11. [Data Models (Schema Reference)](#11-data-models-schema-reference)
12. [Security Model](#12-security-model)
13. [Rate Limiting](#13-rate-limiting)
14. [Environment Variables](#14-environment-variables)
15. [Local Development Setup](#15-local-development-setup)
16. [Deployment](#16-deployment)
17. [Error Handling](#17-error-handling)
18. [Key Data Flows](#18-key-data-flows)

---

## 1. Project Overview

**DevTrace** is a production-grade, full-stack SaaS application designed for developers who want to understand and improve their own workflow. It solves three problems in one integrated platform:

| Problem | Solution |
|---------|----------|
| "I don't know how productive I've been" | Automatic activity logging + real-time 0–100 productivity score |
| "I don't know my patterns" | Statistical analysis (OLS, CV, burnout detection) surfaced as visual insights |
| "I need personalised advice" | Google Gemini AI chat coach pre-loaded with the user's live stats |

The platform also includes a full **task manager** and **developer notes** system whose completion data feeds directly into the productivity score.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                           Browser                                 │
│              React 18 + Vite  (CSS Modules)                       │
│         https://devtraceproject.netlify.app                       │
└───────────────────────────┬──────────────────────────────────────┘
                            │  HTTPS  (VITE_API_URL env var)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Express REST API                              │
│              https://devtrace-api.onrender.com                    │
│                                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │  /auth  │  │ /notes  │  │ /tasks  │  │  /chat  │  │ /dash │ │
│  │  OAuth  │  │  CRUD   │  │  CRUD   │  │ Gemini  │  │ board │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│                                                                   │
│   Helmet · CORS · Morgan · express-rate-limit · Passport.js       │
└───────────────────────────┬──────────────────────────────────────┘
                            │  Mongoose TLS (SRV)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas  (M0 Free)                        │
│           Users · Notes · Tasks · Activity logs                   │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  Google Gemini 2.0 Flash API
                  (for chat + AI insights)
```

**Key design decisions:**
- **Stateless backend** — no server-side sessions; all auth state lives in a JWT stored in `localStorage`.
- **Single REST API** — the entire backend is one Express app, making local development trivial (`localhost:5000`).
- **Vite proxy** — in development, the frontend proxies `/api/*` to `localhost:5000` so no CORS configuration is needed locally.
- **Fire-and-forget activity logging** — activity records are written asynchronously and never block an API response.

---

## 3. Repository Layout

```
DevTrace/
├── client/                          # React + Vite frontend
│   ├── public/
│   │   └── _redirects               # Netlify SPA catch-all redirect
│   ├── src/
│   │   ├── api/                     # Axios API modules (one per feature)
│   │   │   ├── axios.js             # Base Axios instance + interceptors
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── notes.js
│   │   │   ├── tasks.js
│   │   │   ├── analytics.js
│   │   │   └── chat.js
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ActivityChart.jsx / .module.css
│   │   │   ├── ChatPanel.jsx / .module.css
│   │   │   ├── InsightCard.jsx / .module.css
│   │   │   ├── Navbar.jsx / .module.css
│   │   │   ├── NoteCard.jsx / .module.css
│   │   │   ├── NoteModal.jsx / .module.css
│   │   │   ├── Sidebar.jsx / .module.css
│   │   │   ├── StatCard.jsx / .module.css
│   │   │   └── TaskItem.jsx / .module.css
│   │   ├── context/                 # React context providers
│   │   │   ├── AuthContext.jsx      # JWT state, login/logout/updateUser
│   │   │   └── ToastContext.jsx     # Global toast notifications
│   │   ├── pages/                   # Route-level components (one per page)
│   │   │   ├── Landing.jsx / .module.css
│   │   │   ├── Login.jsx / Auth.module.css
│   │   │   ├── Signup.jsx
│   │   │   ├── OAuthCallback.jsx    # Handles ?token=… redirect from server
│   │   │   ├── Dashboard.jsx / .module.css
│   │   │   ├── Notes.jsx / .module.css
│   │   │   ├── Tasks.jsx / .module.css
│   │   │   └── Profile.jsx / .module.css
│   │   ├── App.jsx                  # React Router tree + layout
│   │   ├── main.jsx                 # ReactDOM.createRoot entry
│   │   └── index.css                # Global CSS variables + utilities
│   ├── index.html
│   ├── vite.config.js               # Vite + proxy config
│   ├── netlify.toml                 # Netlify build config
│   └── vercel.json                  # Vercel SPA rewrite rules
│
└── server/                          # Node.js + Express backend
    ├── config/
    │   └── passport.js              # Google + GitHub OAuth strategies
    ├── controllers/                 # Request handlers (thin layer over services)
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── notesController.js
    │   ├── taskController.js
    │   ├── chatController.js
    │   ├── analyticsController.js
    │   └── activityController.js
    ├── middleware/
    │   ├── auth.js                  # JWT bearer verification → req.user
    │   ├── errorHandler.js          # Centralised Express error handler
    │   ├── trackActivity.js         # Fire-and-forget activity logger
    │   └── validate.js              # express-validator rule sets
    ├── models/                      # Mongoose schemas
    │   ├── User.js
    │   ├── Note.js
    │   ├── Task.js
    │   └── Activity.js
    ├── routes/                      # Express router files
    │   ├── auth.js
    │   ├── dashboard.js
    │   ├── notes.js
    │   ├── tasks.js
    │   ├── analytics.js
    │   ├── chat.js
    │   └── activity.js
    ├── services/
    │   ├── productivityEngine.js    # Core scoring algorithm
    │   ├── insightEngine.js         # Lightweight rule-based insight engine
    │   └── geminiService.js         # Google Gemini API wrapper
    ├── utils/
    │   └── jwt.js                   # signToken / verifyToken helpers
    ├── app.js                       # Express app factory (middleware + routes)
    ├── server.js                    # DB connect + HTTP listen + graceful shutdown
    ├── package.json
    └── .env.example
```

---

## 4. Backend — Server

### 4.1 Entry Point (`server.js`)

`server.js` is the **only** file that touches the process environment (via `dotenv`) and the database. It:

1. Loads `.env` with `dotenv`.
2. Performs an **early crash guard**: if `JWT_SECRET` is absent, it exits with code 1 immediately — preventing a misconfigured deployment from silently ignoring auth.
3. Calls `mongoose.connect()`.
4. On successful connection, starts the HTTP server.
5. Registers `SIGTERM` and `SIGINT` handlers for **graceful shutdown** — the HTTP server stops accepting new connections, then the MongoDB connection is cleanly closed before `process.exit(0)`.

```js
// Graceful shutdown pattern
const shutdown = (signal) => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
```

### 4.2 Application Setup (`app.js`)

`app.js` is a pure **Express factory** — it does not start the server, it just builds and exports the `app` object. This keeps it testable and separate from I/O concerns.

**Middleware stack (in order):**

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | `app.set('trust proxy', 1)` | Reads real client IP behind Render's load balancer for accurate rate limiting |
| 2 | `helmet()` | Sets 11 security headers (CSP, HSTS, X-Frame-Options, etc.) |
| 3 | `cors(...)` | Allows only origins listed in `CLIENT_URL`; `credentials: true` |
| 4 | `passport.initialize()` | Stateless Passport (no session serialisation) |
| 5 | `express.json({ limit: '50kb' })` | JSON body parsing; rejects oversized payloads |
| 6 | `express.urlencoded(...)` | Form body parsing |
| 7 | `morgan(...)` | HTTP request logging (`combined` in prod, `dev` in dev) |
| 8 | Rate limiters | Applied per-route group (see §13) |
| 9 | Route handlers | `/api/auth`, `/api/notes`, `/api/tasks`, etc. |
| 10 | `404 catch-all` | Returns `{ success: false, message: "Route … not found" }` |
| 11 | `errorHandler` | Centralised error response formatting |

**CORS configuration:**
```js
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
```
The `CLIENT_URL` environment variable supports **comma-separated origins**, enabling multi-domain setups (e.g., Vercel preview URLs + custom domain).

---

### 4.3 Database Models

#### User Model (`models/User.js`)

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Unique, lowercase, required for local; auto-generated for OAuth with no email |
| `password` | String | bcrypt hash; `select: false` (not returned by default); null for OAuth users |
| `username` | String | 2–30 chars, trimmed |
| `provider` | String | `'local'` \| `'google'` \| `'github'` |
| `providerId` | String | External OAuth user ID (null for local) |
| `avatar` | String | URL from OAuth provider |
| `streakDays` | Number | Consecutive login days; updated on every new-day login |
| `totalSessions` | Number | Incremented on every new-day login |
| `lastActiveDate` | Date | Used to compute streak continuity |

**Key behaviours:**
- `pre('validate')` hook: enforces that local users must supply a password at creation time.
- `pre('save')` hook: hashes the password with bcrypt (cost 12) whenever `password` is modified.
- `matchPassword(candidate)` instance method: constant-time bcrypt comparison; returns `false` if no password is set (OAuth users).
- `toJSON()` override: strips `password`, `__v`, and `providerId` from all serialised output.
- Compound index on `{ provider, providerId }` for fast OAuth lookups.

#### Note Model (`models/Note.js`)

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId | Ref `User`; required; indexed |
| `title` | String | Required; max 200 chars |
| `content` | String | Max 10,000 chars; default `''` |
| `tags` | [String] | Max 10 tags |
| `isPinned` | Boolean | Default `false` |

Indexes:
- `{ userId, createdAt: -1 }` — default list query
- `{ userId, isPinned: -1, updatedAt: -1 }` — pinned-first sort

#### Task Model (`models/Task.js`)

| Field | Type | Enum / Default |
|-------|------|----------------|
| `userId` | ObjectId | Ref `User`; required; indexed |
| `title` | String | Required; max 200 chars |
| `description` | String | Max 1,000 chars |
| `status` | String | `'todo'` \| `'in_progress'` \| `'done'`; default `'todo'` |
| `priority` | String | `'low'` \| `'medium'` \| `'high'`; default `'medium'` |
| `completedAt` | Date | Set automatically when status transitions to `'done'` |

Indexes: `{ userId, status }` and `{ userId, createdAt: -1 }`.

#### Activity Model (`models/Activity.js`)

The immutable audit log — records are only ever inserted, never updated.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Ref `User`; indexed |
| `action` | String | Enum (see below) |
| `sessionDuration` | Number | Seconds; null for point-in-time events |
| `timestamp` | Date | Default `Date.now`; indexed |
| `metadata` | Mixed | Free-form payload (e.g., `{ noteId, taskId }`) |

**Allowed `action` values:**

| Action | Triggered by |
|--------|-------------|
| `login` | Successful email/password or OAuth login |
| `logout` | (Reserved for future client-side signalling) |
| `signup` | New account creation |
| `view_dashboard` | Each `GET /api/dashboard` request |
| `create_note` | Note created |
| `update_note` | Note updated |
| `delete_note` | Note deleted |
| `create_task` | Task created |
| `update_task` | Task updated (non-completion) |
| `delete_task` | Task deleted |
| `complete_task` | Task status changed to `'done'` |
| `custom` | Catch-all for client-defined events |

Compound indexes: `{ userId, timestamp: -1 }` and `{ userId, action }`.

---

### 4.4 Authentication & OAuth (`config/passport.js`)

Passport is initialised **without** session support — there is no `passport.serializeUser` / `deserializeUser`. The only persistent state is the JWT issued after a successful OAuth round-trip.

**`findOrCreateOAuthUser` strategy (runs for both Google and GitHub):**

```
1. Try to find user by { provider, providerId }
   └─ Found → return immediately
2. Try to find user by email (account linking)
   └─ Found → update provider/providerId/avatar → return
3. Create a brand-new user
   └─ email = profile email or "{providerId}@{provider}.noemail" fallback
   └─ username = sanitised displayName (alphanumeric + underscore, max 30)
```

This design allows a user who signed up with email/password to later log in via Google (as long as the email matches) and have their account automatically linked.

Both strategies are **conditionally registered** — if `GOOGLE_CLIENT_ID` or `GITHUB_CLIENT_ID` are not set in the environment, those strategies are simply skipped, which is safe for local development without OAuth credentials.

---

### 4.5 Middleware

#### `middleware/auth.js` — JWT Protection

Protects any route that requires authentication. Reads the `Authorization: Bearer <token>` header, verifies the JWT, fetches the user document, and attaches it as `req.user`.

Error cases:
- Missing/malformed header → `401 No token — access denied`
- Expired JWT → `401 Token expired`
- Invalid signature → `401 Invalid token`
- User deleted after token issued → `401 User no longer exists`

#### `middleware/errorHandler.js` — Centralised Error Handler

Express's 4-argument error middleware. Handles:
- **Mongoose `ValidationError`** → 400 with field-level messages
- **Mongoose `CastError`** → 400 "Invalid ID format"
- **Mongoose duplicate key (`11000`)** → 409 "already exists" message
- **JWT errors** (`JsonWebTokenError`, `TokenExpiredError`) → 401
- **CORS errors** → 403
- **All others** → 500 (message hidden in production)

#### `middleware/validate.js` — express-validator Rule Sets

Provides reusable `validationResult` check rule arrays for tasks and other routes. Paired with `validationResult(req)` checks at the top of controllers.

#### `middleware/trackActivity.js`

A factory that returns an Express middleware function configured with an `action` string. When called, it fires an `Activity.create(...)` in the background (fire-and-forget, never blocks the response).

---

### 4.6 Routes

All routes are mounted under `/api/` in `app.js`. Each route file wires URLs → middleware → controller.

| File | Base Path | Protected? |
|------|-----------|------------|
| `routes/auth.js` | `/api/auth` | Mixed (public signup/login; protected me/profile) |
| `routes/dashboard.js` | `/api/dashboard` | ✅ |
| `routes/notes.js` | `/api/notes` | ✅ |
| `routes/tasks.js` | `/api/tasks` | ✅ |
| `routes/analytics.js` | `/api/analytics` | ✅ |
| `routes/chat.js` | `/api/chat` | ✅ |
| `routes/activity.js` | `/api/activity` | ✅ |

**OAuth routes** (defined in `routes/auth.js`):

```
GET  /api/auth/google           → passport.authenticate('google', { scope: ['profile','email'] })
GET  /api/auth/google/callback  → passport.authenticate + oauthCallback
GET  /api/auth/github           → passport.authenticate('github', { scope: ['user:email'] })
GET  /api/auth/github/callback  → passport.authenticate + oauthCallback
```

---

### 4.7 Controllers

#### `controllers/authController.js`

| Export | Method | Path | Description |
|--------|--------|------|-------------|
| `signup` | POST | `/api/auth/signup` | Creates user, logs `signup` activity, returns JWT |
| `login` | POST | `/api/auth/login` | Verifies password, logs `login`, returns JWT |
| `me` | GET | `/api/auth/me` | Returns `req.user` from the protect middleware |
| `updateProfile` | PATCH | `/api/auth/profile` | Updates username and/or password with full validation |
| `oauthCallback` | GET | (OAuth redirects) | Issues JWT, redirects browser to `/auth/callback?token=…` |

**`updateSessionStats(userId)`** — called fire-and-forget on every login:
- If user already logged in today → update `lastActiveDate` only
- If user logged in yesterday → increment `streakDays`
- Otherwise (gap > 1 day) → reset `streakDays` to 1
- Always increments `totalSessions` on a new day

#### `controllers/dashboardController.js`

Single export `overview` — runs three parallel async operations:
1. `runProductivityEngine(userId, user)` — full score + insights computation
2. `Activity.find(...)` — last 7 days of activity for the chart
3. `Note.countDocuments(...)` — total notes count

Assembles a pre-filled 7-day bucket object (so days with zero activity render as zero bars, not missing) and returns:
```json
{
  "success": true,
  "stats": { ...engineStats, "totalNotes": N },
  "insights": [...],
  "chart": [{ "date": "YYYY-MM-DD", "count": N }, ...]
}
```

Also writes a `view_dashboard` activity record asynchronously.

#### `controllers/notesController.js`

Full CRUD. All operations scope by `{ userId: req.user._id }` to enforce ownership.

- `list` — paginated (`page`, `limit`), filterable by `pinned` and `tag`, sorted pinned-first then newest.
- `get` — single note by ID.
- `create` — creates note, logs `create_note` activity.
- `update` — partial update via `$set`, logs `update_note` activity.
- `remove` — deletes note, logs `delete_note` activity.

#### `controllers/taskController.js`

Full CRUD. Automatically detects completion transitions:
```js
const wasCompleted = task.status !== 'done' && status === 'done';
if (wasCompleted) task.completedAt = new Date();
const action = wasCompleted ? 'complete_task' : 'update_task';
```

#### `controllers/chatController.js`

1. Calls `runProductivityEngine` to fetch live stats.
2. Builds a `systemContext` string with formatted stats injected as a prompt preamble.
3. Appends the last 8 turns of conversation history.
4. Calls `geminiService.generate(fullPrompt, { temperature: 0.7, maxTokens: 512 })`.
5. Returns the trimmed reply.

#### `controllers/analyticsController.js` / `controllers/activityController.js`

Provide aggregate queries on the `Activity` collection for the `/analytics` and `/activity` routes respectively.

---

### 4.8 Services

#### `services/productivityEngine.js` — Core Scoring Engine

The primary analytical brain of DevTrace. Pure computation — no external API calls. See [§7 Productivity Engine](#7-productivity-engine) for the full algorithm description.

**Public API:**
```js
const { stats, insights } = await runProductivityEngine(userId, userDocument);
```

**`stats` object shape:**
```json
{
  "productivity": 72,
  "grade": { "grade": "B", "label": "Good", "color": "#22c55e" },
  "streak": 5,
  "totalSessions": 23,
  "totalTasks": 12,
  "completedTasks": 9,
  "totalNotes": null,
  "mostActivePeriod": "morning",
  "mostActiveHour": 10,
  "peakDayName": "Wednesday",
  "weeklyTrend": { "direction": "rising", "slope": 0.8, "pct": 34 },
  "burnout": { "spikeRatio": 1.2, "longSessions": 0, "isBurning": false, "isOverworked": false },
  "periodDistribution": { "morning": 45, "afternoon": 30, "evening": 15, "night": 10 },
  "scoreBreakdown": {
    "taskCompletion": { "label": "Task Completion", "score": 22, "max": 30 },
    "activityConsistency": { "label": "Consistency", "score": 18, "max": 25 },
    "streak": { "label": "Daily Streak", "score": 10, "max": 20 },
    "sessionDepth": { "label": "Session Depth", "score": 12, "max": 15 },
    "highPriorityFocus": { "label": "High-Priority Focus", "score": 10, "max": 10 }
  },
  "totalActivities": 87,
  "activeDays30": 18
}
```

#### `services/insightEngine.js` — Lightweight Rule-Based Insights

A simpler, fallback insight generator used when the productivity engine is invoked without Gemini AI. Uses rule-based conditions to generate up to 4 insights from: peak time, weekly trend, streak, high-priority task backlog, task champion milestone, and low-activity warning.

#### `services/geminiService.js` — Google Gemini Wrapper

Thin wrapper around `@google/generative-ai`.

**`generate(prompt, opts)`**
- Default model: `gemini-2.0-flash`
- Default temperature: `0.7`
- Default maxTokens: `1024`
- Lazy-initialises a single `GoogleGenerativeAI` client instance (singleton pattern)

**`extractJsonArray(raw)`**
- Attempts to parse a JSON array from a Gemini response that may contain markdown fences.
- Tries: raw parse → fenced block → bracket scan. Returns `null` if all fail.

---

### 4.9 Utilities

#### `utils/jwt.js`

```js
signToken(payload)  // signs with JWT_SECRET, expires in JWT_EXPIRES_IN (default 7d)
verifyToken(token)  // verifies and returns payload; throws on invalid/expired
```

---

## 5. Frontend — Client

The frontend is a React 18 single-page application built with Vite. Styling uses **CSS Modules** — each component has its own `.module.css` file, so class names are locally scoped and there are no global naming conflicts.

### 5.1 Entry Point & Routing (`App.jsx`)

`App.jsx` defines the React Router v6 route tree. Key routing patterns:

```jsx
<Routes>
  <Route path="/"            element={<Landing />} />
  <Route path="/login"       element={<Login />} />
  <Route path="/signup"      element={<Signup />} />
  <Route path="/auth/callback" element={<OAuthCallback />} />

  {/* Protected routes — redirect to /login if unauthenticated */}
  <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/notes"       element={<ProtectedRoute><Notes /></ProtectedRoute>} />
  <Route path="/tasks"       element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
  <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
</Routes>
```

The layout wraps authenticated pages with `<Sidebar />` and `<Navbar />`.

---

### 5.2 Axios Client (`api/axios.js`)

A configured Axios instance shared by all API modules.

**Base URL:**
```js
const BASE = import.meta.env.VITE_API_URL || '';
// Dev:  '' → Vite proxy rewrites /api/* to localhost:5000/api/*
// Prod: 'https://devtrace-api.onrender.com'
```

**Request interceptor** — attaches headers from `localStorage`:
- `Authorization: Bearer <dt_token>`
- `x-session-id: <dt_session>` (stable UUID generated once per browser)

**Response interceptor** — global `401` handler:
- Clears `dt_token` and `dt_user` from `localStorage`
- Redirects to `/login` (unless already on `/login`)

**Session ID generation:** on first load, `crypto.randomUUID()` is stored as `dt_session`. This UUID is sent on every API request and stored in `Activity.metadata` for correlating actions to browser sessions.

---

### 5.3 API Modules (`api/`)

Each module exports typed wrapper functions over the Axios instance.

| Module | Exports |
|--------|---------|
| `api/auth.js` | `signup`, `login`, `getMe`, `updateProfile` |
| `api/dashboard.js` | `getDashboard` |
| `api/notes.js` | `getNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote` |
| `api/tasks.js` | `getTasks`, `createTask`, `updateTask`, `deleteTask` |
| `api/analytics.js` | `getAnalytics` |
| `api/chat.js` | `sendMessage` |

---

### 5.4 Context Providers

#### `AuthContext.jsx`

Manages the global authentication state using `useReducer`.

**State shape:**
```js
{ token: string|null, user: object|null, loading: boolean }
```

**Initialisation:** reads `dt_token` and `dt_user` from `localStorage`. If a token exists, immediately fires `GET /api/auth/me` to re-validate it server-side. If the server rejects the token, the state is cleared.

**Exported actions:**

| Function | Description |
|----------|-------------|
| `login(token, user)` | Stores token + user in localStorage, updates state |
| `logout()` | Removes from localStorage, clears state |
| `updateUser(patch)` | Merges a partial user object into state + localStorage |

**`useAuth()` hook** — shorthand for `useContext(AuthContext)`.

#### `ToastContext.jsx`

Provides a global toast notification system. The `useToast()` hook returns `toast.success(msg)` and `toast.error(msg)` functions. Toasts auto-dismiss after a configurable duration.

---

### 5.5 Pages

#### `Landing.jsx`

Public marketing page. Contains feature highlights, animated header (via `readme-typing-svg`), and CTAs linking to `/signup` and `/login`.

#### `Login.jsx` / `Signup.jsx`

Authentication forms with client-side validation:
- **Signup**: email, username, password with real-time strength meter; per-field inline error messages.
- **Login**: email + password; shows provider-specific error if account uses OAuth.

Both call the relevant `api/auth` function, then call `auth.login(token, user)` from `AuthContext` and redirect to `/dashboard`.

OAuth buttons (`Continue with Google`, `Continue with GitHub`) navigate directly to `{API_URL}/api/auth/google` and `{API_URL}/api/auth/github`.

#### `OAuthCallback.jsx`

Handles the redirect after OAuth completes. The server redirects to `/auth/callback?token=...&user=...`. This page:
1. Reads `token` and `user` from the URL query string.
2. Calls `auth.login(token, parsedUser)`.
3. Redirects to `/dashboard`.

#### `Dashboard.jsx`

The central hub of the application. Renders:

| Section | Component(s) | Data source |
|---------|-------------|-------------|
| Header greeting | Inline | `useAuth().user` |
| 4 KPI stat cards | `<StatCard>` | `stats` from `/api/dashboard` |
| 7-day activity bar chart | `<ActivityChart>` | `chart` array |
| AI intelligence insights | `<InsightCard>` | `insights` array |
| Score breakdown bars | `<ScoreBar>` (local) | `stats.scoreBreakdown` |
| Time-of-day distribution | `<PeriodChart>` (local) | `stats.periodDistribution` |
| Summary row | Inline | `stats.totalNotes`, task counts |
| Momentum badge | `<MomentumBadge>` (local) | `stats.weeklyTrend` |
| AI chat | `<ChatPanel>` | `/api/chat` |

All sections use `IntersectionObserver` for animated bar fills triggered on scroll.

#### `Notes.jsx`

Full notes management page:
- Paginated grid of `<NoteCard>` components
- Search input (client-side filtering across title, content, tags)
- Filter tabs: "All notes" / "Pinned"
- Tag cloud (auto-generated from loaded notes)
- Double-click-to-confirm delete (3-second timeout)
- Create/Edit via `<NoteModal>` overlay

#### `Tasks.jsx`

Task management with:
- Inline task creation form (title, description, priority selector)
- Status filter tabs with live counts (All / To Do / In Progress / Done)
- `<TaskItem>` components with inline status and priority update controls

#### `Profile.jsx`

User profile and settings:
- Displays username, email, avatar, streak days, total sessions
- **Edit username** form with live validation
- **Change password** form (hidden for OAuth accounts with a contextual message)
- OAuth users see their provider badge

---

### 5.6 Components

#### `<StatCard>`

A KPI display card with:
- Props: `icon`, `label`, `value`, `sub`, `color`, `loading`
- Shows a skeleton animation when `loading={true}`
- Color variants: `primary`, `warning`, `accent`, `success`

#### `<ActivityChart>`

Renders the 7-day activity bar chart.
- Props: `data` (array of `{ date, count }`), `loading`
- Pure CSS custom-property bars (no external charting library)

#### `<InsightCard>`

Displays a single AI insight.
- Props: `icon`, `title`, `message`, `type`
- Type-specific accent colours

#### `<ChatPanel>`

Slide-in right-panel AI chat interface.
- Manages local conversation history (array of `{ role, content }`)
- Sends history + new message to `/api/chat`
- Shows pre-loaded suggestion chips on first open
- Handles loading state with animated ellipsis
- Props: `onClose` callback

#### `<NoteCard>`

Grid card for a note.
- Displays title, truncated content, tags, pinned indicator, timestamp
- Click → open edit modal
- Delete button with double-click confirmation

#### `<NoteModal>`

Modal overlay for creating/editing notes.
- Props: `note` (null = create mode), `onSave`, `onClose`, `saving`
- Fields: title, content (textarea), tags (comma-separated), isPinned toggle

#### `<TaskItem>`

Row component for a single task.
- Inline status selector (badge style)
- Priority selector
- Delete button
- Calls `onUpdate` / `onDelete` callbacks

#### `<Sidebar>`

Left navigation drawer with links to Dashboard, Notes, Tasks, Profile, and a Logout button. Highlights the active route.

#### `<Navbar>`

Top bar with the DevTrace logo and mobile hamburger toggle for the sidebar.

---

## 6. Authentication Flow

### 6.1 Email / Password

```
Browser                          Server                        MongoDB
   │                                │                               │
   │  POST /api/auth/signup         │                               │
   │  { email, password, username } │                               │
   │───────────────────────────────►│                               │
   │                                │  User.create(...)             │
   │                                │──────────────────────────────►│
   │                                │  bcrypt.hash(password, 12)    │
   │                                │◄──────────────────────────────│
   │                                │  signToken({ id: user._id })  │
   │◄───────────────────────────────│                               │
   │  { token, user }               │  logActivity('signup')        │
   │                                │  updateSessionStats()         │
   │  localStorage.dt_token = token │                               │
   │  → redirect to /dashboard      │                               │
```

### 6.2 Google OAuth

```
Browser               Server                    Google            MongoDB
   │                     │                          │                  │
   │  GET /api/auth/google│                          │                  │
   │────────────────────►│                          │                  │
   │  302 → Google login  │                          │                  │
   │◄────────────────────│                          │                  │
   │                     │                          │                  │
   │  (user authenticates with Google)              │                  │
   │                     │◄─────────────────────────│                  │
   │                     │  profile                 │                  │
   │                     │  findOrCreateOAuthUser() │                  │
   │                     │─────────────────────────────────────────►  │
   │                     │◄─────────────────────────────────────────  │
   │                     │  signToken(...)          │                  │
   │  302 /auth/callback?token=…&user=…             │                  │
   │◄────────────────────│                          │                  │
   │  OAuthCallback.jsx reads URL params            │                  │
   │  auth.login(token, user)                       │                  │
   │  → redirect /dashboard                         │                  │
```

### 6.3 GitHub OAuth

Identical flow to Google, using `passport-github2` strategy with `scope: ['user:email']`.

### 6.4 Token Lifecycle

| Event | Action |
|-------|--------|
| Login / Signup | JWT signed with `JWT_SECRET`, expires in `JWT_EXPIRES_IN` (default 7 days) |
| Every request | Token read from `localStorage.dt_token` and attached as `Authorization: Bearer ...` |
| App mount | `GET /api/auth/me` re-validates the stored token server-side |
| `401` response | Token + user cleared from localStorage; redirect to `/login` |
| Token expiry | Server returns `401 Token expired`; handled by response interceptor |

---

## 7. Productivity Engine

### 7.1 Scoring Model

The productivity score is a **weighted composite of five factors**, each with a fixed maximum:

| Factor | Weight | What it measures |
|--------|--------|-----------------|
| Task Completion | 30 pts | Ratio of done tasks to total tasks |
| Activity Consistency | 25 pts | Regularity of daily activity (penalises gaps and variability) |
| Daily Streak | 20 pts | Consecutive login days |
| Session Depth | 15 pts | Average number of actions per work session |
| High-Priority Focus | 10 pts | Completion rate of high-priority tasks specifically |
| **Total** | **100 pts** | |

### 7.2 Score Components

#### Task Completion (30 pts)
```
score = round(doneTasks / totalTasks × 30)
```
If there are no tasks, returns 0.

#### Activity Consistency (25 pts)
Uses two penalties derived from the last 30-day daily activity series:
- **CV penalty** (Coefficient of Variation, 0–1): punishes high variance in daily activity volume.
- **Zero-day penalty**: fraction of days with zero activity.

```
raw = 25 × (1 − cv_penalty × 0.6 − zero_penalty × 0.4)
score = max(0, round(raw))
```
If fewer than 3 data points, returns 40% of max as a "not enough data" neutral score.

#### Daily Streak (20 pts)
Linear mapping — 10+ consecutive days = full 20 pts:
```
score = clampMap(streakDays, 0, 10, 20)
```

#### Session Depth (15 pts)
Average actions per session. 8+ actions = full 15 pts. Sessions are defined as groups of activity records separated by less than a 2-hour gap:
```
score = clampMap(avgActionsPerSession, 1, 8, 15)
```

#### High-Priority Focus (10 pts)
```
if no high-priority tasks: return 5  (neutral)
score = round(highDone / highTotal × 10)
```

### 7.3 Additional Signals

#### Peak Time Detection

Builds 24-bucket hourly and 7-bucket day-of-week histograms from all activity timestamps. Identifies:
- `peakHour`: the hour index (0–23) with the most activity
- `peakPeriod`: classified into `morning` / `afternoon` / `evening` / `night`
- `periodDistribution`: percentage of total activity in each period
- `peakDayName`: most active day of the week

#### Weekly Momentum (OLS Linear Regression)

Builds a 14-day daily activity count series and fits a linear regression line (Ordinary Least Squares) to detect trajectory:

```
slope > +0.4  → 'rising'
slope < -0.4  → 'falling'
otherwise     → 'stable'
```

Also computes `weekDelta` as the percentage change in total activity this week vs last week.

#### Burnout / Overwork Detection

Analyses the last 7 days:
- `spikeRatio` = max single-day count ÷ average daily count
- `isBurning` = `spikeRatio > 3 AND mean > 10`
- Counts sessions longer than 4 hours
- `isOverworked` = 3+ long sessions in the window

#### Session Segmentation

```js
// Gap threshold: 2 hours
function segmentSessions(activities, gapMs = 2 * 3600 * 1000)
```
Adjacent activity records within 2 hours of each other belong to the same session. This is used for depth scoring and burnout detection.

### 7.4 Insight Generation

The productivity engine generates **up to 5 prioritised insight objects**. Each insight has:
```json
{
  "type": "trend_up",
  "icon": "📈",
  "title": "Strong Upward Momentum",
  "message": "Activity is up 34% compared to last week. ...",
  "priority": 9
}
```

Insight types and trigger conditions:

| Type | Trigger |
|------|---------|
| `peak_time` | More than 5 total activities recorded |
| `trend_up` | OLS direction = `'rising'` AND weekDelta > 10% |
| `trend_down` | OLS direction = `'falling'` AND weekDelta < −10% |
| `stable` | OLS direction = `'stable'` |
| `streak` | Streak ≥ 7 days |
| `burnout` | `isBurning = true` |
| `overwork` | `isOverworked = true` |
| `high_priority` | Pending high-priority tasks > 0 |
| `task_champion` | Task completion ≥ 80% |
| `low_activity` | < 5 activities in last 30 days |

Insights are sorted by `priority` (descending) and only the top 5 are returned.

### 7.5 Grade System

| Score | Grade | Label | Colour |
|-------|-------|-------|--------|
| 90–100 | A+ | Exceptional | `#6366f1` |
| 75–89 | A | Excellent | `#10b981` |
| 60–74 | B | Good | `#22c55e` |
| 45–59 | C | Average | `#f59e0b` |
| 0–44 | D | Needs improvement | `#ef4444` |

---

## 8. Gemini AI Chat Integration

### Architecture

```
Client (ChatPanel)          Server (/api/chat)          Gemini API
      │                           │                           │
      │  POST /api/chat           │                           │
      │  { message, history[] }   │                           │
      │──────────────────────────►│                           │
      │                           │  runProductivityEngine()  │
      │                           │  → live stats             │
      │                           │                           │
      │                           │  Build systemContext      │
      │                           │  (stats injected)         │
      │                           │                           │
      │                           │  generate(fullPrompt)     │
      │                           │──────────────────────────►│
      │                           │◄──────────────────────────│
      │                           │  reply text               │
      │◄──────────────────────────│                           │
      │  { reply }                │                           │
```

### System Context Injection

Every chat message includes a dynamically generated system preamble with the user's live data:

```
📊 PRODUCTIVITY SNAPSHOT
  • Score: 72/100 (B — Good)
  • Daily streak: 5 days
  • Total sessions: 23
  • Peak work period: Morning (around 10:00)
  • Best day of week: Wednesday
  • 14-day trend: rising (34% vs last week)
  • Tasks completed: 9 / 12
  • Notes saved: 7
  • Burnout risk: Low
```

### Conversation History

The client sends up to **8 previous turns** with each message. The server formats them as:
```
Developer: <user message>
DevTrace AI: <AI reply>
...
```

This gives the model conversational context without hitting token limits.

### Fallback

If `GEMINI_API_KEY` is not configured, `geminiService.generate()` throws. The error is caught by the centralised error handler and a 500 is returned. The rule-based `insightEngine.js` is the dashboard fallback when Gemini is unavailable.

---

## 9. Activity Tracking

Every meaningful user action produces an `Activity` record. The pattern used throughout controllers is:

```js
// Fire-and-forget — never blocks the API response
Activity.create({ userId, action, metadata: { ... } }).catch(() => {});
```

Activity records feed into:
1. **Productivity Engine** — fetches last 30 days of activities for scoring.
2. **Dashboard chart** — counts activities per day for last 7 days.
3. **Analytics endpoint** — aggregate breakdowns by action type, period, etc.
4. **Insight Engine** — trend detection and pattern analysis.

---

## 10. API Reference

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>` header.

### 10.1 Auth Endpoints

#### `POST /api/auth/signup`
Create a new local account.

**Request body:**
```json
{ "email": "user@example.com", "password": "secure123", "username": "devuser" }
```
**Validation:** email format, password ≥ 8 chars, username 2–30 alphanumeric/underscore.

**Response `201`:**
```json
{ "success": true, "token": "jwt...", "user": { "id": "...", "email": "...", "username": "..." } }
```

---

#### `POST /api/auth/login`
Authenticate with email and password.

**Request body:**
```json
{ "email": "user@example.com", "password": "secure123" }
```

**Response `200`:**
```json
{ "success": true, "token": "jwt...", "user": { ... } }
```

**Response `401`:** Wrong credentials, or account registered via OAuth (with a helpful message).

---

#### `GET /api/auth/me` 🔒
Get the currently authenticated user.

**Response `200`:**
```json
{ "success": true, "user": { "id": "...", "email": "...", "username": "...", "streakDays": 5, "totalSessions": 23 } }
```

---

#### `PATCH /api/auth/profile` 🔒
Update username and/or password.

**Request body (all fields optional):**
```json
{ "username": "newname", "currentPassword": "old123", "newPassword": "new456!" }
```

**Response `200`:**
```json
{ "success": true, "message": "Profile updated", "user": { ... } }
```

---

#### `GET /api/auth/google`
Initiates Google OAuth flow. Redirects browser to Google's login page.

#### `GET /api/auth/google/callback`
OAuth callback. Issues JWT, redirects to `{CLIENT_URL}/auth/callback?token=…&user=…`.

#### `GET /api/auth/github`
Initiates GitHub OAuth flow.

#### `GET /api/auth/github/callback`
OAuth callback. Issues JWT, redirects to `{CLIENT_URL}/auth/callback?token=…&user=…`.

---

### 10.2 Dashboard Endpoint

#### `GET /api/dashboard` 🔒
Returns the full productivity overview for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "stats": {
    "productivity": 72,
    "grade": { "grade": "B", "label": "Good", "color": "#22c55e" },
    "streak": 5,
    "totalSessions": 23,
    "mostActivePeriod": "morning",
    "mostActiveHour": 10,
    "weeklyTrend": { "direction": "rising", "slope": 0.8, "pct": 34 },
    "burnout": { "isBurning": false, "isOverworked": false },
    "periodDistribution": { "morning": 45, "afternoon": 30, "evening": 15, "night": 10 },
    "scoreBreakdown": { ... },
    "totalTasks": 12,
    "completedTasks": 9,
    "totalNotes": 7
  },
  "insights": [
    { "type": "peak_time", "icon": "🌅", "title": "Your Peak Performance Window", "message": "..." }
  ],
  "chart": [
    { "date": "2026-04-29", "count": 3 },
    { "date": "2026-04-30", "count": 7 }
  ]
}
```

---

### 10.3 Notes Endpoints

#### `GET /api/notes` 🔒
List notes for the authenticated user.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Results per page (default 20, max 100) |
| `pinned` | boolean | Filter to pinned notes only |
| `tag` | string | Filter by a specific tag |

**Response `200`:**
```json
{
  "success": true,
  "data": [...notes],
  "pagination": { "total": 42, "page": 1, "limit": 20, "pages": 3 }
}
```

---

#### `GET /api/notes/:id` 🔒
Get a single note by ID.

---

#### `POST /api/notes` 🔒
Create a new note.

**Request body:**
```json
{ "title": "My note", "content": "...", "tags": ["react", "tips"], "isPinned": false }
```

**Response `201`:**
```json
{ "success": true, "message": "Note created", "data": { ...note } }
```

---

#### `PUT /api/notes/:id` 🔒
Update a note (partial update — only supply changed fields).

**Response `200`:**
```json
{ "success": true, "message": "Note updated", "data": { ...note } }
```

---

#### `DELETE /api/notes/:id` 🔒
Delete a note.

**Response `200`:**
```json
{ "success": true, "message": "Note deleted" }
```

---

### 10.4 Tasks Endpoints

#### `GET /api/tasks` 🔒
List tasks.

**Query params:** `status` (`todo` | `in_progress` | `done`), `priority` (`low` | `medium` | `high`), `sort` (default `-createdAt`)

**Response `200`:** Array of task objects.

---

#### `POST /api/tasks` 🔒
Create a task.

**Request body:**
```json
{ "title": "Fix bug #42", "description": "...", "priority": "high" }
```

**Response `201`:** The created task object.

---

#### `PUT /api/tasks/:id` 🔒
Update a task. When `status` changes to `'done'`, `completedAt` is set automatically and a `complete_task` activity is logged.

**Request body (all optional):**
```json
{ "title": "...", "description": "...", "status": "done", "priority": "medium" }
```

---

#### `DELETE /api/tasks/:id` 🔒
Delete a task.

**Response `200`:**
```json
{ "message": "Task deleted" }
```

---

### 10.5 Analytics Endpoint

#### `GET /api/analytics` 🔒
Returns aggregated activity data for various time periods. Used for extended analytics views.

---

### 10.6 Chat Endpoint

#### `POST /api/chat` 🔒
Send a message to the Gemini AI coach.

**Request body:**
```json
{
  "message": "How can I improve my consistency?",
  "history": [
    { "role": "user", "content": "What is my score?" },
    { "role": "ai", "content": "Your score is 72/100 — that's a B grade..." }
  ]
}
```

**Response `200`:**
```json
{ "success": true, "reply": "To improve consistency, try logging in daily..." }
```

**Rate limit:** 40 requests per 15 minutes.

---

### 10.7 Activity Endpoint

#### `GET /api/activity` 🔒
Returns the authenticated user's recent activity log.

---

### 10.8 Health Check

#### `GET /health`
No authentication required. Used by load balancer probes and uptime monitoring.

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2026-05-05T14:37:03.284Z" }
```

---

## 11. Data Models (Schema Reference)

### User
```
_id           ObjectId   (auto)
email         String     unique, lowercase, required
password      String     bcrypt hash, select:false; null for OAuth
username      String     2–30 chars
provider      String     'local' | 'google' | 'github'
providerId    String     null for local
avatar        String     URL or null
streakDays    Number     ≥0
totalSessions Number     ≥0
lastActiveDate Date      null until first login
createdAt     Date       auto
updatedAt     Date       auto
```

### Note
```
_id       ObjectId   (auto)
userId    ObjectId   → User
title     String     required, max 200
content   String     max 10,000, default ''
tags      [String]   max 10 items
isPinned  Boolean    default false
createdAt Date       auto
updatedAt Date       auto
```

### Task
```
_id         ObjectId   (auto)
userId      ObjectId   → User
title       String     required, max 200
description String     max 1,000, default ''
status      String     'todo'|'in_progress'|'done'
priority    String     'low'|'medium'|'high'
completedAt Date       null unless status='done'
createdAt   Date       auto
updatedAt   Date       auto
```

### Activity
```
_id             ObjectId   (auto)
userId          ObjectId   → User
action          String     enum (see §4.3)
sessionDuration Number     seconds or null
timestamp       Date       default Date.now
metadata        Mixed      {}
```

---

## 12. Security Model

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Password storage | bcrypt | Cost factor 12 (~250ms per hash — brute-force resistant) |
| Token signing | HS256 JWT | 64-byte random `JWT_SECRET`; 7-day expiry |
| Transport | HTTPS only | Enforced by Netlify (frontend) + Render (backend) |
| Security headers | Helmet.js | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc. |
| CORS | Allowlist | Only origins in `CLIENT_URL` env var; unknown origins → 403 |
| Rate limiting | express-rate-limit | Per-route groups (see §13) |
| Payload size | express.json | Hard cap at 50 KB to prevent memory exhaustion |
| Proxy trust | `trust proxy: 1` | Accurate real IP for rate limiting behind Render LB |
| Secrets | `.env` in `.gitignore` | Zero secrets in version control |
| OAuth | Stateless JWT only | No server-side sessions; Passport without session serialisation |
| Ownership enforcement | User-scoped queries | Every Note/Task/Activity query includes `userId: req.user._id` |
| Sensitive field exclusion | Mongoose `select:false` | `password` field never returned unless explicitly requested |
| JSON serialisation | `toJSON()` override | `password`, `__v`, `providerId` stripped from all User output |

---

## 13. Rate Limiting

All rate limits use a 15-minute sliding window.

| Route Group | Limit | Rationale |
|-------------|-------|-----------|
| `/api/auth/*` | 20 req / 15 min | Blocks brute-force login/signup |
| `/api/chat` | 40 req / 15 min | Limits Gemini API cost exposure |
| All other `/api/*` | 200 req / 15 min | General DoS protection |

Rate limit headers are returned in the `RateLimit-*` format (`standardHeaders: true`). Legacy `X-RateLimit-*` headers are disabled.

---

## 14. Environment Variables

### Backend (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Sets Morgan log format; hides error details in prod |
| `PORT` | No | `5000` | HTTP listen port (Render sets this to `10000` automatically) |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/devtrace` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Min 64 random bytes. App refuses to start if missing |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration (any `ms` / `jsonwebtoken` format) |
| `CLIENT_URL` | Yes | `http://localhost:5173` | CORS allowlist. Comma-separated for multiple origins |
| `OAUTH_CALLBACK_BASE` | No | `http://localhost:5000` | Base URL for OAuth redirect URIs |
| `GOOGLE_CLIENT_ID` | No | — | Required to enable Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | — | Required to enable Google OAuth |
| `GITHUB_CLIENT_ID` | No | — | Required to enable GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | No | — | Required to enable GitHub OAuth |
| `GEMINI_API_KEY` | No | — | Required for AI chat. App runs without it (chat endpoint will error) |

**Generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`client/.env` / Vercel Environment)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No (dev) / Yes (prod) | `''` | Production backend URL, e.g. `https://devtrace-api.onrender.com`. Leave blank for local (Vite proxy handles it) |

---

## 15. Local Development Setup

### Prerequisites

- Node.js ≥ 18
- A running MongoDB instance (local or Atlas)
- (Optional) Google Cloud Console OAuth 2.0 credentials
- (Optional) GitHub OAuth App credentials
- (Optional) Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Step 1: Clone & Install

```bash
git clone https://github.com/jayaprakash2207/Devtrace.git
cd Devtrace

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Step 2: Configure Environment

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/devtrace
JWT_SECRET=<generate a 64-char hex string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OAUTH_CALLBACK_BASE=http://localhost:5000

# Optional: comment out if not needed
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

No `.env` file is needed for the client in development.

### Step 3: Run

Open two terminals:

```bash
# Terminal 1 — API server on port 5000
cd server && npm run dev
# Expected: "MongoDB connected" then "DevTrace API running on http://localhost:5000"

# Terminal 2 — React dev server on port 5173
cd client && npm run dev
# Expected: "Local: http://localhost:5173"
```

Open [http://localhost:5173](http://localhost:5173).

### Vite Proxy

In development, `client/vite.config.js` proxies requests:
```js
proxy: {
  '/api': 'http://localhost:5000'
}
```
This means the frontend calls `/api/auth/login` and Vite forwards it to `http://localhost:5000/api/auth/login` — no CORS configuration needed locally.

### Available Scripts

| Directory | Script | Effect |
|-----------|--------|--------|
| `server/` | `npm run dev` | `nodemon server.js` — auto-restart on change |
| `server/` | `npm start` | `node server.js` — production start |
| `client/` | `npm run dev` | Vite dev server with HMR |
| `client/` | `npm run build` | Production build to `dist/` |
| `client/` | `npm run preview` | Preview production build locally |

---

## 16. Deployment

### Overview

| Layer | Platform | Config file |
|-------|----------|-------------|
| Frontend | **Netlify** | `client/netlify.toml` |
| Backend | **Render** | Web Service settings |
| Database | **MongoDB Atlas** | M0 Free cluster |

### Frontend (Netlify)

`client/netlify.toml`:
```toml
[build]
  base    = "client"
  command = "npm run build"
  publish = "dist"
```

`client/public/_redirects` (SPA catch-all):
```
/*  /index.html  200
```

Required environment variable on Netlify:
```
VITE_API_URL = https://devtrace-api.onrender.com
```

### Backend (Render)

| Setting | Value |
|---------|-------|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

Required environment variables on Render (see §14 for full list):
- `NODE_ENV=production`
- `MONGO_URI=mongodb+srv://...`
- `JWT_SECRET=<64-char hex>`
- `CLIENT_URL=https://devtraceproject.netlify.app`
- OAuth keys + Gemini key

### MongoDB Atlas

1. Create M0 Free cluster.
2. Create database user with "Read and Write to any database".
3. Set Network Access to `0.0.0.0/0` (required for Render's dynamic IPs).
4. Use the SRV connection string with the `/devtrace` database name appended.

### CI/CD

Both Netlify and Render auto-deploy on every push to `main`. No additional CI configuration is needed.

---

## 17. Error Handling

### Backend

All uncaught errors in controllers are passed to `next(err)` and handled centrally in `middleware/errorHandler.js`:

```
Mongoose ValidationError  → 400  { success: false, message: "...", errors: [...] }
Mongoose CastError        → 400  "Invalid ID format"
MongoDB duplicate (11000) → 409  "already exists"
JWT errors                → 401  "Token expired" / "Invalid token"
CORS errors               → 403
All others (prod)         → 500  "Server error"
All others (dev)          → 500  full error message + stack
```

Error responses always have `{ success: false, message: "..." }` shape, with an optional `errors` array for validation failures.

### Frontend

- **API errors** — caught in `try/catch` blocks in page components; surfaced via `useToast().error(msg)`.
- **Global 401** — the Axios response interceptor automatically redirects to `/login`.
- **Loading states** — all data-fetching operations set `loading: true` immediately, rendering skeleton placeholders.
- **Empty states** — all list pages have dedicated empty-state UIs with CTAs.

---

## 18. Key Data Flows

### Dashboard Load

```
1. User navigates to /dashboard
2. Dashboard.jsx useEffect fires → getDashboard()
3. GET /api/dashboard (with Bearer token)
4. auth.js middleware: verify JWT → attach req.user
5. dashboardController.overview()
   ├── runProductivityEngine(userId, user) [parallel]
   │   ├── Fetch last 30d activities from MongoDB
   │   ├── Fetch all tasks from MongoDB
   │   ├── Compute 5 score components
   │   ├── Detect peak time, momentum, burnout
   │   ├── Generate up to 5 insights
   │   └── Return { stats, insights }
   ├── Activity.find({ last 7 days }) [parallel]
   └── Note.countDocuments() [parallel]
6. Build 7-day chart buckets
7. Write view_dashboard activity (fire-and-forget)
8. Return JSON response
9. Dashboard.jsx updates state → re-renders all panels
```

### Note Creation

```
1. User clicks "+ New note" → NoteModal opens
2. User fills form → clicks Save
3. Notes.jsx handleSave() → createNote({ title, content, tags, isPinned })
4. POST /api/notes (with Bearer token)
5. auth.js middleware
6. notesController.create()
   ├── Note.create({ userId: req.user._id, ...body })
   └── Activity.create({ action: 'create_note' })  ← fire-and-forget
7. 201 response with created note
8. Notes.jsx prepends note to local state → grid updates instantly
9. Toast: "Note created"
```

### AI Chat Message

```
1. User types message in ChatPanel → Submit
2. ChatPanel appends user message to history, calls sendMessage()
3. POST /api/chat { message, history: [...last 8 turns] }
4. chatController.chat()
   ├── runProductivityEngine() ← fetch live stats
   ├── Build systemContext string with all live numbers
   ├── Build fullPrompt (context + history + new message)
   └── geminiService.generate(fullPrompt)
       └── GoogleGenerativeAI.generateContent(prompt)
5. Response: { success: true, reply: "..." }
6. ChatPanel appends AI reply to history
7. UI scrolls to bottom
```

---

*Documentation generated from source code analysis. Last updated: 2026-05-05.*
