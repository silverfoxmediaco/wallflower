// Match Controller
// Path: src/backend/controllers/matchController.js
// Purpose: Handle matching/browsing functionality

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get profiles to browse
exports.getBrowseProfiles = [verifyToken, async (req, res) => {
  try {
    // Get current user to exclude from results
    const currentUser = await User.findById(req.userId);
    
    // Get users that:
    // 1. Are not the current user
    // 2. Have completed profiles (at least bio and interests)
    // 3. Haven't been sent a seed by current user already
    const sentSeedUserIds = currentUser.seeds.sent.map(seed => seed.to);
    
    const profiles = await User.find({
      _id: { 
        $ne: req.userId,
        $nin: sentSeedUserIds 
      },
      'profile.bio': { $exists: true, $ne: '' },
      'profile.interests': { $exists: true, $ne: [] }
    })
    .select('-password -email')
    .limit(10);
    
    // Transform data to match frontend format
    const formattedProfiles = profiles.map(user => ({
      id: user._id,
      username: user.username,
      age: user.profile.age || 'Not specified',
      height: user.profile.height || 'Not specified',
      bodyType: user.profile.bodyType || 'Not specified',
      location: user.profile.location || 'Location not set',
      bio: user.profile.bio,
      interests: user.profile.interests,
      photos: user.profile.photos || [],
      lastActive: 'Recently active',
      personalityType: user.profile.personalityType || 'Not specified',
      prompts: user.profile.prompts || []
    }));
    
    res.json({ 
      success: true, 
      profiles: formattedProfiles,
      seedsRemaining: currentUser.seeds.available 
    });
  } catch (error) {
    console.error('Browse profiles error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// Send a seed to someone
exports.sendSeed = [verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    
    // Get sender
    const sender = await User.findById(req.userId);
    
    // Check if user has seeds available
    if (sender.seeds.available <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No seeds available' 
      });
    }
    
    // Check if seed already sent to this user
    const alreadySent = sender.seeds.sent.some(
      seed => seed.to.toString() === recipientId
    );
    
    if (alreadySent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Seed already sent to this user' 
      });
    }
    
    // Update sender: decrease available seeds, add to sent
    sender.seeds.available -= 1;
    sender.seeds.sent.push({
      to: recipientId,
      sentAt: new Date()
    });
    await sender.save();
    
    // Update recipient: add to received
    await User.findByIdAndUpdate(recipientId, {
      $push: {
        'seeds.received': {
          from: req.userId,
          receivedAt: new Date()
        }
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Seed sent successfully!',
      seedsRemaining: sender.seeds.available 
    });
  } catch (error) {
    console.error('Send seed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// Pass on a profile
exports.passProfile = [verifyToken, async (req, res) => {
  try {
    const { profileId } = req.body;
    
    // For now, just acknowledge the pass
    // In the future, you might want to track passes to not show the profile again
    
    res.json({ 
      success: true, 
      message: 'Profile passed' 
    });
  } catch (error) {
    console.error('Pass profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];