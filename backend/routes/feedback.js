const express = require('express');
const { protect } = require('../middleware/auth');
const generateFeedback = require('../utils/gemini');

const router = express.Router();

// @route  POST /api/feedback/analyze
// @desc   Use Gemini to analyze the user's latest stats snapshot
router.post('/analyze', protect, async (req, res) => {
  try {
    const snapshots = req.user.lastStats || [];

    if (snapshots.length === 0) {
      return res.status(400).json({
        message: 'No stats found yet. Link your platforms and refresh your stats first.',
      });
    }

    const codingSnapshots = snapshots.filter(
      (s) => (s.platform || '').toLowerCase().replace(/[\s\-_]/g, '') !== 'github'
    );

    const totals = codingSnapshots.reduce(
      (acc, s) => {
        const easy = Number(s.easy) || 0;
        const medium = Number(s.medium) || 0;
        const hard = Number(s.hard) || 0;
        const solved = Math.max(Number(s.totalSolved) || 0, easy + medium + hard);

        acc.totalSolved += solved;
        acc.easy += easy;
        acc.medium += medium;
        acc.hard += hard;
        return acc;
      },
      { totalSolved: 0, easy: 0, medium: 0, hard: 0 }
    );
    totals.totalSolved = Math.max(totals.totalSolved, totals.easy + totals.medium + totals.hard);

    const { feedback, generated } = await generateFeedback({
      name: req.user.name,
      totals,
      perPlatform: snapshots,
    });

    req.user.lastFeedback = feedback;
    req.user.lastFeedbackAt = new Date();
    await req.user.save();

    res.json({ feedback, generated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate AI feedback', error: err.message });
  }
});

module.exports = router;
