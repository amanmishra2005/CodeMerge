const mongoose = require('../mongoose-provider');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const platformLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    username: { type: String, required: true, trim: true },
    label: { type: String, trim: true, default: '' },
    totalSolved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    commits: { type: Number, default: 0 }
  }
);

const statsSnapshotSchema = new mongoose.Schema(
  {
    platform: String,
    username: String,
    totalSolved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    commits: { type: Number, default: 0 },
    raw: mongoose.Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now },
    error: { type: String, default: null },
    label: { type: String, default: '' },
    id: String, // associated platform connection ID
  },
  { _id: false, strict: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8 },
    platforms: { type: [platformLinkSchema], default: [] },
    lastStats: { type: [statsSnapshotSchema], default: [] },
    lastFeedback: { type: String, default: '' },
    lastFeedbackAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null, index: true },
    resetPasswordExpire: { type: Date, default: null },
  },
  { timestamps: true }
);

// High-security password hashing with 12 rounds
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generates a cryptographically strong reset token and saves its SHA-256 hash
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token before storing to database so even a DB breach cannot compromise tokens
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 15 minutes
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

  return resetToken;
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
