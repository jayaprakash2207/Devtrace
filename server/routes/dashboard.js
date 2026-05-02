const router = require('express').Router();
const ctrl    = require('../controllers/dashboardController');
const protect = require('../middleware/auth');

// GET /dashboard  — aggregated stats + insights + chart
router.get('/', protect, ctrl.overview);

module.exports = router;
