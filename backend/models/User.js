const mongoose = require('../mongoose-provider');
const bcrypt = require('bcryptjs');

const platformLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    username: { type: String, required: true, trim: true },
    label: { type: String, trim: true, default: '' },
    totalSolved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
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
    raw: mongoose.Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now },
    error: { type: String, default: null },
    label: { type: String, default: '' },
    id: String, // associated platform connection ID
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    platforms: { type: [platformLinkSchema], default: [] },
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
