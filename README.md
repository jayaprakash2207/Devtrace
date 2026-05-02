<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=DevTrace;Developer+Productivity+Tracker;Powered+by+Gemini+AI" alt="DevTrace" />

<br />

**The full-stack developer productivity platform that thinks.**
Log sessions · Score your output · Chat with an AI coach powered by Google Gemini.

<br />

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-devtraceproject.netlify.app-6366f1?style=for-the-badge&logoColor=white)](https://devtraceproject.netlify.app)
[![Backend API](https://img.shields.io/badge/⚡%20API-devtrace--api.onrender.com-10b981?style=for-the-badge)](https://devtrace-api.onrender.com/health)
[![GitHub Repo](https://img.shields.io/badge/GitHub-jayaprakash2207%2FDevtrace-24292f?style=for-the-badge&logo=github)](https://github.com/jayaprakash2207/Devtrace)

<br />

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

</div>

---

## What is DevTrace?

DevTrace is a **production-grade, full-stack SaaS application** that helps developers understand and improve their workflow. It automatically tracks every session, computes a real-time productivity score using statistical analysis, and surfaces AI-generated insights through a **Google Gemini-powered chat assistant** — all behind a secure, rate-limited REST API.

> Built as a Round 2 submission for the **DekNek3D Full Stack Developer Internship**. Every layer of the stack — auth, database, analytics engine, AI integration, and deployment — was designed and implemented from scratch.

---

## ✨ Features

### 🔐 Multi-Provider Authentication
- Email + password signup with **bcrypt** (cost 12) password hashing
- **Google OAuth 2.0** and **GitHub OAuth** via Passport.js — fully stateless (JWT only, no sessions)
- Per-field inline validation with real-time password strength meter
- Account linking: OAuth login auto-links to existing email accounts
- Streak tracking + total session count updated on every login

### 📊 Real-Time Productivity Score
- **0–100 score** recomputed on every dashboard visit
- Backed by **OLS linear regression** for 7-day activity trend detection
- **Coefficient of Variation** for consistency measurement
- **Burnout spike detection** (single-day outlier > 2.5× mean)
- Time-of-day session segmentation: Morning / Afternoon / Evening / Night
- Letter grade system: A+ / A / B / C / D with animated color-coded breakdown bars

### 🤖 Gemini AI Chat Assistant
- Slide-in chat panel powered by **Google Gemini 2.0 Flash**
- System context includes live score, streak, peak hours, trend, tasks, and burnout flag
- Maintains **conversation history** (last 8 turns) for contextual follow-ups
- Graceful fallback to rule-based insights if Gemini is unavailable
- Rate-limited at **40 requests / 15 min** to prevent abuse
- Pre-loaded suggestion chips on first open

### ✅ Task Management
- Create, update, and delete tasks with **priority** (low / medium / high) and **status** (todo / in_progress / done)
- Task completion rate feeds directly into the productivity score
- Full CRUD REST API with input validation

### 📝 Developer Notes
- Pinnable, searchable notes with tag support
- Rich create/edit experience
- All note activity logged for streak and session tracking

### 👤 Profile Management
- Edit username with live validation
- Change password with current-password verification
- OAuth accounts display provider badge; password section shows a contextual message
- Streak days + total sessions displayed on the profile card

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│               React 18 + Vite  (CSS Modules)                 │
│          https://devtraceproject.netlify.app                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS  (VITE_API_URL)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express REST API                           │
│             https://devtrace-api.onrender.com                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  /auth   │  │  /notes  │  │  /tasks  │  │   /chat    │  │
│  │  OAuth   │  │   CRUD   │  │   CRUD   │  │   Gemini   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                                              │
│    Helmet · CORS · Morgan · express-rate-limit · Passport    │
└───────────────────────┬─────────────────────────────────────┘
                        │ Mongoose TLS (SRV)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Atlas  (M0 Free)                    │
│          Users · Notes · Tasks · Activity logs               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
DevTrace/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── api/                   # Axios modules (auth, notes, tasks, chat…)
│   │   ├── components/            # Sidebar, ChatPanel, shared UI
│   │   ├── context/               # AuthContext (JWT + updateUser), ToastContext
│   │   └── pages/                 # Landing, Login, Signup, Dashboard,
│   │                              # Notes, Tasks, Profile, OAuthCallback
│   ├── public/_redirects          # Netlify SPA routing
│   └── netlify.toml
│
└── server/                        # Node.js + Express backend
    ├── config/
    │   └── passport.js            # Google + GitHub OAuth strategies
    ├── controllers/               # auth, notes, tasks, dashboard, chat
    ├── middleware/                # auth (JWT verify), errorHandler, validate
    ├── models/                    # User, Note, Task, Activity (Mongoose)
    ├── routes/                    # auth, notes, tasks, dashboard,
    │                              # analytics, chat, activity
    ├── services/
    │   ├── geminiService.js       # Gemini 2.0 Flash wrapper + JSON extractor
    │   └── productivityEngine.js  # OLS · CV · burnout · insight generator
    └── server.js                  # Entry point + graceful SIGTERM shutdown
```

---

## 🧠 Productivity Engine

```
Raw activity logs (30 days)
         │
         ├─► Session segmentation    →  Morning / Afternoon / Evening / Night
         │
         ├─► OLS slope (7-day)       →  Momentum badge (↑ improving / ↓ declining)
         │
         ├─► Coefficient of Variation →  Consistency score component
         │
         ├─► Burnout spike detection  →  Flag if any day > 2.5× mean activity
         │
         ├─► Weighted score formula   →  0–100  +  letter grade A+/A/B/C/D
         │
         └─► Gemini 2.0 Flash         →  5 typed insight objects
             (fallback: 9-rule engine)    (tip / warning / praise / challenge / info)
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | — | Register with email + password |
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `PATCH` | `/api/auth/profile` | ✅ | Update username or password |
| `GET` | `/api/auth/google` | — | Initiate Google OAuth |
| `GET` | `/api/auth/github` | — | Initiate GitHub OAuth |
| `GET` | `/api/dashboard` | ✅ | Full productivity stats + AI insights |
| `GET` | `/api/analytics` | ✅ | Activity breakdown by period |
| `GET` / `POST` | `/api/notes` | ✅ | List / create notes |
| `PUT` / `DELETE` | `/api/notes/:id` | ✅ | Update / delete note |
| `GET` / `POST` | `/api/tasks` | ✅ | List / create tasks |
| `PUT` / `DELETE` | `/api/tasks/:id` | ✅ | Update / delete task |
| `POST` | `/api/chat` | ✅ | Send message to Gemini AI assistant |
| `GET` | `/health` | — | Health check (uptime probe) |

**Rate limits** — Auth: `20 req / 15 min` · API: `200 req / 15 min` · Chat: `40 req / 15 min`

---

## ⚙️ Local Development

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB)
- Google Cloud Console OAuth 2.0 credentials
- GitHub OAuth App credentials
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone & install

```bash
git clone https://github.com/jayaprakash2207/Devtrace.git
cd Devtrace

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devtrace
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

OAUTH_CALLBACK_BASE=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run

```bash
# Terminal 1 — API server (port 5000)
cd server && npm run dev

# Terminal 2 — React dev server (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment

| Layer | Platform | Config |
|-------|----------|--------|
| Frontend | **Netlify** | Root: `client/` · Build: `npm run build` · Publish: `dist/` |
| Backend | **Render** | Root: `server/` · Start: `node server.js` · Free Web Service |
| Database | **MongoDB Atlas** | M0 Free · IP whitelist: `0.0.0.0/0` for Render |

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete step-by-step walkthrough including OAuth setup, environment variables, and smoke-test checklist.

---

## 🔒 Security Highlights

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt, cost factor 12 |
| Token signing | 64-byte random `JWT_SECRET`, 7-day expiry |
| Security headers | Helmet.js (11 headers: CSP, HSTS, X-Frame-Options…) |
| CORS | Allowlist-only, rejects unknown origins |
| Rate limiting | express-rate-limit on all routes |
| Proxy trust | `app.set('trust proxy', 1)` for accurate IP behind Render LB |
| Secrets | `.env` gitignored — zero secrets in version control |
| OAuth | Fully stateless — no server-side sessions, JWT only |
| Payload size | Express body parser capped at 50 KB |

---

## 🛠️ Full Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, Vite, React Router v6, CSS Modules |
| HTTP client | Axios with JWT Authorization interceptor |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT, bcryptjs, Passport.js (Google + GitHub strategies) |
| AI | Google Gemini 2.0 Flash via `@google/generative-ai` |
| Security | Helmet, express-rate-limit, CORS |
| Logging | Morgan (combined in production, dev in development) |
| Validation | express-validator |
| Frontend hosting | Netlify (CDN + SPA redirects) |
| Backend hosting | Render (free Web Service) |
| Database hosting | MongoDB Atlas (M0 Free) |

---

<div align="center">

**Built from scratch · Deployed to production · Powered by Gemini AI**

[devtraceproject.netlify.app](https://devtraceproject.netlify.app) · [API Health](https://devtrace-api.onrender.com/health) · [GitHub](https://github.com/jayaprakash2207/Devtrace)

<br />

*© 2026 Jayaprakash A R*

</div>
