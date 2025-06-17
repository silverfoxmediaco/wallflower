// Updated Match Controller with Notifications
// Path: src/backend/controllers/matchController.js
// Purpose: Handle matching/browsing functionality with email notifications

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notificationService');

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

// GET: Browse profiles
exports.getBrowseProfiles = [verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

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

// POST: Send a seed to another user
exports.sendSeed = [verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;

    const sender = await User.findById(req.userId);

    // Check if user has an active subscription
    const hasActiveSubscription = sender.subscription &&
      sender.subscription.status === 'active' &&
      (!sender.subscription.cancelAtPeriodEnd || new Date(sender.subscription.currentPeriodEnd) > new Date());

    // Check if user has seeds available (if not subscribed)
    if (!hasActiveSubscription && sender.seeds.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No seeds available'
      });
    }

    // Check if already sent a seed to this user
    const alreadySent = sender.seeds.sent.some(
      seed => seed.to.toString() === recipientId
    );

    if (alreadySent) {
      return res.status(400).json({
        success: false,
        message: 'Seed already sent to this user'
      });
    }

    // Check if recipient already sent a seed to sender (for match detection)
    const recipient = await User.findById(recipientId);
    const recipientSentToSender = recipient.seeds.sent.some(
      seed => seed.to.toString() === req.userId
    );

    // Update sender
    const updateData = {
      $push: {
        'seeds.sent': {
          to: recipientId,
          sentAt: new Date()
        }
      }
    };

    // Only decrement seeds if not subscribed
    if (!hasActiveSubscription) {
      updateData.$inc = { 'seeds.available': -1 };
    }

    // Update sender atomically
    const updatedSender = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    );

    // Update recipient: add to received list
    await User.findByIdAndUpdate(recipientId, {
      $push: {
        'seeds.received': {
          from: req.userId,
          receivedAt: new Date()
        }
      }
    });

    // Send notifications
    if (recipientSentToSender) {
      // It's a match! Send match notifications to both users
      await notificationService.sendMatchNotification(req.userId, recipientId);
    } else {
      // Just send seed received notification to recipient
      await notificationService.sendSeedReceivedNotification(req.userId, recipientId);
    }

    // Check if sender's balance is now low and send notification if needed
    if (!hasActiveSubscription) {
      await notificationService.checkAndSendLowBalanceNotification(
        req.userId, 
        updatedSender.seeds.available
      );
    }

    res.json({
      success: true,
      message: recipientSentToSender ? 'It\'s a match! 🌸' : 'Seed sent successfully!',
      seedsRemaining: updatedSender.seeds.available,
      isMatch: recipientSentToSender
    });
  } catch (error) {
    console.error('Send seed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// POST: Pass on a profile
exports.passProfile = [verifyToken, async (req, res) => {
  try {
    const { profileId } = req.body;

    // Optional: log the pass or store for future filtering

    res.json({
      success: true,
      message: 'Profile passed'
    });
  } catch (error) {
    console.error('Pass profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];