const axios = require('axios');

/**
 * Fetches the total count of commits for a GitHub user across public repositories.
 * Hits GitHub Search API with `q=author:username` and headers.
 */
async function getGitHubStats(username) {
  if (!username) return null;

  try {
    const url = `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}`;
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/vnd.github.cloak-preview',
        'User-Agent': 'CodeMerge-App'
      }
    });

    if (data && data.total_count !== undefined) {
      return {
        platform: 'github',
        username,
        totalSolved: 0, // 0 solved coding problems, as commits are displayed separately
        easy: 0,
        medium: 0,
        hard: 0,
        commits: data.total_count,
        raw: data,
        error: null,
      };
    }
  } catch (err) {
    if (err.response && (err.response.status === 422 || err.response.status === 404)) {
      return {
        platform: 'github',
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        error: 'User not found on GitHub.',
      };
    }
  }

  return {
    platform: 'github',
    username,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    error: 'Could not fetch GitHub commits. Check the username or try again later.',
  };
}

module.exports = getGitHubStats;
