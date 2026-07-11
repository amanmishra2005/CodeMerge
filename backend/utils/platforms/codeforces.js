const axios = require('axios');

/**
 * Fetches solved-problem stats for a Codeforces handle using the official
 * Codeforces REST API (https://codeforces.com/api/user.status).
 * Codeforces has no built-in "easy/medium/hard" label, so we bucket each
 * unique accepted problem by its rating:
 *   rating <= 1200        -> easy
 *   1200 < rating <= 1900 -> medium
 *   rating > 1900         -> hard
 *   unrated problems are counted toward the total but not a bucket.
 */
async function getCodeforcesStats(handle) {
  if (!handle) return null;

  try {
    const { data } = await axios.get('https://codeforces.com/api/user.status', {
      params: { handle },
      timeout: 10000,
    });

    if (data.status !== 'OK') {
      return { platform: 'codeforces', username: handle, error: 'User not found on Codeforces' };
    }

    const solvedSet = new Map();
    for (const sub of data.result) {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId || 'gym'}-${sub.problem.index}`;
        if (!solvedSet.has(key)) {
          solvedSet.set(key, sub.problem.rating || null);
        }
      }
    }

    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const rating of solvedSet.values()) {
      if (!rating) continue;
      if (rating <= 1200) easy += 1;
      else if (rating <= 1900) medium += 1;
      else hard += 1;
    }

    return {
      platform: 'codeforces',
      username: handle,
      totalSolved: solvedSet.size,
      easy,
      medium,
      hard,
      raw: { rating: undefined },
      error: null,
    };
  } catch (err) {
    return {
      platform: 'codeforces',
      username: handle,
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      error: 'Could not fetch Codeforces stats. Check the handle or try again later.',
    };
  }
}

module.exports = getCodeforcesStats;
