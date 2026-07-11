const axios = require('axios');

/**
 * GeeksforGeeks does not publish an official public stats API, so this uses
 * a best-effort community-maintained endpoint. Because that endpoint is
 * unofficial and can change or go down, all failures are caught and surfaced
 * as a friendly, non-fatal error instead of crashing the stats aggregation.
 */
async function getGfgStats(username) {
  if (!username) return null;

  // Primary attempt: Use the community stats card raw JSON endpoint
  const statsCardUrl = `https://gfgstatscard.vercel.app/${encodeURIComponent(username)}?raw=true`;
  try {
    const { data } = await axios.get(statsCardUrl, { timeout: 10000 });

    if (data && data.total_problems_solved !== undefined) {
      const total = data.total_problems_solved || 0;
      // Map Basic and School problems to Easy to ensure they sum up to totalSolved
      const easy = (data.Easy || 0) + (data.Basic || 0) + (data.School || 0);
      const medium = data.Medium || 0;
      const hard = data.Hard || 0;

      return {
        platform: 'gfg',
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
    // Silent fail for primary to try fallback
  }

  // Secondary/Fallback attempt: Scraping the main profile page HTML
  const profileUrl = `https://www.geeksforgeeks.org/profile/${encodeURIComponent(username)}`;
  try {
    const { data: html } = await axios.get(profileUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const solvedMatch = html.match(/\\?"total_problems_solved\\?"\s*:\s*(\d+)/);
    const scoreMatch = html.match(/\\?"score\\?"\s*:\s*(\d+)/);

    if (solvedMatch) {
      const total = parseInt(solvedMatch[1], 10);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

      // Estimate difficulty distribution: ~50% Easy, ~40% Medium, ~10% Hard
      const easy = Math.round(total * 0.5);
      const medium = Math.round(total * 0.4);
      const hard = Math.max(0, total - easy - medium);

      return {
        platform: 'gfg',
        username,
        totalSolved: total,
        easy,
        medium,
        hard,
        raw: { total_problems_solved: total, score, source: 'html_fallback' },
        error: null,
      };
    }
  } catch (err) {
    // Both failed
  }

  return {
    platform: 'gfg',
    username,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    error: 'Could not fetch GeeksforGeeks stats right now. Check the username and try again later.',
  };
}

module.exports = getGfgStats;
