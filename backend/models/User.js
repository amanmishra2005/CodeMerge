const mongoose = require('../mongoose-provider');
const bcrypt = require('bcryptjs');

const platformSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const statsSnapshotSchema = new mongoose.Schema(
  {
    platform: String,
    username: String,
    totalSolved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    raw: mongoose.Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now },
    error: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    platforms: {
      leetcode: { type: platformSchema, default: () => ({}) },
      codeforces: { type: platformSchema, default: () => ({}) },
      gfg: { type: platformSchema, default: () => ({}) },
      hackerrank: { type: platformSchema, default: () => ({}) },
    },
    lastStats: { type: [statsSnapshotSchema], default: [] },
    lastFeedback: { type: String, default: '' },
    lastFeedbackAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
