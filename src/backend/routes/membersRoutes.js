// Members Routes
// Path: src/backend/routes/membersRoutes.js
// Purpose: Public endpoints for displaying members

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/members/featured - Get featured members for landing page (public)
router.get('/featured', async (req, res) => {
  try {
    // Get up to 6 members who have completed profiles
    // Exclude sensitive information like email and password
    const members = await User.find({
      'profile.bio': { $exists: true, $ne: '' },
      'profile.age': { $exists: true, $ne: null },
      'profile.interests': { $exists: true, $ne: [] }
    })
    .select('-password -email -seeds -__v') // Exclude sensitive fields
    .limit(6)
    .sort({ createdAt: -1 }); // Show newest members first

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