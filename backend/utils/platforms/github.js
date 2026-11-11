const axios = require('axios');

/**
 * Fetches rich GitHub developer activity, including commits count,
 * user profile (bio, avatar, followers, public repos), and top repositories.
 */
async function getGitHubStats(username) {
  if (!username) return null;

  const headers = {
    'User-Agent': 'CodeMerge-App',
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    // 1. Commits search
    const commitUrl = `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}`;
    const commitPromise = axios.get(commitUrl, {
      timeout: 10000,
      headers: {
        ...headers,
        Accept: 'application/vnd.github.cloak-preview',
      },
    }).catch(() => null);

    // 2. User profile
    const profileUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    const profilePromise = axios.get(profileUrl, { timeout: 10000, headers }).catch(() => null);

    // 3. User repos (top 10 recent public repos)
    const reposUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=12`;
    const reposPromise = axios.get(reposUrl, { timeout: 10000, headers }).catch(() => null);

    const [commitRes, profileRes, reposRes] = await Promise.all([
      commitPromise,
      profilePromise,
      reposPromise,
    ]);

    const commitsCount = commitRes && commitRes.data && commitRes.data.total_count !== undefined
      ? commitRes.data.total_count
      : 0;

    const profile = (profileRes && profileRes.data) || null;
    const repos = Array.isArray(reposRes && reposRes.data) ? reposRes.data : [];

    // Calculate total stars across user repos and language frequencies
    let totalStars = 0;
    let totalForks = 0;
    const languageCounts = {};

    const topRepositories = repos
      .filter((r) => !r.fork)
      .slice(0, 8)
      .map((r) => {
        totalStars += r.stargazers_count || 0;
        totalForks += r.forks_count || 0;
        if (r.language) {
          languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
        }
        return {
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          url: r.html_url,
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          language: r.language,
          updatedAt: r.pushed_at || r.updated_at,
        };
      });

    const sortedLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    if (profile || commitsCount > 0 || topRepositories.length > 0) {
      return {
        platform: 'github',
        username,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        commits: commitsCount,
        avatar: profile?.avatar_url || null,
        name: profile?.name || username,
        bio: profile?.bio || null,
        company: profile?.company || null,
        location: profile?.location || null,
        blog: profile?.blog || null,
        publicRepos: profile?.public_repos !== undefined ? profile.public_repos : repos.length,
        followers: profile?.followers || 0,
        following: profile?.following || 0,
        createdAt: profile?.created_at || null,
        totalStars,
        totalForks,
        topRepositories,
        languages: sortedLanguages,
        raw: {
          commits: commitsCount,
          profile,
        },
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
        commits: 0,
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
    commits: 0,
    error: 'Could not fetch GitHub activity. Check the username or try again later.',
  };
}

module.exports = getGitHubStats;
