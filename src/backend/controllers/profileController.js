// Profile Controller
// Path: src/backend/controllers/profileController.js
// Purpose: Handle profile-related operations

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

// Get user profile
exports.getProfile = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, profile: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// Update user profile
exports.updateProfile = [verifyToken, async (req, res) => {
  try {
    const {
      age,
      height,
      bodyType,
      location,
      bio,
      interests,
      personalityType,
      lookingFor,
      prompts
    } = req.body;
    
    // Build update object
    const updateData = {
      'profile.age': age,
      'profile.height': height,
      'profile.bodyType': bodyType,
      'profile.location': location,
      'profile.bio': bio,
      'profile.interests': interests,
      'profile.personalityType': personalityType,
      'profile.lookingFor': lookingFor,
      'profile.prompts': prompts
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// Upload profile photos (placeholder - you'll need to implement file upload)
exports.uploadPhotos = [verifyToken, async (req, res) => {
  try {
    // This is a placeholder - you'll need to implement actual file upload
    // using multer or similar library
    res.json({ 
      success: true, 
      message: 'Photo upload endpoint - implement with multer',
      photos: [] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];