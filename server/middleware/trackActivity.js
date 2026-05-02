const Activity = require('../models/Activity');

const track = (action) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 400) return;
    try {
      await Activity.create({
        userId: req.user._id,
        action,
        sessionId: req.headers['x-session-id'] || null,
        metadata: req.trackMeta || {},
      });
    } catch {
      // non-blocking — tracking failures must never break requests
    }
  });
  next();
};

module.exports = { track };
