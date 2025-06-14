// Cloudinary Configuration
// Path: src/backend/config/cloudinary.js
// Purpose: Configure Cloudinary for image uploads

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true  // Forces HTTPS URLs
});

module.exports = cloudinary;