// Seed Routes
// Path: src/backend/routes/seedRoutes.js
// Purpose: Define seed-related API endpoints

const express = require('express');
const router = express.Router();
const {
  getSeedData,
  createCheckoutSession,
  handleStripeWebhook,
  addBonusSeeds,
  refundSeeds,
  getSeedHistory
} = require('../controllers/seedController');

// GET /api/seeds/data - Get user's seed balance and history
router.get('/data', getSeedData);

// GET /api/seeds/history - Get detailed seed transaction history
router.get('/history', getSeedHistory);

// POST /api/seeds/create-checkout - Create Stripe checkout session for seed purchase
router.post('/create-checkout', createCheckoutSession);

// POST /api/seeds/webhook - Handle Stripe webhook for successful payments
// Note: This route should not use auth middleware as it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// POST /api/seeds/bonus - Add bonus seeds (admin only)
router.post('/bonus', addBonusSeeds);

// POST /api/seeds/refund - Process seed refund (admin only)
router.post('/refund', refundSeeds);

module.exports = router;