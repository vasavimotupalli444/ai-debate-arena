const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// Step 1: Redirect to Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Step 2: Google calls back here
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=true` }),
  (req, res) => {
    // Create JWT token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Send token + user info to frontend via URL
    const userData = encodeURIComponent(JSON.stringify({
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }));
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${userData}`);
  }
);

// Get logged-in user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v -googleId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (just tell frontend to clear token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;