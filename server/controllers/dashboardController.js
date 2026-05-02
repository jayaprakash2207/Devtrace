const Activity              = require('../models/Activity');
const Note                  = require('../models/Note');
const { runProductivityEngine } = require('../services/productivityEngine');

/**
 * GET /api/dashboard  (protected)
 *
 * Returns a single aggregated payload:
 *   - stats (kpi cards + score breakdown + period distribution)
 *   - insights (engine-generated, priority-ranked)
 *   - chart  (7-day daily activity series)
 */
exports.overview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const [engineResult, recentActivities, totalNotes] = await Promise.all([
      runProductivityEngine(userId, req.user),
      Activity.find({ userId, timestamp: { $gte: sevenDaysAgo } })
        .sort({ timestamp: 1 })
        .lean(),
      Note.countDocuments({ userId }),
    ]);

    // Build 7-day chart (pre-filled so gaps show as zero)
    const buckets = {};
    for (let i = 6; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    recentActivities.forEach((a) => {
      const key = new Date(a.timestamp).toISOString().slice(0, 10);
      if (key in buckets) buckets[key]++;
    });

    const chartData = Object.entries(buckets).map(([date, count]) => ({ date, count }));

    Activity.create({ userId, action: 'view_dashboard' }).catch(() => {});

    res.json({
      success: true,
      stats: {
        ...engineResult.stats,
        totalNotes,
      },
      insights: engineResult.insights,
      chart:    chartData,
    });
  } catch (err) {
    next(err);
  }
};
