const Note = require('../models/Note');
const Activity = require('../models/Activity');

function logNote(userId, action, noteId) {
  Activity.create({ userId, action, metadata: { noteId } }).catch(() => {});
}

// ─── GET /notes ──────────────────────────────────────────────────────────────

/**
 * List all notes for the authenticated user.
 * Query params: pinned (bool), tag (string), page, limit
 */
exports.list = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.pinned !== undefined) filter.isPinned = req.query.pinned === 'true';
    if (req.query.tag)                  filter.tags     = req.query.tag;

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: notes,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /notes/:id ──────────────────────────────────────────────────────────

exports.get = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

// ─── POST /notes ─────────────────────────────────────────────────────────────

exports.create = async (req, res, next) => {
  try {
    const { title, content, tags, isPinned } = req.body;

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      tags: tags ?? [],
      isPinned: isPinned ?? false,
    });

    logNote(req.user._id, 'create_note', note._id);

    res.status(201).json({ success: true, message: 'Note created', data: note });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /notes/:id ──────────────────────────────────────────────────────────

exports.update = async (req, res, next) => {
  try {
    const { title, content, tags, isPinned } = req.body;

    const update = {};
    if (title    !== undefined) update.title    = title;
    if (content  !== undefined) update.content  = content;
    if (tags     !== undefined) update.tags     = tags;
    if (isPinned !== undefined) update.isPinned = isPinned;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    logNote(req.user._id, 'update_note', note._id);

    res.json({ success: true, message: 'Note updated', data: note });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /notes/:id ───────────────────────────────────────────────────────

exports.remove = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    logNote(req.user._id, 'delete_note', note._id);

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};
