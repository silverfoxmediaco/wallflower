// Profile Controller
// Path: src/backend/controllers/profileController.js
// Purpose: Handle profile-related operations with Cloudinary photo upload

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

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

// Upload profile photos with Cloudinary
exports.uploadPhotos = [verifyToken, upload.array('photos', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No photos uploaded' 
      });
    }

    // Get current user to check existing photos
    const user = await User.findById(req.userId);
    const currentPhotoCount = user.profile.photos ? user.profile.photos.length : 0;
    
    // Check if total would exceed 6
    if (currentPhotoCount + req.files.length > 6) {
      // Delete uploaded files from Cloudinary since we're rejecting them
      for (const file of req.files) {
        await cloudinary.uploader.destroy(file.filename);
      }
      
      return res.status(400).json({ 
        success: false, 
        message: `You can only have 6 photos total. You currently have ${currentPhotoCount}.` 
      });
    }

    // Create photo objects with Cloudinary URLs
    const photos = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // For deletion later
      isMain: currentPhotoCount === 0 && index === 0, // First photo is main if no existing photos
      thumbnailUrl: cloudinary.url(file.filename, {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face'
      })
    }));

    // Update user profile with new photos
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { 
        $push: { 
          'profile.photos': { 
            $each: photos
          } 
        } 
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Photos uploaded successfully',
      photos: updatedUser.profile.photos 
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    
    // Clean up any uploaded files if there was an error
    if (req.files) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (deleteError) {
          console.error('Error deleting file from Cloudinary:', deleteError);
        }
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload photos' 
    });
  }
}];

// Delete a photo
exports.deletePhoto = [verifyToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Find the user and the specific photo
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const photoIndex = user.profile.photos.findIndex(
      p => p._id.toString() === photoId
    );
    
    if (photoIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Photo not found' 
      });
    }
    
    const photo = user.profile.photos[photoIndex];
    
    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(photo.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }
    
    // Remove from database
    user.profile.photos.splice(photoIndex, 1);
    
    // If deleted photo was main and there are other photos, make first photo main
    if (photo.isMain && user.profile.photos.length > 0) {
      user.profile.photos[0].isMain = true;
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Photo deleted successfully',
      photos: user.profile.photos 
    });
  } catch (error) {
    console.error('Photo deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete photo' 
    });
  }
}];