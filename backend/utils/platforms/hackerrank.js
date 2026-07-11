const axios = require('axios');

/**
 * HackerRank does not offer any public/official API for a user's solved
 * problem counts, and profiles are rendered client-side, so there is no
 * reliable server-side source to scrape. Rather than silently returning
 * fake numbers, this returns a clear, explicit message so the UI can show
 * the user why HackerRank has no data yet. If HackerRank ever ships a
 * public stats API, swap the implementation below for a real fetch call.
 */
async function getHackerRankStats(username) {
  if (!username) return null;

  return {
    platform: 'hackerrank',
    username,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    error:
      'HackerRank does not provide a public API for solved-problem stats, so this platform is linked for reference only.',
  };
}

module.exports = getHackerRankStats;
