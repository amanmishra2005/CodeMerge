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
const { calculateCodeMergeRanking } = require('../utils/ranking');

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

// Storage efficiency helper: Prunes large arrays to keep DB size compact and response times fast
function pruneSnapshotForStorage(rawObj) {
  if (!rawObj || typeof rawObj !== 'object') return rawObj;
  const clean = { ...rawObj };

  // Limit recent submissions to max 15 entries
  if (Array.isArray(clean.recentSubmissions)) {
    clean.recentSubmissions = clean.recentSubmissions.slice(0, 15);
  }
  delete clean.allSubmissions;

  // Limit repositories to top 8
  if (Array.isArray(clean.topRepositories)) {
    clean.topRepositories = clean.topRepositories.slice(0, 8);
  }

  // Limit problem tags to top 20
  if (Array.isArray(clean.tagProblemCounts)) {
    clean.tagProblemCounts = clean.tagProblemCounts.slice(0, 20);
  }
  if (Array.isArray(clean.problemTags)) {
    clean.problemTags = clean.problemTags.slice(0, 20);
  }

  return clean;
}

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
            const pruned = pruneSnapshotForStorage(stats);
            const isGitHub = key === 'github';
            const easy = Number(pruned.easy) || Number(p.easy) || 0;
            const medium = Number(pruned.medium) || Number(p.medium) || 0;
            const hard = Number(pruned.hard) || Number(p.hard) || 0;
            const sumDiff = easy + medium + hard;
            const totalSolved = isGitHub
              ? 0
              : Math.max(Number(pruned.totalSolved) || Number(p.totalSolved) || 0, sumDiff);

            return {
              ...pruned,
              platform: PLATFORM_CANONICAL_LABELS[key] || p.platform,
              label: p.label || '',
              id: p._id ? p._id.toString() : '',
              totalSolved,
              easy,
              medium,
              hard,
              fetchedAt: new Date(),
              error: pruned.error || null,
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
  const ranking = calculateCodeMergeRanking(snapshots);
  return { platforms: snapshots, totals, ranking };
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

    const { platforms, totals, ranking } = await executeRefreshForUser(req.user);
    res.json({ platforms, totals, ranking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh stats', error: err.message });
  }
});

// @route  GET /api/stats/refresh/:platformKey
// @desc   Fetch fresh stats for a specific platform and update user snapshot
router.get('/refresh/:platformKey', protect, async (req, res) => {
  try {
    const targetKey = normalizePlatformKey(req.params.platformKey);
    const platforms = req.user.platforms || [];
    const targetPlatform = platforms.find((p) => normalizePlatformKey(p.platform) === targetKey);

    if (!targetPlatform) {
      return res.status(404).json({ message: `Platform ${req.params.platformKey} not linked to user account.` });
    }

    const fetcher = fetchers[targetKey];
    let updatedSnapshot = null;

    if (fetcher && targetPlatform.username) {
      try {
        const stats = await fetcher(targetPlatform.username);
        const isGitHub = targetKey === 'github';
        const easy = Number(stats?.easy) || Number(targetPlatform.easy) || 0;
        const medium = Number(stats?.medium) || Number(targetPlatform.medium) || 0;
        const hard = Number(stats?.hard) || Number(targetPlatform.hard) || 0;
        const sumDiff = easy + medium + hard;
        const totalSolved = isGitHub ? 0 : Math.max(Number(stats?.totalSolved) || Number(targetPlatform.totalSolved) || 0, sumDiff);

        const pruned = pruneSnapshotForStorage(stats);
        updatedSnapshot = {
          ...pruned,
          platform: PLATFORM_CANONICAL_LABELS[targetKey] || targetPlatform.platform,
          label: targetPlatform.label || '',
          id: targetPlatform._id ? targetPlatform._id.toString() : '',
          totalSolved,
          easy,
          medium,
          hard,
          fetchedAt: new Date(),
          error: pruned?.error || null,
        };
      } catch (err) {
        updatedSnapshot = {
          platform: PLATFORM_CANONICAL_LABELS[targetKey] || targetPlatform.platform,
          username: targetPlatform.username,
          totalSolved: Math.max(Number(targetPlatform.totalSolved) || 0, (Number(targetPlatform.easy) || 0) + (Number(targetPlatform.medium) || 0) + (Number(targetPlatform.hard) || 0)),
          easy: Number(targetPlatform.easy) || 0,
          medium: Number(targetPlatform.medium) || 0,
          hard: Number(targetPlatform.hard) || 0,
          label: targetPlatform.label || '',
          error: err.message || 'Could not fetch stats.',
        };
      }
    } else {
      const easy = Number(targetPlatform.easy) || 0;
      const medium = Number(targetPlatform.medium) || 0;
      const hard = Number(targetPlatform.hard) || 0;
      updatedSnapshot = {
        platform: targetPlatform.platform,
        username: targetPlatform.username,
        totalSolved: Math.max(Number(targetPlatform.totalSolved) || 0, easy + medium + hard),
        easy,
        medium,
        hard,
        label: targetPlatform.label || '',
        id: targetPlatform._id ? targetPlatform._id.toString() : '',
        error: null,
      };
    }

    // Merge into user.lastStats
    const currentSnapshots = (req.user.lastStats || []).map((s) =>
      s && typeof s.toObject === 'function' ? s.toObject() : (s?._doc || s || {})
    );

    const existingIndex = currentSnapshots.findIndex(
      (s) => normalizePlatformKey(s.platform) === targetKey
    );

    if (existingIndex >= 0) {
      currentSnapshots[existingIndex] = updatedSnapshot;
    } else {
      currentSnapshots.push(updatedSnapshot);
    }

    req.user.lastStats = currentSnapshots;
    await req.user.save();

    const { totals, ranking } = computeTotalsForSnapshots(currentSnapshots);
    res.json({ platform: updatedSnapshot, platforms: currentSnapshots, totals, ranking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh single platform stats', error: err.message });
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

    // Ensure snapshots have properly calculated non-zero totalSolved and preserve all rich stats
    const cleanSnapshots = rawSnapshots.map((rawS) => {
      const s = rawS && typeof rawS.toObject === 'function' ? rawS.toObject() : (rawS?._doc || rawS || {});
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

    const { totals, ranking } = computeTotalsForSnapshots(cleanSnapshots);
    res.json({ platforms: cleanSnapshots, totals, ranking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats', error: err.message });
  }
});

// @route  GET /api/stats/share/:identifier
// @desc   Public endpoint - retrieve verified stats and ranking card for public sharing
router.get('/share/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ message: 'User identifier required' });
    }

    // Try finding by _id first, then by email (without domain or full)
    let user = await User.findById(identifier);
    if (!user) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const rawSnapshots = user.lastStats || [];
    const cleanSnapshots = rawSnapshots.map((rawS) => {
      const s = rawS && typeof rawS.toObject === 'function' ? rawS.toObject() : (rawS?._doc || rawS || {});
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

    const { totals, ranking } = computeTotalsForSnapshots(cleanSnapshots);

    res.json({
      user: {
        id: user._id,
        name: user.name,
      },
      platforms: cleanSnapshots,
      totals,
      ranking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve public stats', error: err.message });
  }
});

module.exports = router;
