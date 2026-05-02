const router   = require('express').Router();
const { body } = require('express-validator');
const passport = require('passport');
const ctrl     = require('../controllers/authController');
const protect  = require('../middleware/auth');
const validate = require('../middleware/validate');

// Load passport strategies (no-op if env vars not set)
require('../config/passport');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Validation rules ─────────────────────────────────────────────────────────

const signupRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 30 }).withMessage('Username must be 2–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers, and underscores'),
  body('email')
    .isEmail().withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Local auth ───────────────────────────────────────────────────────────────

router.post('/signup',   signupRules, validate, ctrl.signup);
router.post('/login',    loginRules,  validate, ctrl.login);
router.get('/me',        protect, ctrl.me);
router.patch('/profile', protect, ctrl.updateProfile);

// ── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=oauth_failed`,
  }),
  ctrl.oauthCallback
);

// ── GitHub OAuth ─────────────────────────────────────────────────────────────

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get('/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=oauth_failed`,
  }),
  ctrl.oauthCallback
);

module.exports = router;
