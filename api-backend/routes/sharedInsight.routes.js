const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const sharedInsightController = require('../controllers/sharedInsight.controller');
const { requireAuth } = require('../middleware/auth');

// Rate limiting for sharing
const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 shares per 15 minutes
  message: {
    success: false,
    message: 'Too many share requests. Please try again later.'
  }
});

// Protected routes (require authentication)
router.post('/share/horoscope', requireAuth, shareLimiter, sharedInsightController.shareHoroscope);
router.post('/share/numerology', requireAuth, shareLimiter, sharedInsightController.shareNumerology);
router.delete('/share/:shareId', requireAuth, sharedInsightController.deleteSharedInsight);

// Public routes (no authentication required)
router.get('/shared-horoscope/:shareId', sharedInsightController.getSharedHoroscope);
router.get('/shared-numerology/:shareId', sharedInsightController.getSharedNumerology);

module.exports = router;
