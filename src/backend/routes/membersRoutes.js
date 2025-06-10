// Members Routes
// Path: src/backend/routes/membersRoutes.js
// Purpose: Public endpoints for displaying members

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/members/featured - Get featured members for landing page (public)
router.get('/featured', async (req, res) => {
  try {
    // Get up to 3 members, even if profiles aren't complete
    // First try to get members with complete profiles
    let members = await User.find({
      'profile.bio': { $exists: true, $ne: '' },
      'profile.age': { $exists: true, $ne: null }
    })
    .select('-password -email -seeds -__v')
    .limit(3)
    .sort({ createdAt: -1 });

    // If we don't have 3 members with complete profiles, get any members
    if (members.length < 3) {
      const additionalMembers = await User.find({
        _id: { $nin: members.map(m => m._id) } // Exclude already fetched members
      })
      .select('-password -email -seeds -__v')
      .limit(3 - members.length)
      .sort({ createdAt: -1 });
      
      members = [...members, ...additionalMembers];
    }

    res.json({
      success: true,
      members: members
    });
  } catch (error) {
    console.error('Featured members error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve members' 
    });
  }
});

module.exports = router;