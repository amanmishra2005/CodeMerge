/**
 * CodeMerge Proprietary Unified Developer Ranking Model
 * 
 * Computes:
 * - mergeScore: Aggregate index across DSA problem solving, competitive ratings, and GitHub open-source impact.
 * - tier: Hierarchical gamer/engineer tier from Apprentice to Legendary Titan.
 * - percentile: Global top percentile standing.
 * - estimatedRank: Global numerical rank.
 * - breakdown: Point attribution for DSA, Contest, Open-Source & Diversity multiplier.
 */

const TIERS = [
  { tier: 1, name: 'Apprentice', title: 'Code Apprentice', min: 0, max: 999, color: '#8B96AD', badge: '🌱', bgGlow: 'rgba(139, 150, 173, 0.25)' },
  { tier: 2, name: 'Knight', title: 'Algorithm Knight', min: 1000, max: 3499, color: '#3DDC84', badge: '⚔️', bgGlow: 'rgba(61, 220, 132, 0.25)' },
  { tier: 3, name: 'Specialist', title: 'System Specialist', min: 3500, max: 7999, color: '#4C8DFF', badge: '⚡', bgGlow: 'rgba(76, 141, 255, 0.25)' },
  { tier: 4, name: 'Master', title: 'Code Master', min: 8000, max: 15999, color: '#AA00AA', badge: '🔮', bgGlow: 'rgba(170, 0, 170, 0.25)' },
  { tier: 5, name: 'Grandmaster', title: 'Grandmaster', min: 16000, max: 27999, color: '#FFB454', badge: '👑', bgGlow: 'rgba(255, 180, 84, 0.25)' },
  { tier: 6, name: 'Legendary Titan', title: 'Legendary Titan', min: 28000, max: Infinity, color: '#FF5C5C', badge: '🔥', bgGlow: 'rgba(255, 92, 92, 0.25)' },
];

function calculateCodeMergeRanking(snapshots = []) {
  let easyTotal = 0;
  let mediumTotal = 0;
  let hardTotal = 0;
  let totalSolved = 0;

  let maxContestRating = 0;
  let ratingPlatform = '';
  let githubCommits = 0;
  let githubStars = 0;
  let linkedCount = 0;

  for (const s of snapshots) {
    if (!s) continue;
    const key = (s.platform || '').toLowerCase().replace(/[\s\-_]/g, '');
    
    if (key === 'github') {
      githubCommits += Number(s.commits) || (Number(s.publicRepos) * 20) || 0;
      githubStars += Number(s.totalStars) || 0;
      linkedCount++;
      continue;
    }

    linkedCount++;
    const easy = Number(s.easy) || 0;
    const medium = Number(s.medium) || 0;
    const hard = Number(s.hard) || 0;
    const solved = Math.max(Number(s.totalSolved) || 0, easy + medium + hard);

    easyTotal += easy;
    mediumTotal += medium;
    hardTotal += hard;
    totalSolved += solved;

    // Check contest ratings (Codeforces, LeetCode, CodeChef, AtCoder)
    const rating = Number(s.rating) || Number(s.contestRating) || 0;
    if (rating > maxContestRating) {
      maxContestRating = rating;
      ratingPlatform = s.platform || 'Contest';
    }
  }

  // 1. DSA Point Distribution
  // Easy = 10 pts, Medium = 35 pts, Hard = 85 pts
  const dsaPoints = (easyTotal * 10) + (mediumTotal * 35) + (hardTotal * 85);

  // 2. Contest MMR Contribution
  // Grants scaling bonuses when contest rating exceeds baseline 1000
  const contestPoints = maxContestRating > 1000
    ? Math.round((maxContestRating - 1000) * 4.5)
    : 0;

  // 3. Open Source Contribution
  // Commits: 2 pts each (capped at 2500), Stars: 25 pts each
  const commitPoints = Math.min(2500, githubCommits * 2);
  const starPoints = githubStars * 25;
  const githubPoints = commitPoints + starPoints;

  // 4. Omni-Platform Diversity Multiplier
  // Rewards engineers who master multiple distinct ecosystems
  let diversityMultiplier = 1.0;
  if (linkedCount === 2) diversityMultiplier = 1.08;
  else if (linkedCount === 3) diversityMultiplier = 1.16;
  else if (linkedCount === 4) diversityMultiplier = 1.25;
  else if (linkedCount >= 5) diversityMultiplier = 1.35;

  const rawScore = dsaPoints + contestPoints + githubPoints;
  const mergeScore = Math.round(rawScore * diversityMultiplier);

  // 5. Tier Attribution
  let currentTier = TIERS[0];
  let nextTier = TIERS[1];
  for (let i = 0; i < TIERS.length; i++) {
    if (mergeScore >= TIERS[i].min) {
      currentTier = TIERS[i];
      nextTier = TIERS[i + 1] || null;
    }
  }

  // 6. Progress toward next tier
  let progress = 100;
  let pointsNeeded = 0;
  if (nextTier) {
    const range = nextTier.min - currentTier.min;
    const gained = mergeScore - currentTier.min;
    progress = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
    pointsNeeded = Math.max(0, nextTier.min - mergeScore);
  }

  // 7. Global Percentile Curve Calculation
  let percentile = 98.0;
  if (mergeScore > 35000) percentile = 0.3;
  else if (mergeScore > 25000) percentile = 0.8;
  else if (mergeScore > 18000) percentile = 1.9;
  else if (mergeScore > 12000) percentile = 4.2;
  else if (mergeScore > 7500) percentile = 8.5;
  else if (mergeScore > 4000) percentile = 17.0;
  else if (mergeScore > 1800) percentile = 32.0;
  else if (mergeScore > 800) percentile = 54.0;
  else percentile = 80.0;

  // Global rank estimation
  const estimatedRank = Math.max(1, Math.round(percentile * 125));

  return {
    score: mergeScore,
    tier: currentTier,
    nextTier,
    progress,
    pointsNeeded,
    percentile,
    estimatedRank,
    breakdown: {
      dsaPoints,
      contestPoints,
      githubPoints,
      commitPoints,
      starPoints,
      diversityMultiplier,
      easyTotal,
      mediumTotal,
      hardTotal,
      totalSolved,
      maxContestRating,
      ratingPlatform,
      githubCommits,
      githubStars,
      linkedCount,
    },
  };
}

module.exports = {
  calculateCodeMergeRanking,
  TIERS,
};

