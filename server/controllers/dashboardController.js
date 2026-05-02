const Activity = require('../models/Activity');
const Note = require('../models/Note');
const { generateInsights } = require('../services/insightEngine');

/**
 * GET /dashboard  (protected)
 *
 * Returns a single, aggregated payload:
 *   - kpi stats
 *   - AI-style insights
 *   - 7-day chart data (pre-fetched here to save a round-trip)
 */
exports.overview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    // Run all queries in parallel
    const [insightData, recentActivities, totalNotes] = await Promise.all([
      generateInsights(userId, req.user),
      Activity.find({ userId, timestamp: { $gte: sevenDaysAgo } })
        .sort({ timestamp: 1 })
        .lean(),
      Note.countDocuments({ userId }),
    ]);

    // Build 7-day chart inline
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

    // Log the dashboard view (non-blocking)
    Activity.create({ userId, action: 'view_dashboard' }).catch(() => {});

    res.json({
      success: true,
      stats: {
        ...insightData.stats,
        totalNotes,
      },
      insights: insightData.insights,
      chart: chartData,
    });
  } catch (err) {
    next(err);
  }
};
