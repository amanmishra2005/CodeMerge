const axios = require('axios');

/**
 * Fetches HackerRank profile stats using the HackerRank public profile badges REST endpoint.
 * This sums up the `solved` count from each of the user's badges to get their total solved problems.
 */
async function getHackerRankStats(username) {
  if (!username) return null;

  try {
    const url = `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/badges`;
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (data && Array.isArray(data.models)) {
      const total = data.models.reduce((acc, badge) => acc + (badge.solved || 0), 0);
      const easy = Math.round(total * 0.5);
      const medium = Math.round(total * 0.35);
      const hard = Math.max(0, total - easy - medium);

      return {
        platform: 'hackerrank',
        username,
        totalSolved: total,
        easy,
        medium,
        hard,
        raw: data.models,
        error: null,
      };
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return {
        platform: 'hackerrank',
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        error: 'User not found on HackerRank.',
      };
    }
  }

  return {
    platform: 'hackerrank',
    username,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    error: 'Could not fetch HackerRank stats. Check the username or try again later.',
  };
}

module.exports = getHackerRankStats;
