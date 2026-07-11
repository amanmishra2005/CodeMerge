const axios = require('axios');

/**
 * Calls Google's Gemini API (generateContent) to produce a short,
 * personalized, motivating analysis of a user's combined coding stats
 * across all linked platforms.
 */
async function generateFeedback({ name, totals, perPlatform }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      feedback:
        'AI feedback is not configured yet. Add a valid GEMINI_API_KEY in the backend .env file to enable personalized analysis.',
      generated: false,
    };
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
      return {
        feedback: 'Gemini returned an empty response. Please try again in a moment.',
        generated: false,
      };
    }

    return { feedback: text.trim(), generated: true };
  } catch (err) {
    const message =
      (err.response && err.response.data && err.response.data.error && err.response.data.error.message) ||
      'Failed to reach the Gemini API. Check your GEMINI_API_KEY and network connection.';
    return { feedback: message, generated: false };
  }
}

module.exports = generateFeedback;
