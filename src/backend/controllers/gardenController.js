// Garden Controller
// Path: src/backend/controllers/gardenController.js
// Purpose: Handle garden-related operations (seeds sent/received, matches)

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

// Get user's garden data
exports.getGarden = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Get users who sent seeds to current user
    const seedsReceivedIds = user.seeds.received.map(seed => seed.from);
    const seedsReceived = await User.find({ 
      _id: { $in: seedsReceivedIds } 
    }).select('-password -email');
    
    // Get users current user sent seeds to
    const seedsSentIds = user.seeds.sent.map(seed => seed.to);
    const seedsSent = await User.find({ 
      _id: { $in: seedsSentIds } 
    }).select('-password -email');
    
    // Find matches (users who both sent seeds to each other)
    const matches = [];
    
    // Check each person you sent a seed to
    for (const sentSeed of user.seeds.sent) {
      const recipientId = sentSeed.to.toString();
      
      // Check if they also sent you a seed
      const theyAlsoSentToYou = user.seeds.received.some(
        received => received.from.toString() === recipientId
      );
      
      if (theyAlsoSentToYou) {
        // It's a match! Get their full profile
        const matchUser = await User.findById(recipientId).select('-password -email');
        if (matchUser) {
          matches.push(matchUser);
        }
      }
    }
    
    // Flowers in bloom would be matches with active conversations
    // For now, this is empty until messaging is implemented
    const flowersInBloom = [];
    
    // Remove matches from seedsReceived and seedsSent to avoid duplication
    const matchIds = matches.map(m => m._id.toString());
    
    const filteredSeedsReceived = seedsReceived.filter(
      seed => !matchIds.includes(seed._id.toString())
    );
    
    const filteredSeedsSent = seedsSent.filter(
      seed => !matchIds.includes(seed._id.toString())
    );
    
    res.json({
      success: true,
      garden: {
        seedsReceived: filteredSeedsReceived,
        seedsSent: filteredSeedsSent,
        matches: matches,
        flowersInBloom: flowersInBloom
      }
    });
  } catch (error) {
    console.error('Garden error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve garden data' 
    });
  }
}];