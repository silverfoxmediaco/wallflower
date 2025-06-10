// Stats Routes
// Path: src/backend/routes/statsRoutes.js
// Purpose: Public statistics endpoints

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/stats/members - Get member statistics (public endpoint)
router.get('/members', async (req, res) => {
  try {
    // Get total member count
    const totalMembers = await User.countDocuments();
    
    // Get members who joined in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Get users who have both sent and received seeds (matches)
    const successStories = await User.countDocuments({
      $and: [
        { 'seeds.sent.0': { $exists: true } },
        { 'seeds.received.0': { $exists: true } }
      ]
    });
    
    // Get users who have sent at least one seed (active gardens)
    const activeGardens = await User.countDocuments({
      'seeds.sent.0': { $exists: true }
    });
    
    res.json({
      success: true,
      stats: {
        total: totalMembers.toString(),
        newThisWeek: newThisWeek.toString(),
        successStories: successStories.toString(),
        activeGardens: activeGardens.toString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve stats' 
    });
  }
});

module.exports = router;