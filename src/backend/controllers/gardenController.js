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
    for (const sentSeed of user.seeds.sent) {
      const recipientId = sentSeed.to.toString();
      const receivedFromSameUser = user.seeds.received.some(
        received => received.from.toString() === recipientId
      );
      
      if (receivedFromSameUser) {
        const matchUser = await User.findById(recipientId).select('-password -email');
        if (matchUser) {
          matches.push(matchUser);
        }
      }
    }
    
    res.json({
      success: true,
      garden: {
        seedsReceived: seedsReceived,
        seedsSent: seedsSent,
        matches: matches
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