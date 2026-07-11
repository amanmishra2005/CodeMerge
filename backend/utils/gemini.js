const axios = require('axios');

function generateLocalFeedback({ name, totals, perPlatform }) {
  const easyRatio = totals.totalSolved > 0 ? (totals.easy / totals.totalSolved) * 100 : 0;
  const mediumRatio = totals.totalSolved > 0 ? (totals.medium / totals.totalSolved) * 100 : 0;
  const hardRatio = totals.totalSolved > 0 ? (totals.hard / totals.totalSolved) * 100 : 0;

  let assessment = "";
  if (totals.totalSolved === 0) {
    return `Hello ${name}! It looks like you haven't solved any problems yet across your linked profiles. Connect your active platform profiles, sync your solve stats, and I'll analyze your coding fingerprint to guide your next steps!`;
  }

  if (hardRatio > 30) {
    assessment = `You have an exceptional drive for challenging algorithms, with Hard problems representing ${Math.round(hardRatio)}% of your total solved metrics. This indicates outstanding debugging capability and advanced analytical execution.`;
  } else if (mediumRatio > 40) {
    assessment = `You have established a highly effective balance, with Medium problems accounting for ${Math.round(mediumRatio)}% of your total progress. This is the ideal distribution profile for technical coding interviews.`;
  } else if (easyRatio > 60) {
    assessment = `You have built a massive fundamental foundation, logging ${totals.easy} Easy problems. To level up your engineering capabilities, try shifting your focus to medium-difficulty topics like graph theory, sliding windows, and tree manipulation.`;
  } else {
    assessment = `You have built a solid and versatile coding profile, maintaining a healthy distribution of Easy (${totals.easy}), Medium (${totals.medium}), and Hard (${totals.hard}) problems. This consistency is highly valuable.`;
  }

  let suggestionsList = [];
  if (totals.easy > totals.medium * 1.5) {
    suggestionsList.push("Transition towards Medium-difficulty problems to expand your problem-solving depth.");
  }
  if (totals.medium > totals.hard * 3) {
    suggestionsList.push("Challenge yourself with 1-2 Hard-level algorithmic tasks each week, focusing on dynamic programming or network flow.");
  }
  if (suggestionsList.length === 0) {
    suggestionsList.push("Broaden your topic coverage by tackling niche categories like trie structures or segment trees.");
  }

  let platformAssessment = "";
  if (perPlatform && perPlatform.length > 1) {
    const sorted = [...perPlatform].sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
    if (sorted[0].totalSolved > sorted[1].totalSolved * 3) {
      platformAssessment = `Most of your progress resides on ${sorted[0].platform.toUpperCase()} (${sorted[0].totalSolved} solved). Setting aside a regular practice window on ${sorted[1].platform.toUpperCase()} (${sorted[1].totalSolved} solved) will expose you to different problem styles.`;
    }
  }

  return `Hello ${name}! Here is my analysis of your unified developer profile.

${assessment} ${platformAssessment}

To accelerate your preparation, here is my recommendation:
1. ${suggestionsList[0]}
2. Focus on dynamic programming, depth-first search, and hash maps to solidify interview patterns.
3. Keep track of your progress on each platform to maintain a well-rounded developer profile.

You are demonstrating great dedication. Keep solving, stay consistent, and your growth will compound!`;
}

/**
 * Calls Google's Gemini API (generateContent) to produce a short,
 * personalized, motivating analysis of a user's combined coding stats
 * across all linked platforms.
 */
async function generateFeedback({ name, totals, perPlatform }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.startsWith('AQ.')) {
    console.log("No valid Gemini API key. Generating dynamic local mentor feedback...");
    const fallbackText = generateLocalFeedback({ name, totals, perPlatform });
    return { feedback: fallbackText, generated: true, isFallback: true };
  }

  const platformLines = perPlatform
    .map(
      (p) =>
        `- ${p.platform}: ${p.error ? `unavailable (${p.error})` : `${p.totalSolved} solved (Easy ${p.easy}, Medium ${p.medium}, Hard ${p.hard})`}`
    )
    .join('\n');

  const prompt = `You are a friendly, encouraging coding mentor. A developer named ${name} has linked their coding platforms. Here is their aggregated data:

Total solved across all platforms: ${totals.totalSolved}
Easy: ${totals.easy}, Medium: ${totals.medium}, Hard: ${totals.hard}

Per platform breakdown:
${platformLines}

Write a short, personalized performance analysis (150-200 words) in a warm, motivating tone. Cover:
1. An honest assessment of their current strengths (e.g. strong on easy vs needs more medium/hard practice, or well balanced).
2. One or two concrete, specific suggestions for what to practice next to grow (topics, difficulty level, or platform balance).
3. A short, genuine, encouraging closing line.
Do not use markdown headers or bullet lists in the response, just natural paragraphs. Keep it concise and specific to the numbers given, not generic advice.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const { data } = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const text =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!text) {
      console.log("Empty response from Gemini API. Falling back to local generator.");
      const fallbackText = generateLocalFeedback({ name, totals, perPlatform });
      return { feedback: fallbackText, generated: true, isFallback: true };
    }

    return { feedback: text.trim(), generated: true };
  } catch (err) {
    console.error("Gemini API Error. Using local mentor fallback generator:", err.message);
    const fallbackText = generateLocalFeedback({ name, totals, perPlatform });
    return { feedback: fallbackText, generated: true, isFallback: true };
  }
}

module.exports = generateFeedback;
