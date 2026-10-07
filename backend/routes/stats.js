const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const getLeetCodeStats = require('../utils/platforms/leetcode');
const getCodeforcesStats = require('../utils/platforms/codeforces');
const getGfgStats = require('../utils/platforms/gfg');
const getHackerRankStats = require('../utils/platforms/hackerrank');
const getCodeChefStats = require('../utils/platforms/codechef');
const getAtCoderStats = require('../utils/platforms/atcoder');
const getGitHubStats = require('../utils/platforms/github');

const router = express.Router();

// Helper to normalize platform name strings for lookup
function normalizePlatformKey(name) {
  if (!name) return '';
  const clean = name.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'leetcode' || clean === 'lc') return 'leetcode';
  if (clean === 'codeforces' || clean === 'cf') return 'codeforces';
  if (clean === 'gfg' || clean === 'geeksforgeeks' || clean === 'geeksforgeek') return 'gfg';
  if (clean === 'codechef' || clean === 'cc') return 'codechef';
  if (clean === 'hackerrank' || clean === 'hr') return 'hackerrank';
  if (clean === 'atcoder' || clean === 'ac') return 'atcoder';
  if (clean === 'github' || clean === 'gh') return 'github';
  return clean;
}

// Canonical display labels for known platforms
const PLATFORM_CANONICAL_LABELS = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  gfg: 'GeeksforGeeks',
  hackerrank: 'HackerRank',
  codechef: 'CodeChef',
  atcoder: 'AtCoder',
  github: 'GitHub',
};

// Helper to normalize platforms object into an array for legacy accounts
function normalizePlatforms(platforms) {
  if (Array.isArray(platforms)) {
    return platforms;
  }
  if (platforms && typeof platforms === 'object') {
    const list = [];
    const keys = ['leetcode', 'codeforces', 'gfg', 'geeksforgeeks', 'hackerrank', 'codechef', 'atcoder', 'github'];
    for (const k of keys) {
      const val = platforms[k];
      if (val) {
        const username = typeof val === 'string' ? val : val.username;
        if (username) {
          const normKey = normalizePlatformKey(k);
          const label = PLATFORM_CANONICAL_LABELS[normKey] || k;
          list.push({ platform: label, username, label: typeof val === 'object' ? val.label || '' : '' });
        }
      }
    }
    return list;
  }
  return [];
}

const fetchers = {
  leetcode: getLeetCodeStats,
  codeforces: getCodeforcesStats,
  gfg: getGfgStats,
  hackerrank: getHackerRankStats,
  codechef: getCodeChefStats,
  atcoder: getAtCoderStats,
  github: getGitHubStats,
};

// Core helper to fetch stats for all platforms of a user and compute totals
async function executeRefreshForUser(user) {
  const platforms = user.platforms || [];

  const results = await Promise.all(
    platforms.map(async (p) => {
      if (!p.username) return null;
      const key = normalizePlatformKey(p.platform);
      const fetcher = fetchers[key];

      if (fetcher) {
        try {
          const stats = await fetcher(p.username);
          if (stats) {
            const isGitHub = key === 'github';
            const easy = Number(stats.easy) || Number(p.easy) || 0;
            const medium = Number(stats.medium) || Number(p.medium) || 0;
            const hard = Number(stats.hard) || Number(p.hard) || 0;
            const sumDiff = easy + medium + hard;
            const totalSolved = isGitHub
              ? 0
              : Math.max(Number(stats.totalSolved) || Number(p.totalSolved) || 0, sumDiff);

            return {
              ...stats,
              platform: PLATFORM_CANONICAL_LABELS[key] || p.platform,
              label: p.label || '',
              id: p._id ? p._id.toString() : '',
              totalSolved,
              easy,
              medium,
              hard,
              error: stats.error || null,
            };
          }
        } catch (fetchErr) {
          const easy = Number(p.easy) || 0;
          const medium = Number(p.medium) || 0;
          const hard = Number(p.hard) || 0;
          return {
            platform: PLATFORM_CANONICAL_LABELS[key] || p.platform,
            username: p.username,
            totalSolved: Math.max(Number(p.totalSolved) || 0, easy + medium + hard),
            easy,
            medium,
            hard,
            label: p.label || '',
            id: p._id ? p._id.toString() : '',
            error: fetchErr.message || 'Could not fetch stats.',
          };
        }
        return null;
      } else {
        // Custom platform - return manually entered stats
        const easy = Number(p.easy) || 0;
        const medium = Number(p.medium) || 0;
        const hard = Number(p.hard) || 0;
        const totalSolved = Math.max(Number(p.totalSolved) || 0, easy + medium + hard);
        return {
          platform: p.platform,
          username: p.username,
          totalSolved,
          easy,
          medium,
          hard,
          label: p.label || '',
          id: p._id ? p._id.toString() : '',
          error: null,
        };
      }
    })
  );

  const snapshots = results.filter(Boolean);
  user.lastStats = snapshots;
  await user.save();

  return computeTotalsForSnapshots(snapshots);
}

// Calculate total problems solved and difficulty breakdown across coding platforms
function computeTotalsForSnapshots(snapshots) {
  const codingSnapshots = (snapshots || []).filter(
    (s) => normalizePlatformKey(s.platform) !== 'github'
  );

  const totals = codingSnapshots.reduce(
    (acc, s) => {
      const easy = Number(s.easy) || 0;
      const medium = Number(s.medium) || 0;
      const hard = Number(s.hard) || 0;
      const solved = Math.max(Number(s.totalSolved) || 0, easy + medium + hard);

      acc.totalSolved += solved;
      acc.easy += easy;
      acc.medium += medium;
      acc.hard += hard;
      return acc;
    },
    { totalSolved: 0, easy: 0, medium: 0, hard: 0 }
  );

  totals.totalSolved = Math.max(totals.totalSolved, totals.easy + totals.medium + totals.hard);
  return { platforms: snapshots, totals };
}

// @route  PUT /api/stats/platforms
// @desc   Save/update linked platform usernames for the logged-in user
router.put('/platforms', protect, async (req, res) => {
  try {
    let platformsInput = req.body.platforms !== undefined ? req.body.platforms : req.body;

    if (!Array.isArray(platformsInput)) {
      platformsInput = normalizePlatforms(platformsInput);
    }

    req.user.platforms = platformsInput
      .map((p) => {
        const normKey = normalizePlatformKey(p.platform);
        const canonLabel = PLATFORM_CANONICAL_LABELS[normKey] || (p.platform || '').trim();
        return {
          platform: canonLabel,
          username: (p.username || '').trim(),
          label: (p.label || '').trim(),
          totalSolved: Number(p.totalSolved) || 0,
          easy: Number(p.easy) || 0,
          medium: Number(p.medium) || 0,
          hard: Number(p.hard) || 0,
        };
      })
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

    const { platforms, totals } = await executeRefreshForUser(req.user);
    res.json({ platforms, totals });
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh stats', error: err.message });
  }
});

// @route  GET /api/stats/me
// @desc   Return the last saved stats snapshot without re-fetching, or auto-refresh if empty
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

    const rawSnapshots = req.user.lastStats || [];
    const platforms = req.user.platforms || [];

    // Check if any platform in user.platforms is missing from rawSnapshots
    const hasMissingPlatform = platforms.some(
      (p) => !rawSnapshots.some((s) => normalizePlatformKey(s.platform) === normalizePlatformKey(p.platform))
    );

    // If user has linked platforms but no stats snapshot exists yet or a platform is missing, automatically refresh
    if ((rawSnapshots.length === 0 || hasMissingPlatform) && platforms.length > 0) {
      const refreshed = await executeRefreshForUser(req.user);
      return res.json(refreshed);
    }

    // Ensure snapshots have properly calculated non-zero totalSolved
    const cleanSnapshots = rawSnapshots.map((s) => {
      const isGH = normalizePlatformKey(s.platform) === 'github';
      const easy = Number(s.easy) || 0;
      const medium = Number(s.medium) || 0;
      const hard = Number(s.hard) || 0;
      const sumDiff = easy + medium + hard;
      const totalSolved = isGH ? 0 : Math.max(Number(s.totalSolved) || 0, sumDiff);

      return {
        ...s,
        totalSolved,
        easy,
        medium,
        hard,
        commits: Number(s.commits) || 0,
      };
    });

    const { totals } = computeTotalsForSnapshots(cleanSnapshots);
    res.json({ platforms: cleanSnapshots, totals });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats', error: err.message });
  }
});

module.exports = router;
