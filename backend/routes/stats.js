const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const getLeetCodeStats = require('../utils/platforms/leetcode');
const getCodeforcesStats = require('../utils/platforms/codeforces');
const getGfgStats = require('../utils/platforms/gfg');
const getHackerRankStats = require('../utils/platforms/hackerrank');
const getCodeChefStats = require('../utils/platforms/codechef');
const getAtCoderStats = require('../utils/platforms/atcoder');

const router = express.Router();

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
    if (platforms.codechef && platforms.codechef.username) {
      list.push({ platform: 'codechef', username: platforms.codechef.username, label: 'CodeChef' });
    }
    if (platforms.atcoder && platforms.atcoder.username) {
      list.push({ platform: 'atcoder', username: platforms.atcoder.username, label: 'AtCoder' });
    }
    return list;
  }
  return [];
}

// @route  PUT /api/stats/platforms
// @desc   Save/update linked platform usernames for the logged-in user
router.put('/platforms', protect, async (req, res) => {
  try {
    const { platforms } = req.body;

    if (!Array.isArray(platforms)) {
      return res.status(400).json({ message: 'Platforms must be an array' });
    }

    req.user.platforms = platforms
      .map((p) => ({
        platform: (p.platform || '').trim(),
        username: (p.username || '').trim(),
        label: (p.label || '').trim(),
        totalSolved: Number(p.totalSolved) || 0,
        easy: Number(p.easy) || 0,
        medium: Number(p.medium) || 0,
        hard: Number(p.hard) || 0
      }))
      .filter((p) => p.platform && p.username);

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
    let migrated = false;
    if (!Array.isArray(req.user.platforms)) {
      req.user.platforms = normalizePlatforms(req.user.platforms);
      migrated = true;
    }
    if (migrated) {
      await req.user.save();
    }

    const platforms = req.user.platforms || [];

    const fetchers = {
      leetcode: getLeetCodeStats,
      codeforces: getCodeforcesStats,
      gfg: getGfgStats,
      geeksforgeeks: getGfgStats,
      hackerrank: getHackerRankStats,
      codechef: getCodeChefStats,
      atcoder: getAtCoderStats,
    };

    const results = await Promise.all(
      platforms.map(async (p) => {
        if (!p.username) return null;
        const fetcher = fetchers[p.platform.toLowerCase()];
        if (fetcher) {
          const stats = await fetcher(p.username);
          if (stats) {
            return {
              ...stats,
              platform: p.platform,
              label: p.label || '',
              id: p._id ? p._id.toString() : '',
            };
          }
          return null;
        } else {
          // Custom platform - return manually entered stats
          return {
            platform: p.platform,
            username: p.username,
            totalSolved: p.totalSolved || 0,
            easy: p.easy || 0,
            medium: p.medium || 0,
            hard: p.hard || 0,
            label: p.label || '',
            id: p._id ? p._id.toString() : '',
            error: null
          };
        }
      })
    );

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
  try {
    let migrated = false;
    if (!Array.isArray(req.user.platforms)) {
      req.user.platforms = normalizePlatforms(req.user.platforms);
      migrated = true;
    }
    if (migrated) {
      await req.user.save();
    }

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
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats', error: err.message });
  }
});

module.exports = router;
