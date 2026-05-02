const express    = require('express');
const router     = express.Router();
const { full } = require('../controllers/analyticsController');
const protect  = require('../middleware/auth');

router.get('/', protect, full);

module.exports = router;
