const mongoose = require('mongoose');

// Exhaustive action enum — extend as the app grows
const ACTIONS = [
  'login',
  'logout',
  'signup',
  'view_dashboard',
  'create_note',
  'update_note',
  'delete_note',
  'create_task',
  'update_task',
  'delete_task',
  'complete_task',
  'custom', // catch-all for client-defined events
];

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ACTIONS,
      required: [true, 'Action is required'],
    },
    sessionDuration: {
      type: Number, // seconds; null when the event has no duration concept (e.g. a point-in-time login)
      default: null,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // No automatic timestamps — timestamp field IS the record's time
    versionKey: false,
  }
);

// Compound index for the two most common query patterns
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ userId: 1, action: 1 });

module.exports = mongoose.model('Activity', activitySchema);
