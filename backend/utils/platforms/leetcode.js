const axios = require('axios');

/**
 * Fetches rich solved-question and profile stats for a LeetCode username using LeetCode's
 * public GraphQL endpoint.
 */
async function getLeetCodeStats(username) {
  if (!username) return null;

  const fullQuery = `
    query userFullDetails($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          userAvatar
          reputation
          starRating
          aboutMe
          school
          countryName
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        badges {
          id
          displayName
          icon
          creationDate
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
          name
        }
      }
      recentSubmissionList(username: $username) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  const fallbackQuery = `
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

  const headers = {
    'Content-Type': 'application/json',
    Referer: `https://leetcode.com/${username}/`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  let responseData = null;

  // Try full rich query first
  try {
    const { data } = await axios.post(
      'https://leetcode.com/graphql',
      { query: fullQuery, variables: { username } },
      { headers, timeout: 12000 }
    );
    if (data && data.data && data.data.matchedUser) {
      responseData = data.data;
    }
  } catch (err) {
    // If rich query failed, try basic fallback query
  }

  // Fallback to basic query if needed
  if (!responseData) {
    try {
      const { data } = await axios.post(
        'https://leetcode.com/graphql',
        { query: fallbackQuery, variables: { username } },
        { headers, timeout: 10000 }
      );
      if (data && data.data && data.data.matchedUser) {
        responseData = data.data;
      }
    } catch (fallbackErr) {
      // Handled below
    }
  }

  if (!responseData || !responseData.matchedUser) {
    return {
      platform: 'leetcode',
      username,
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      error: 'User not found on LeetCode or profile is private',
    };
  }

  const matched = responseData.matchedUser;
  const acCounts = (matched.submitStatsGlobal && matched.submitStatsGlobal.acSubmissionNum) || [];
  const totalSubmissions = (matched.submitStatsGlobal && matched.submitStatsGlobal.totalSubmissionNum) || [];

  const findAc = (label) => {
    const item = acCounts.find((c) => c.difficulty === label);
    return item ? Number(item.count) || 0 : 0;
  };

  const findTotalSub = (label) => {
    const item = totalSubmissions.find((c) => c.difficulty === label);
    return item ? Number(item.submissions) || 0 : 0;
  };

  const easy = findAc('Easy');
  const medium = findAc('Medium');
  const hard = findAc('Hard');
  const total = findAc('All');
  const totalSolved = total || (easy + medium + hard);

  // Compute acceptance rate if available
  const allAcSubmissions = findTotalSub('All') || 0;
  const allSubmissionsCount = totalSubmissions.reduce((acc, curr) => acc + (Number(curr.submissions) || 0), 0);
  let acceptanceRate = null;
  if (allSubmissionsCount > 0 && allAcSubmissions > 0) {
    acceptanceRate = ((allAcSubmissions / allSubmissionsCount) * 100).toFixed(1);
  }

  // Contest metrics
  const contestInfo = responseData.userContestRanking;
  const contest = contestInfo
    ? {
        rating: Math.round(Number(contestInfo.rating) || 0),
        globalRanking: contestInfo.globalRanking || null,
        topPercentage: contestInfo.topPercentage ? Number(contestInfo.topPercentage).toFixed(2) : null,
        attendedContestsCount: contestInfo.attendedContestsCount || 0,
        badge: contestInfo.badge?.name || null,
      }
    : null;

  return {
    platform: 'leetcode',
    username,
    totalSolved: Math.max(totalSolved, easy + medium + hard),
    easy,
    medium,
    hard,
    ranking: matched.profile?.ranking || null,
    avatar: matched.profile?.userAvatar || null,
    reputation: matched.profile?.reputation || 0,
    country: matched.profile?.countryName || null,
    school: matched.profile?.school || null,
    realName: matched.profile?.realName || null,
    acceptanceRate,
    contest,
    badges: Array.isArray(matched.badges) ? matched.badges : [],
    languages: Array.isArray(matched.languageProblemCount) ? matched.languageProblemCount : [],
    tagProblemCounts: matched.tagProblemCounts || null,
    recentSubmissions: Array.isArray(responseData.recentSubmissionList)
      ? responseData.recentSubmissionList.slice(0, 10)
      : [],
    raw: matched,
    error: null,
  };
}

module.exports = getLeetCodeStats;
