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

    const solvedMatch =
      html.match(/Total\s+Problems\s+Solved:\s*(\d+)/i) ||
      html.match(/Problems\s+Solved:\s*(\d+)/i) ||
      html.match(/Fully\s+Solved\s*\((\d+)\)/i) ||
      html.match(/problems-solved[^>]*>(\d+)</i);

    const starsMatch =
      html.match(/class=["']rating-star["'][^>]*>([^<]+)/i) ||
      html.match(/(\d+★)/) ||
      html.match(/class=["']rating["']>(\d+★)/i);

    const ratingMatch =
      html.match(/class=["']rating-number["']>(\d+)<\/div>/i) ||
      html.match(/rating-number[^>]*>(\d+)</i);

    const highestRatingMatch =
      html.match(/Highest\s+Rating\s*(\d+)/i) ||
      html.match(/highest_rating[^>]*>(\d+)</i);

    const globalRankMatch =
      html.match(/Global\s+Rank[^<]*<strong>(\d+)<\/strong>/i) ||
      html.match(/global_rank[^>]*>(\d+)</i);

    const countryRankMatch =
      html.match(/Country\s+Rank[^<]*<strong>(\d+)<\/strong>/i) ||
      html.match(/country_rank[^>]*>(\d+)</i);

    const divMatch = html.match(/\(Div\s*(\d+)\)/i);

    const stars = starsMatch ? starsMatch[1].trim() : null;
    const currentRating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;
    const highestRating = highestRatingMatch ? parseInt(highestRatingMatch[1], 10) : null;
    const globalRank = globalRankMatch ? parseInt(globalRankMatch[1], 10) : null;
    const countryRank = countryRankMatch ? parseInt(countryRankMatch[1], 10) : null;
    const division = divMatch ? `Div ${divMatch[1]}` : null;

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
        stars,
        currentRating,
        highestRating,
        globalRank,
        countryRank,
        division,
        raw: { totalSolved: total, stars, currentRating, highestRating, source: 'html_scraper' },
        error: null,
      };
    } else if (html.includes('problems-solved') || html.includes('Total Problems Solved') || html.includes('Problems Solved') || currentRating) {
      return {
        platform: 'codechef',
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        stars,
        currentRating,
        highestRating,
        globalRank,
        countryRank,
        division,
        raw: { totalSolved: 0, stars, currentRating, source: 'html_scraper' },
        error: null,
      };
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return {
        platform: 'codechef',
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        error: 'User not found on CodeChef.',
      };
    }
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
