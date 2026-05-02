const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const sessionId = (req) => req.headers['x-session-id'] || null;

exports.list = async (req, res, next) => {
  try {
    const { status, priority, sort = '-createdAt' } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const tasks = await Task.find(filter).sort(sort).lean();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const { title, description, priority } = req.body;
    const task = await Task.create({ userId: req.user._id, title, description, priority });
    await Activity.create({
      userId: req.user._id,
      action: 'create_task',
      sessionId: sessionId(req),
      metadata: { taskId: task._id, title },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority } = req.body;
    const wasCompleted = task.status !== 'done' && status === 'done';

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (wasCompleted) task.completedAt = new Date();

    await task.save();

    const action = wasCompleted ? 'complete_task' : 'update_task';
    await Activity.create({
      userId: req.user._id,
      action,
      sessionId: sessionId(req),
      metadata: { taskId: task._id, title: task.title },
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Activity.create({
      userId: req.user._id,
      action: 'delete_task',
      sessionId: sessionId(req),
      metadata: { taskId: task._id, title: task.title },
    });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
