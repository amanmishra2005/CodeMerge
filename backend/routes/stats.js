const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const getLeetCodeStats = require('../utils/platforms/leetcode');
const getCodeforcesStats = require('../utils/platforms/codeforces');
const getGfgStats = require('../utils/platforms/gfg');
const getHackerRankStats = require('../utils/platforms/hackerrank');

const router = express.Router();

// @route  PUT /api/stats/platforms
// @desc   Save/update linked platform usernames for the logged-in user
router.put('/platforms', protect, async (req, res) => {
  try {
    const { leetcode, codeforces, gfg, hackerrank } = req.body;

    req.user.platforms = {
      leetcode: { username: (leetcode || '').trim() },
      codeforces: { username: (codeforces || '').trim() },
      gfg: { username: (gfg || '').trim() },
      hackerrank: { username: (hackerrank || '').trim() },
    };

    await req.user.save();
    res.json({ platforms: req.user.platforms });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save platform usernames', error: err.message });
  }
});

// @route  GET /api/stats/refresh
// @desc   Fetch fresh stats from every linked platform and store a snapshot
router.get('/refresh', protect, async (req, res) => {
  try {
    const { leetcode, codeforces, gfg, hackerrank } = req.user.platforms || {};

    const results = await Promise.all([
      leetcode && leetcode.username ? getLeetCodeStats(leetcode.username) : null,
      codeforces && codeforces.username ? getCodeforcesStats(codeforces.username) : null,
      gfg && gfg.username ? getGfgStats(gfg.username) : null,
      hackerrank && hackerrank.username ? getHackerRankStats(hackerrank.username) : null,
    ]);

    const snapshots = results.filter(Boolean);

    req.user.lastStats = snapshots;
    await req.user.save();

    const totals = snapshots.reduce(
      (acc, s) => {
        acc.totalSolved += s.totalSolved || 0;
        acc.easy += s.easy || 0;
        acc.medium += s.medium || 0;
        acc.hard += s.hard || 0;
        return acc;
      },
      { totalSolved: 0, easy: 0, medium: 0, hard: 0 }
    );

    res.json({ platforms: snapshots, totals });
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh stats', error: err.message });
  }
});

// @route  GET /api/stats/me
// @desc   Return the last saved stats snapshot without re-fetching
router.get('/me', protect, async (req, res) => {
  const snapshots = req.user.lastStats || [];
  const totals = snapshots.reduce(
    (acc, s) => {
      acc.totalSolved += s.totalSolved || 0;
      acc.easy += s.easy || 0;
      acc.medium += s.medium || 0;
      acc.hard += s.hard || 0;
      return acc;
    },
    { totalSolved: 0, easy: 0, medium: 0, hard: 0 }
  );
  res.json({ platforms: snapshots, totals });
});

module.exports = router;
