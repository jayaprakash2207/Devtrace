const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    // password is null for OAuth users — never required at schema level
    password: {
      type:      String,
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,
    },

    username: {
      type:      String,
      trim:      true,
      minlength: 2,
      maxlength: 30,
    },

    // ── OAuth ──────────────────────────────────────────────
    provider:   { type: String, enum: ['local','google','github'], default: 'local' },
    providerId: { type: String, default: null },
    avatar:     { type: String, default: null },

    // ── Streak & session tracking (used by productivityEngine) ─
    streakDays:     { type: Number, default: 0, min: 0 },
    totalSessions:  { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: Date,   default: null },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ provider: 1, providerId: 1 });

// ── Pre-validate: local users must supply a password ──────────────────────
userSchema.pre('validate', function (next) {
  if (this.isNew && this.provider === 'local' && !this.password) {
    this.invalidate('password', 'Password is required');
  }
  next();
});

// ── Hash before save (only when password is present and dirty) ────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Constant-time compare (returns false if no password set) ─────────────
userSchema.methods.matchPassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

// ── Strip sensitive fields from JSON output ───────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.providerId;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
