const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  authLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  validatePasswordStrength,
  validateEmail,
} = require('../middleware/security');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'codemerge_default_secure_secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Dummy hash used for constant-time comparison when email is not found
const DUMMY_HASH = '$2a$12$e8Y5t1R4jO7sF1vD4qJ6xe5Zq4C2N4G6L4o2W8m1k9p3v6t2h8yza';

// @route  POST /api/auth/register
// @desc   Registers a new user with strong password enforcement & mass-assignment protection
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Strict type check to prevent object/array injection
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email, and password must be valid strings' });
    }

    const trimmedName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!trimmedName || !cleanEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are all required' });
    }

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return res.status(400).json({ message: passCheck.message });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Only persist whitelisted attributes
    const user = await User.create({
      name: trimmedName,
      email: cleanEmail,
      password,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// @route  POST /api/auth/login
// @desc   Authenticates user with rate limiting, timing-attack resistance, and input validation
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Strict type check
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password must be valid strings' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: cleanEmail });

    // Timing-attack mitigation: always perform a bcrypt comparison even if user is null
    const isMatch = user
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_HASH);

    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// @route  POST /api/auth/forgot-password
// @desc   Initiates password reset by generating a secure hashed token
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Consistent timing to prevent user enumeration
    if (!user) {
      // Simulate token generation time
      crypto.randomBytes(32);
      return res.json({
        message: 'If an account with that email exists, password reset instructions have been sent.',
      });
    }

    // Generate crypto token & SHA-256 hash
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Construct the reset URL
    const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:5180').split(',')[0].trim();
    const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;

    console.log('==================================================');
    console.log('PASSWORD RESET REQUESTED:');
    console.log(`User: ${user.email} (${user.name})`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('Valid for: 15 minutes');
    console.log('==================================================');

    // Return message and include resetUrl for immediate developer/local preview
    res.json({
      message: 'If an account with that email exists, password reset instructions have been sent.',
      // Provided for local testing and dev preview
      devResetUrl: process.env.NODE_ENV !== 'production' || clientOrigin.includes('localhost') ? resetUrl : undefined,
      expiresInMinutes: 15,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Unable to process password reset request' });
  }
});

// @route  GET /api/auth/verify-reset-token/:token
// @desc   Verifies that a reset token is valid and unexpired
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, message: 'Invalid reset token' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken });

    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or already used reset token' });
    }

    if (!user.resetPasswordExpire || new Date(user.resetPasswordExpire).getTime() < Date.now()) {
      return res.status(400).json({ valid: false, message: 'Reset token has expired. Please request a new one.' });
    }

    res.json({ valid: true, email: user.email });
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Token verification failed' });
  }
});

// @route  POST /api/auth/reset-password/:token
// @desc   Resets password with new password validation
router.post('/reset-password/:token', resetPasswordLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (typeof password !== 'string') {
      return res.status(400).json({ message: 'Password must be a valid string' });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return res.status(400).json({ message: passCheck.message });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or already used reset token' });
    }

    if (!user.resetPasswordExpire || new Date(user.resetPasswordExpire).getTime() < Date.now()) {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    // Set new password (bcrypt pre-save hook will hash it with 12 rounds)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Auto-login user with fresh JWT
    const authToken = signToken(user._id);

    res.json({
      message: 'Password reset successfully! You are now logged in.',
      token: authToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
});

// Helper to normalize platforms object into an array for legacy accounts
function normalizePlatforms(platforms) {
  if (Array.isArray(platforms)) {
    return platforms;
  }
  if (platforms && typeof platforms === 'object') {
    const list = [];
    const mapping = {
      leetcode: 'LeetCode',
      codeforces: 'Codeforces',
      gfg: 'GeeksforGeeks',
      hackerrank: 'HackerRank',
      codechef: 'CodeChef',
      atcoder: 'AtCoder',
      github: 'GitHub',
    };
    for (const [key, label] of Object.entries(mapping)) {
      const val = platforms[key];
      if (val) {
        const username = typeof val === 'string' ? val : val.username;
        if (username) {
          list.push({ platform: label, username, label: typeof val === 'object' ? val.label || '' : '' });
        }
      }
    }
    return list;
  }
  return [];
}

// @route  GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  let migrated = false;
  if (!Array.isArray(req.user.platforms)) {
    req.user.platforms = normalizePlatforms(req.user.platforms);
    migrated = true;
  }
  if (migrated) {
    await req.user.save();
  }
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
