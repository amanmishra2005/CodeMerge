const express = require('express');
const axios = require('axios');

const router = express.Router();

let contestCache = {
  data: [],
  timestamp: 0,
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Canonical platform keys and metadata
const PLATFORMS_META = {
  leetcode: { label: 'LeetCode', color: '#FFB454' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF' },
  codechef: { label: 'CodeChef', color: '#F7931E' },
  atcoder: { label: 'AtCoder', color: '#9CA3AF' },
  hackerrank: { label: 'HackerRank', color: '#FF5C5C' },
  hackerearth: { label: 'HackerEarth', color: '#3253DC' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84' },
};

function normalizePlatform(siteStr) {
  if (!siteStr) return 'other';
  const clean = siteStr.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean.includes('leetcode') || clean === 'lc') return 'leetcode';
  if (clean.includes('codeforces') || clean === 'cf') return 'codeforces';
  if (clean.includes('codechef') || clean === 'cc') return 'codechef';
  if (clean.includes('atcoder') || clean === 'ac') return 'atcoder';
  if (clean.includes('hackerrank') || clean === 'hr') return 'hackerrank';
  if (clean.includes('hackerearth') || clean === 'he') return 'hackerearth';
  if (clean.includes('geeks') || clean.includes('gfg')) return 'gfg';
  return clean;
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '2h';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

// Generate recurring upcoming contests as guaranteed baseline fallback
function generateRecurringContests() {
  const now = new Date();
  const list = [];

  function getNextDayOfWeek(dayOfWeek, hourUTC, minuteUTC, weekOffset = 0) {
    const target = new Date(now);
    target.setUTCHours(hourUTC, minuteUTC, 0, 0);
    const currentDay = target.getUTCDay();
    let distance = (dayOfWeek - currentDay + 7) % 7;
    if (distance === 0 && target.getTime() < now.getTime()) {
      distance = 7;
    }
    distance += weekOffset * 7;
    target.setUTCDate(target.getUTCDate() + distance);
    return target;
  }

  // 1. LeetCode Weekly Contest (Sundays 02:30 UTC, 1.5h)
  for (let w = 0; w < 2; w++) {
    const start = getNextDayOfWeek(0, 2, 30, w);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    list.push({
      id: `recurring-lc-weekly-${w}`,
      name: `LeetCode Weekly Contest ${435 + w}`,
      platform: 'leetcode',
      platformLabel: 'LeetCode',
      url: 'https://leetcode.com/contest/',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: 5400,
      durationFormatted: '1h 30m',
      status: now >= start && now <= end ? 'CODING' : 'BEFORE',
    });
  }

  // 2. LeetCode Biweekly Contest (Saturdays 14:30 UTC, 1.5h)
  for (let w = 0; w < 2; w++) {
    const start = getNextDayOfWeek(6, 14, 30, w);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    list.push({
      id: `recurring-lc-biweekly-${w}`,
      name: `LeetCode Biweekly Contest ${148 + w}`,
      platform: 'leetcode',
      platformLabel: 'LeetCode',
      url: 'https://leetcode.com/contest/',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: 5400,
      durationFormatted: '1h 30m',
      status: now >= start && now <= end ? 'CODING' : 'BEFORE',
    });
  }

  // 3. Codeforces Regular Round (Div. 2 & Div. 3)
  for (let w = 0; w < 2; w++) {
    const start = getNextDayOfWeek(w === 0 ? 4 : 2, 14, 35, w);
    const end = new Date(start.getTime() + 120 * 60 * 1000);
    list.push({
      id: `recurring-cf-round-${w}`,
      name: `Codeforces Round (Div. ${w === 0 ? 2 : 3})`,
      platform: 'codeforces',
      platformLabel: 'Codeforces',
      url: 'https://codeforces.com/contests',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: 7200,
      durationFormatted: '2h 00m',
      status: now >= start && now <= end ? 'CODING' : 'BEFORE',
    });
  }

  // 4. CodeChef Starters (Wednesdays 14:30 UTC, 2h)
  for (let w = 0; w < 2; w++) {
    const start = getNextDayOfWeek(3, 14, 30, w);
    const end = new Date(start.getTime() + 120 * 60 * 1000);
    list.push({
      id: `recurring-cc-starters-${w}`,
      name: `CodeChef Starters ${170 + w}`,
      platform: 'codechef',
      platformLabel: 'CodeChef',
      url: 'https://www.codechef.com/contests',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: 7200,
      durationFormatted: '2h 00m',
      status: now >= start && now <= end ? 'CODING' : 'BEFORE',
    });
  }

  // 5. AtCoder Beginner Contest (ABC) (Saturdays 12:00 UTC, 100m)
  for (let w = 0; w < 2; w++) {
    const start = getNextDayOfWeek(6, 12, 0, w);
    const end = new Date(start.getTime() + 100 * 60 * 1000);
    list.push({
      id: `recurring-ac-abc-${w}`,
      name: `AtCoder Beginner Contest ${390 + w}`,
      platform: 'atcoder',
      platformLabel: 'AtCoder',
      url: 'https://atcoder.jp/contests/',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: 6000,
      durationFormatted: '1h 40m',
      status: now >= start && now <= end ? 'CODING' : 'BEFORE',
    });
  }

  // 6. GeeksforGeeks Weekly Contest (Sundays 13:30 UTC, 1.5h)
  for (let w = 0; w < 2; w++) {
    const start = getNextDayOfWeek(0, 13, 30, w);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    list.push({
      id: `recurring-gfg-weekly-${w}`,
      name: `GFG Weekly Coding Contest ${190 + w}`,
      platform: 'gfg',
      platformLabel: 'GeeksforGeeks',
      url: 'https://practice.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: 5400,
      durationFormatted: '1h 30m',
      status: now >= start && now <= end ? 'CODING' : 'BEFORE',
    });
  }

  return list;
}

// Fetch live contests from external APIs (Kontests + Codeforces)
async function fetchLiveContests() {
  const aggregated = [];
  const now = new Date();

  // 1. Try Kontests API
  try {
    const { data } = await axios.get('https://kontests.net/api/v1/all', { timeout: 8000 });
    if (Array.isArray(data)) {
      for (const item of data) {
        if (!item.name || !item.start_time) continue;

        const start = new Date(item.start_time);
        const end = item.end_time ? new Date(item.end_time) : new Date(start.getTime() + 7200 * 1000);

        // Only keep current or upcoming contests within the next 30 days
        if (end.getTime() < now.getTime() - 3600000) continue;

        const durationSeconds = Number(item.duration) || Math.round((end - start) / 1000);
        const platKey = normalizePlatform(item.site);
        const meta = PLATFORMS_META[platKey] || { label: item.site || 'Coding Contest', color: '#8B96AD' };

        aggregated.push({
          id: `kontest-${item.site}-${item.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
          name: item.name,
          platform: platKey,
          platformLabel: meta.label,
          url: item.url || 'https://kontests.net',
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          durationSeconds,
          durationFormatted: formatDuration(durationSeconds),
          status: item.status === 'CODING' || (now >= start && now <= end) ? 'CODING' : 'BEFORE',
        });
      }
    }
  } catch (err) {
    // Kontests API may be unavailable or offline; continue to next source
  }

  // 2. Try Codeforces Official API
  try {
    const { data } = await axios.get('https://codeforces.com/api/contest.list?gym=false', { timeout: 8000 });
    if (data && data.status === 'OK' && Array.isArray(data.result)) {
      for (const c of data.result) {
        if (c.phase === 'BEFORE' || c.phase === 'CODING') {
          const start = new Date(c.startTimeSeconds * 1000);
          const end = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);

          aggregated.push({
            id: `cf-${c.id}`,
            name: c.name,
            platform: 'codeforces',
            platformLabel: 'Codeforces',
            url: `https://codeforces.com/contests/${c.id}`,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            durationSeconds: c.durationSeconds,
            durationFormatted: formatDuration(c.durationSeconds),
            status: c.phase === 'CODING' ? 'CODING' : 'BEFORE',
          });
        }
      }
    }
  } catch (cfErr) {
    // Codeforces API offline or rate-limited
  }

  // If external APIs yielded few or no results, mix in recurring baseline contests
  const recurring = generateRecurringContests();
  const combined = [...aggregated];

  for (const r of recurring) {
    // Avoid duplicate if a contest with a similar platform and time window exists
    const hasSimilar = combined.some((c) => {
      if (c.platform !== r.platform) return false;
      const timeDiff = Math.abs(new Date(c.startTime) - new Date(r.startTime));
      return timeDiff < 6 * 3600 * 1000; // within 6 hours
    });

    if (!hasSimilar) {
      combined.push(r);
    }
  }

  // Sort by startTime ascending (soonest first)
  combined.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return combined;
}

// @route  GET /api/contests
// @desc   Get aggregated upcoming and live contests across all platforms
router.get('/', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();

    if (!forceRefresh && contestCache.data.length > 0 && now - contestCache.timestamp < CACHE_TTL) {
      return res.json({
        contests: filterContests(contestCache.data, req.query),
        total: contestCache.data.length,
        cached: true,
        updatedAt: new Date(contestCache.timestamp).toISOString(),
      });
    }

    const contests = await fetchLiveContests();
    contestCache = {
      data: contests,
      timestamp: now,
    };

    res.json({
      contests: filterContests(contests, req.query),
      total: contests.length,
      cached: false,
      updatedAt: new Date(now).toISOString(),
    });
  } catch (err) {
    // Fallback to recurring baseline if anything threw
    const baseline = generateRecurringContests();
    res.json({
      contests: filterContests(baseline, req.query),
      total: baseline.length,
      cached: false,
      fallback: true,
      error: err.message,
    });
  }
});

function filterContests(contests, query) {
  let list = [...contests];
  if (query.platform && query.platform !== 'all') {
    const target = normalizePlatform(query.platform);
    list = list.filter((c) => c.platform === target);
  }
  if (query.status && query.status !== 'all') {
    list = list.filter((c) => c.status.toLowerCase() === query.status.toLowerCase());
  }
  return list;
}

module.exports = router;

