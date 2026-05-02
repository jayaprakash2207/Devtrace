const User = require('../models/User');
const Activity = require('../models/Activity');
const { signToken } = require('../utils/jwt');

// ─── helpers ────────────────────────────────────────────────────────────────

function userPayload(user) {
  return { id: user._id, email: user.email, username: user.username };
}

function logActivity(userId, action) {
  // Fire-and-forget — auth events must never fail silently but also
  // must never block the response if the log write fails.
  Activity.create({ userId, action }).catch((err) =>
    console.error('Activity log error:', err.message)
  );
}

// ─── controllers ────────────────────────────────────────────────────────────

/**
 * POST /auth/signup
 * Body: { email, password, username? }
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const user = await User.create({ email, password, username });

    logActivity(user._id, 'signup');

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

/**
 * POST /auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // password is select:false — must explicitly include it
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      // Same message for both cases — prevents user enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    logActivity(user._id, 'login');

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

/**
 * GET /auth/me   (protected)
 * Returns the authenticated user's profile.
 */
exports.me = (req, res) => {
  res.json({ success: true, user: req.user });
};
