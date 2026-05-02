const router = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/activityController');
const protect  = require('../middleware/auth');
const validate = require('../middleware/validate');

// All activity routes require authentication
router.use(protect);

const logRules = [
  body('action')
    .notEmpty().withMessage('action is required')
    .isIn([
      'login', 'logout', 'signup', 'view_dashboard',
      'create_note', 'update_note', 'delete_note',
      'create_task', 'update_task', 'delete_task', 'complete_task',
      'custom',
    ]).withMessage('Invalid action value'),
  body('sessionDuration')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('sessionDuration must be a non-negative number'),
];

// POST /activity/log  — client records a tracked event
router.post('/log', logRules, validate, ctrl.log);

// GET  /activity       — paginated activity list
router.get('/', ctrl.list);

// GET  /activity/chart — daily bar-chart data
router.get('/chart', ctrl.chart);

module.exports = router;
