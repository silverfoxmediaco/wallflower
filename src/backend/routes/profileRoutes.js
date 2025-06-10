// Profile Routes
// Path: src/backend/routes/profileRoutes.js
// Purpose: Define profile-related API endpoints

const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadPhotos, 
  deletePhoto 
} = require('../controllers/profileController');

// GET /api/profile - Get current user's profile
router.get('/', getProfile);

// PUT /api/profile - Update current user's profile
router.put('/', updateProfile);

// POST /api/profile/photos - Upload photos
router.post('/photos', uploadPhotos);

// DELETE /api/profile/photos/:photoId - Delete a specific photo
router.delete('/photos/:photoId', deletePhoto);

module.exports = router;