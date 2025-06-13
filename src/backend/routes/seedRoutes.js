// Seed Routes
// Path: src/backend/routes/seedRoutes.js
// Purpose: Define seed-related API endpoints

const express = require('express');
const router = express.Router();
const {
  getSeedData,
  createCheckoutSession,
  createSubscription,
  addBonusSeeds,
  refundSeeds,
  getSeedHistory,
  cancelSubscription
} = require('../controllers/seedController');

// GET /api/seeds/data - Get user's seed balance and history
router.get('/data', getSeedData);

// GET /api/seeds/history - Get detailed seed transaction history
router.get('/history', getSeedHistory);

// POST /api/seeds/create-checkout - Create Stripe checkout session for seed purchase
router.post('/create-checkout', createCheckoutSession);

// POST /api/seeds/create-subscription - Create Stripe subscription for unlimited seeds
router.post('/create-subscription', createSubscription);

// POST /api/seeds/cancel-subscription - Cancel active subscription
router.post('/cancel-subscription', cancelSubscription);

// POST /api/seeds/bonus - Add bonus seeds (admin only)
router.post('/bonus', addBonusSeeds);

// POST /api/seeds/refund - Process seed refund (admin only)
router.post('/refund', refundSeeds);

module.exports = router;