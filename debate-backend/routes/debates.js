const express = require('express');
const Debate = require('../models/Debate');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Save a debate after it ends
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { topic, winner, humanScore, aiScore, userLevel, debateMode, messages, keyPoints } = req.body;
    const debate = await Debate.create({
      userId: req.userId,
      topic,
      winner,
      humanScore,
      aiScore,
      userLevel,
      debateMode,
      messages,
      keyPoints
    });
    res.json({ success: true, debateId: debate._id });
  } catch (err) {
    console.error('Save debate error:', err);
    res.status(500).json({ error: 'Failed to save debate' });
  }
});

// Get all debates for logged-in user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const debates = await Debate.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-messages -__v'); // exclude full messages to keep response small
    res.json(debates);
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get single debate with full messages
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const debate = await Debate.findOne({
      _id: req.params.id,
      userId: req.userId // ensure user can only access their own debates
    });
    if (!debate) return res.status(404).json({ error: 'Debate not found' });
    res.json(debate);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a debate
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Debate.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;