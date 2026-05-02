const User     = require('../models/User');
const Activity = require('../models/Activity');
const { signToken } = require('../utils/jwt');

// ─── helpers ────────────────────────────────────────────────────────────────

function userPayload(user) {
  return {
    id:       user._id,
    email:    user.email,
    username: user.username,
    avatar:   user.avatar  || null,
    provider: user.provider || 'local',
  };
}

function logActivity(userId, action) {
  Activity.create({ userId, action }).catch((err) =>
    console.error('Activity log error:', err.message)
  );
}

// Updates streakDays and totalSessions on each new login session.
// Called fire-and-forget — must never throw to the caller.
async function updateSessionStats(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastDate  = user.lastActiveDate
      ? new Date(user.lastActiveDate).toISOString().slice(0, 10)
      : null;

    // Already logged in today — only update lastActiveDate
    if (lastDate === today) {
      await User.findByIdAndUpdate(userId, { $set: { lastActiveDate: new Date() } });
      return;
    }

    let newStreak = 1;
    if (lastDate === yesterday) {
      newStreak = (user.streakDays || 0) + 1;
    }
    // Any other case (gap > 1 day or never logged in) → reset to 1

    await User.findByIdAndUpdate(userId, {
      $inc: { totalSessions: 1 },
      $set: { streakDays: newStreak, lastActiveDate: new Date() },
    });
  } catch (err) {
    console.error('Session stats error:', err.message);
  }
}

// ─── signup ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Body: { email, password, username }
 * Rules: email valid, password ≥ 8 chars, username 2-30 chars
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const user = await User.create({ email, password, username, provider: 'local' });

    logActivity(user._id, 'signup');
    updateSessionStats(user._id);

    const token = signToken({ id: user._id });

    res.status(201).json({
      success: true,
      message: 'Account created',
      token,
      user: userPayload(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── login ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Always fetch password hash for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // OAuth-registered account — guide the user to the right button
    if (user.provider !== 'local') {
      const p = user.provider.charAt(0).toUpperCase() + user.provider.slice(1);
      return res.status(401).json({
        success: false,
        message: `This account was created with ${p}. Use the "Continue with ${p}" button below.`,
      });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    logActivity(user._id, 'login');
    updateSessionStats(user._id);

    const token = signToken({ id: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userPayload(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── me ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me  (protected)
 */
exports.me = (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── oauthCallback ───────────────────────────────────────────────────────────

/**
 * Called by passport after a successful Google / GitHub OAuth round-trip.
 * Issues a JWT then redirects the browser to the SPA callback route.
 */
exports.oauthCallback = (req, res) => {
  const user  = req.user;
  const token = signToken({ id: user._id });

  logActivity(user._id, 'login');
  updateSessionStats(user._id);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const params = new URLSearchParams({
    token,
    user: JSON.stringify(userPayload(user)),
  });

  res.redirect(`${clientUrl}/auth/callback?${params}`);
};
