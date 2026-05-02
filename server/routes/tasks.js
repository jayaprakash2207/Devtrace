const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/taskController');
const auth = require('../middleware/auth');

const taskRules = [
  body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
];

router.use(auth);
router.get('/', ctrl.list);
router.post('/', taskRules, ctrl.create);
router.put('/:id', taskRules, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
