// Garden Routes
// Path: src/backend/routes/gardenRoutes.js
// Purpose: Define garden-related API endpoints

const express = require('express');
const router = express.Router();
const { getGarden } = require('../controllers/gardenController');

// GET /api/garden - Get user's garden data
router.get('/', getGarden);

module.exports = router;