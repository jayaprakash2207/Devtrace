const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes      = require('./routes/auth');
const activityRoutes  = require('./routes/activity');
const dashboardRoutes = require('./routes/dashboard');
const notesRoutes     = require('./routes/notes');
const errorHandler    = require('./middleware/errorHandler');

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
// CLIENT_URL can be a comma-separated list for multi-origin support.
// e.g.  CLIENT_URL=https://devtrace.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl requests that send no Origin header
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  })
);

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));    // refuse oversized payloads
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// ─── Request logging ─────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ───────────────────────────────────────────────────────────
// Tight limit on auth endpoints to blunt brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many requests — try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Loose limit on the rest of the API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests — try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ──────────────────────────────────────────────────────────────────
// All routes are prefixed with /api so the Vite proxy and production
// reverse-proxies can forward /api/* without path rewriting.
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/activity',  apiLimiter,  activityRoutes);
app.use('/api/dashboard', apiLimiter,  dashboardRoutes);
app.use('/api/notes',     apiLimiter,  notesRoutes);

// Health check — useful for load-balancer probes
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 catch-all — must come before errorHandler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Centralised error handler ───────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
