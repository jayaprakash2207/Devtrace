const router  = require('express').Router();
const protect = require('../middleware/auth');
const { chat } = require('../controllers/chatController');

router.post('/', protect, chat);

module.exports = router;
