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

    const totals = snapshots.reduce(
      (acc, s) => {
        acc.totalSolved += s.totalSolved || 0;
        acc.easy += s.easy || 0;
        acc.medium += s.medium || 0;
        acc.hard += s.hard || 0;
        return acc;
      },
      { totalSolved: 0, easy: 0, medium: 0, hard: 0 }
    );

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
