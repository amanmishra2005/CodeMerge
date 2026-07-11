const axios = require('axios');

/**
 * Fetches solved-question stats for a LeetCode username using LeetCode's
 * public GraphQL endpoint (the same one leetcode.com's own site uses).
 * No API key is required.
 */
async function getLeetCodeStats(username) {
  if (!username) return null;

  const query = `
    query userProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const { data } = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          Referer: `https://leetcode.com/${username}/`,
        },
        timeout: 10000,
      }
    );

    const matched = data && data.data && data.data.matchedUser;
    if (!matched) {
      return { platform: 'leetcode', username, error: 'User not found on LeetCode' };
    }

    const counts = matched.submitStatsGlobal.acSubmissionNum;
    const find = (label) => {
      const item = counts.find((c) => c.difficulty === label);
      return item ? item.count : 0;
    };

    const easy = find('Easy');
    const medium = find('Medium');
    const hard = find('Hard');
    const total = find('All');

    return {
      platform: 'leetcode',
      username,
      totalSolved: total || easy + medium + hard,
      easy,
      medium,
      hard,
      raw: matched,
      error: null,
    };
  } catch (err) {
    return {
      platform: 'leetcode',
      username,
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      error: 'Could not fetch LeetCode stats. Check the username or try again later.',
    };
  }
}

module.exports = getLeetCodeStats;
