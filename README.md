# DevTrace

A production-ready SaaS-style developer activity tracking and analytics dashboard.

## Features

- **Authentication** — Secure signup/login with JWT + bcrypt, protected routes
- **User Dashboard** — Total sessions, activity streak, peak active time, productivity score
- **Activity Tracking** — Automatic login timestamps, CRUD events, session tracking
- **Task Manager** — Full create/read/update/delete with status and priority
- **AI Insight Engine** — Logic-based insights: peak activity time, weekly trends, streak milestones, high-priority alerts
- **Modern UI** — Dark SaaS design, responsive layout, CSS Modules

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Styling | CSS Modules |

## Project Structure

```
DevTrace/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # Axios API calls
│       ├── components/     # Reusable UI components
│       ├── context/        # AuthContext
│       └── pages/          # Login, Signup, Dashboard, Tasks
└── server/                 # Express backend
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth + activity tracking
    ├── models/             # Mongoose schemas
    ├── routes/             # Express routers
    ├── services/           # Insight engine
    └── utils/              # JWT helpers
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd server
npm install
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/dashboard` | Stats + AI insights |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/activity` | Paginated activity log |
| GET | `/api/activity/chart` | 7-day chart data |

## Deployment

### Backend (Railway / Render / Fly.io)

1. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
2. Deploy the `server/` folder — start command: `node server.js`

### Frontend (Vercel / Netlify)

1. Build: `cd client && npm run build`
2. Output dir: `client/dist`
3. Set `VITE_API_URL` if using a separate backend domain (update `axios.js` baseURL)

### MongoDB Atlas

Replace `MONGO_URI` in `.env` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/devtrace
```
