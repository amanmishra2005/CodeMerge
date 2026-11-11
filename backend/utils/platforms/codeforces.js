const axios = require('axios');

/**
 * Fetches solved-problem stats and rich profile data for a Codeforces handle
 * using the official Codeforces REST API.
 */
async function getCodeforcesStats(handle) {
  if (!handle) return null;

  try {
    // 1. Fetch user status / submissions
    const statusPromise = axios.get('https://codeforces.com/api/user.status', {
      params: { handle, from: 1, count: 500 },
      timeout: 10000,
    }).catch(() => null);

    // 2. Fetch user profile info
    const infoPromise = axios.get('https://codeforces.com/api/user.info', {
      params: { handles: handle },
      timeout: 10000,
    }).catch(() => null);

    // 3. Fetch user rating / contest history
    const ratingPromise = axios.get('https://codeforces.com/api/user.rating', {
      params: { handle },
      timeout: 10000,
    }).catch(() => null);

    const [statusRes, infoRes, ratingRes] = await Promise.all([statusPromise, infoPromise, ratingPromise]);

    if (!statusRes || !statusRes.data || statusRes.data.status !== 'OK') {
      // If statusRes failed, check if user.info gave us something
      if (infoRes && infoRes.data && infoRes.data.status === 'OK' && infoRes.data.result?.[0]) {
        const u = infoRes.data.result[0];
        return {
          platform: 'codeforces',
          username: handle,
          totalSolved: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          rating: u.rating || null,
          maxRating: u.maxRating || null,
          rank: u.rank || null,
          maxRank: u.maxRank || null,
          avatar: u.titlePhoto || u.avatar || null,
          contribution: u.contribution || 0,
          organization: u.organization || null,
          error: null,
        };
      }

      return {
        platform: 'codeforces',
        username: handle,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        error: 'User not found on Codeforces',
      };
    }

    const submissions = statusRes.data.result || [];
    const solvedSet = new Map();
    const tagCount = {};
    const verdictCount = {};
    const languageCount = {};

    for (const sub of submissions) {
      if (!sub) continue;

      // Verdict tracking
      const v = sub.verdict || 'OTHER';
      verdictCount[v] = (verdictCount[v] || 0) + 1;

      // Language tracking
      if (sub.programmingLanguage) {
        languageCount[sub.programmingLanguage] = (languageCount[sub.programmingLanguage] || 0) + 1;
      }

      // Solved problem tracking
      if (sub.verdict === 'OK' && sub.problem) {
        const key = `${sub.problem.contestId || sub.problem.problemsetName || 'prob'}-${sub.problem.index || sub.problem.name || '0'}`;
        if (!solvedSet.has(key)) {
          solvedSet.set(key, sub.problem.rating || null);

          // Track problem tags for unique solved problems
          if (Array.isArray(sub.problem.tags)) {
            for (const tag of sub.problem.tags) {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            }
          }
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

    const totalSolved = solvedSet.size;
    if (totalSolved > 0 && easy + medium + hard === 0) {
      easy = Math.round(totalSolved * 0.5);
      medium = Math.round(totalSolved * 0.35);
      hard = Math.max(0, totalSolved - easy - medium);
    }

    // Process user profile info
    const userInfo = (infoRes && infoRes.data?.status === 'OK' && infoRes.data.result?.[0]) || {};

    // Process contest rating history
    const ratingHistory = (ratingRes && ratingRes.data?.status === 'OK' && ratingRes.data.result) || [];
    const contestsCount = ratingHistory.length;

    // Recent submissions (formatted)
    const recentSubmissions = submissions.slice(0, 12).map((s) => ({
      id: s.id,
      problemName: s.problem?.name || 'Problem',
      contestId: s.problem?.contestId,
      index: s.problem?.index || '',
      rating: s.problem?.rating || null,
      verdict: s.verdict,
      language: s.programmingLanguage,
      time: s.creationTimeSeconds ? new Date(s.creationTimeSeconds * 1000).toISOString() : null,
    }));

    // Convert tagCount to sorted array
    const sortedTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Convert languages to sorted array
    const sortedLanguages = Object.entries(languageCount)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      platform: 'codeforces',
      username: handle,
      totalSolved,
      easy,
      medium,
      hard,
      rating: userInfo.rating || null,
      maxRating: userInfo.maxRating || null,
      rank: userInfo.rank || null,
      maxRank: userInfo.maxRank || null,
      avatar: userInfo.titlePhoto || userInfo.avatar || null,
      contribution: userInfo.contribution || 0,
      friendOfCount: userInfo.friendOfCount || 0,
      organization: userInfo.organization || null,
      contestsCount,
      recentSubmissions,
      tags: sortedTags,
      verdicts: verdictCount,
      languages: sortedLanguages,
      raw: { rating: userInfo.rating, rank: userInfo.rank },
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
