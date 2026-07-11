const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route  POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are all required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// @route  POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Helper to normalize platforms object into an array for legacy accounts
function normalizePlatforms(platforms) {
  if (Array.isArray(platforms)) {
    return platforms;
  }
  if (platforms && typeof platforms === 'object') {
    const list = [];
    if (platforms.leetcode && platforms.leetcode.username) {
      list.push({ platform: 'leetcode', username: platforms.leetcode.username, label: 'LeetCode' });
    }
    if (platforms.codeforces && platforms.codeforces.username) {
      list.push({ platform: 'codeforces', username: platforms.codeforces.username, label: 'Codeforces' });
    }
    if (platforms.gfg && platforms.gfg.username) {
      list.push({ platform: 'gfg', username: platforms.gfg.username, label: 'GeeksforGeeks' });
    }
    if (platforms.hackerrank && platforms.hackerrank.username) {
      list.push({ platform: 'hackerrank', username: platforms.hackerrank.username, label: 'HackerRank' });
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
