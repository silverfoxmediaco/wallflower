// Example: src/backend/routes/gardenRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Garden routes coming soon! 🌻' });
});

module.exports = router;