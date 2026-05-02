const router = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/authController');
const protect  = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── Validation rule sets ─────────────────────────────────────────────────────

const signupRules = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('Username must be 2–30 characters'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Endpoints ────────────────────────────────────────────────────────────────

// POST /auth/signup
router.post('/signup', signupRules, validate, ctrl.signup);

// POST /auth/login
router.post('/login', loginRules, validate, ctrl.login);

// GET  /auth/me  — requires valid JWT
router.get('/me', protect, ctrl.me);

module.exports = router;
