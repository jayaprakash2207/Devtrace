const Activity = require('../models/Activity');

// ─── POST /activity/log ──────────────────────────────────────────────────────

/**
 * Clients call this to record any trackable event.
 * Body: { action, sessionDuration?, metadata? }
 */
exports.log = async (req, res, next) => {
  try {
    const { action, sessionDuration, metadata } = req.body;

    const entry = await Activity.create({
      userId: req.user._id,
      action,
      sessionDuration: sessionDuration ?? null,
      metadata: metadata ?? {},
    });

    res.status(201).json({ success: true, activity: entry });
  } catch (err) {
    next(err);
  }
};

// ─── GET /activity ───────────────────────────────────────────────────────────

/**
 * Returns a paginated list of the authenticated user's activities.
 * Query params: page (default 1), limit (default 20, max 50)
 */
exports.list = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.action) filter.action = req.query.action;

    const [activities, total] = await Promise.all([
      Activity.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: activities,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /activity/chart ─────────────────────────────────────────────────────

/**
 * Returns daily activity counts for the last N days.
 * Query params: days (default 7)
 */
exports.chart = async (req, res, next) => {
  try {
    const days  = Math.min(90, Math.max(1, parseInt(req.query.days) || 7));
    const since = new Date(Date.now() - days * 86400000);

    const raw = await Activity.find({ userId: req.user._id, timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean();

    // Pre-fill every day so the chart never has gaps
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      buckets[key] = 0;
    }

    raw.forEach((a) => {
      const key = new Date(a.timestamp).toISOString().slice(0, 10);
      if (key in buckets) buckets[key]++;
    });

    res.json({
      success: true,
      data: Object.entries(buckets).map(([date, count]) => ({ date, count })),
    });
  } catch (err) {
    next(err);
  }
};
