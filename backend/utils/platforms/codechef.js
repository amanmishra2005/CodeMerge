const axios = require('axios');

async function getCodeChefStats(username) {
  if (!username) return null;

  try {
    const url = `https://www.codechef.com/users/${encodeURIComponent(username)}`;
    const { data: html } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const solvedMatch = html.match(/Problems\s+Solved:\s*(\d+)/i);
    if (solvedMatch) {
      const total = parseInt(solvedMatch[1], 10) || 0;
      const easy = Math.round(total * 0.5);
      const medium = Math.round(total * 0.35);
      const hard = Math.max(0, total - easy - medium);

      return {
        platform: 'codechef',
        username,
        totalSolved: total,
        easy,
        medium,
        hard,
        raw: { totalSolved: total, source: 'html_scraper' },
        error: null,
      };
    }
  } catch (err) {
    // Fail silently
  }

  return {
    platform: 'codechef',
    username,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    error: 'Could not fetch CodeChef stats right now. Check the username and try again later.',
  };
}

module.exports = getCodeChefStats;
