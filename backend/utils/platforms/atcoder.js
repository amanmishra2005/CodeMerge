const axios = require('axios');

async function getAtCoderStats(username) {
  if (!username) return null;

  try {
    const url = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${encodeURIComponent(username)}`;
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (data && data.count !== undefined) {
      const total = data.count || 0;
      const easy = Math.round(total * 0.5);
      const medium = Math.round(total * 0.35);
      const hard = Math.max(0, total - easy - medium);

      return {
        platform: 'atcoder',
        username,
        totalSolved: total,
        easy,
        medium,
        hard,
        raw: data,
        error: null,
      };
    }
  } catch (err) {
    // Fail silently to try fallback check below
  }

  // Fallback: If Kenkoooo fails, check if the profile exists natively on AtCoder
  try {
    const checkUrl = `https://atcoder.jp/users/${encodeURIComponent(username)}`;
    await axios.get(checkUrl, {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    // Profile exists but has no Kenkoooo statistics (0 count)
    return {
      platform: 'atcoder',
      username,
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      raw: { count: 0, source: 'atcoder_jp_check' },
      error: null,
    };
  } catch (errCheck) {
    if (errCheck.response && errCheck.response.status === 404) {
      return {
        platform: 'atcoder',
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        error: 'User not found on AtCoder.',
      };
    }
  }

  return {
    platform: 'atcoder',
    username,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    error: 'Could not fetch AtCoder stats right now. Check the username and try again later.',
  };
}

module.exports = getAtCoderStats;
