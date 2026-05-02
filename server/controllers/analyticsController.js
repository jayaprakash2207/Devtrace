const { runProductivityEngine } = require('../services/productivityEngine');

/**
 * GET /api/analytics  (protected)
 *
 * Returns the full Productivity Intelligence Engine output:
 *   - complete score breakdown (5 factors)
 *   - 14-day momentum series
 *   - hourly + daily activity buckets
 *   - period distribution (morning / afternoon / evening / night %)
 *   - burnout signals
 *   - ranked insights
 */
exports.full = async (req, res, next) => {
  try {
    const result = await runProductivityEngine(req.user._id, req.user);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
