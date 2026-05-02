const router = require('express').Router();
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/notesController');
const protect  = require('../middleware/auth');
const validate = require('../middleware/validate');

// All notes routes require authentication
router.use(protect);

// ── Validation rule sets ─────────────────────────────────────────────────────

const noteBodyRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Content too long'),
  body('tags')
    .optional()
    .isArray({ max: 10 }).withMessage('Tags must be an array with max 10 items'),
  body('tags.*')
    .optional()
    .isString().trim().isLength({ max: 30 }).withMessage('Each tag max 30 chars'),
  body('isPinned')
    .optional()
    .isBoolean().withMessage('isPinned must be boolean'),
];

const updateRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be blank')
    .isLength({ max: 200 }),
  body('content').optional().trim().isLength({ max: 10000 }),
  body('tags').optional().isArray({ max: 10 }),
  body('tags.*').optional().isString().trim().isLength({ max: 30 }),
  body('isPinned').optional().isBoolean(),
];

const idRule = [
  param('id').isMongoId().withMessage('Invalid note ID'),
];

// ── Endpoints ────────────────────────────────────────────────────────────────

// GET    /notes
router.get('/',      ctrl.list);

// GET    /notes/:id
router.get('/:id',   idRule, validate, ctrl.get);

// POST   /notes
router.post('/',     noteBodyRules, validate, ctrl.create);

// PUT    /notes/:id
router.put('/:id',   [...idRule, ...updateRules], validate, ctrl.update);

// DELETE /notes/:id
router.delete('/:id', idRule, validate, ctrl.remove);

module.exports = router;
