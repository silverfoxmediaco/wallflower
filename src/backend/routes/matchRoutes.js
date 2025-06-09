// Match Routes
// Path: src/backend/routes/matchRoutes.js
// Purpose: Define matching/browsing API endpoints

const express = require('express');
const router = express.Router();
const { getBrowseProfiles, sendSeed, passProfile } = require('../controllers/matchController');

// GET /api/match/browse - Get profiles to browse
router.get('/browse', getBrowseProfiles);

// POST /api/match/send-seed - Send a seed to someone
router.post('/send-seed', sendSeed);

// POST /api/match/pass - Pass on a profile
router.post('/pass', passProfile);

module.exports = router;