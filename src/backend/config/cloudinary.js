// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;

// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wallflower-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Max size
      { quality: 'auto' } // Auto quality optimization
    ],
    // Enable face detection for better cropping
    gravity: 'face',
    crop: 'thumb'
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;

// backend/controllers/profileController.js (updated uploadPhotos method)
const cloudinary = require('../config/cloudinary');

exports.uploadPhotos = [verifyToken, upload.array('photos', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No photos uploaded' 
      });
    }

    // Create photo objects with Cloudinary URLs
    const photos = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // For deletion later
      isMain: index === 0, // First photo is main
      thumbnailUrl: cloudinary.url(file.filename, {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face'
      })
    }));

    // Update user profile with new photos
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $push: { 
          'profile.photos': { 
            $each: photos,
            $slice: 6 // Keep only 6 photos max
          } 
        } 
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Photos uploaded successfully',
      photos: user.profile.photos 
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload photos' 
    });
  }
}];

// Add delete photo endpoint
exports.deletePhoto = [verifyToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Find the photo to delete
    const user = await User.findById(req.userId);
    const photo = user.profile.photos.find(p => p._id.toString() === photoId);
    
    if (!photo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Photo not found' 
      });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.publicId);
    
    // Remove from database
    user.profile.photos = user.profile.photos.filter(
      p => p._id.toString() !== photoId
    );
    
    // If deleted photo was main, make first photo main
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