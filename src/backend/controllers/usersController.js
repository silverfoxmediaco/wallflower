// Users Controller
// Path: src/backend/controllers/usersController.js
// Purpose: Handle user profile viewing

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

// Get a specific user's profile
exports.getUserProfile = [verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the requested user's profile
    const user = await User.findById(userId).select('-password -email -seeds');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if current user has sent a seed to this user
    const currentUser = await User.findById(req.userId);
    const seedSent = currentUser.seeds.sent.some(
      seed => seed.to.toString() === userId
    );
    
    res.json({
      success: true,
      user: user,
      seedSent: seedSent
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile' 
    });
  }
}];