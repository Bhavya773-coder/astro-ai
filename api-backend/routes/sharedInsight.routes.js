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
router.post('/share/face-reading', requireAuth, shareLimiter, sharedInsightController.shareFaceReading);
router.post('/share/coffee-reading', requireAuth, shareLimiter, sharedInsightController.shareCoffeeReading);
router.post('/share/palm-reading', requireAuth, shareLimiter, sharedInsightController.sharePalmReading);
router.post('/share/style', requireAuth, shareLimiter, sharedInsightController.shareStyle);
router.delete('/share/:shareId', requireAuth, sharedInsightController.deleteSharedInsight);

// Public routes (no authentication required)
router.get('/shared-horoscope/:shareId', sharedInsightController.getSharedHoroscope);
router.get('/shared-numerology/:shareId', sharedInsightController.getSharedNumerology);
router.get('/shared-face-reading/:shareId', sharedInsightController.getSharedFaceReading);
router.get('/shared-coffee-reading/:shareId', sharedInsightController.getSharedCoffeeReading);
router.get('/shared-palm-reading/:shareId', sharedInsightController.getSharedPalmReading);
router.get('/shared-style/:shareId', sharedInsightController.getSharedStyle);

module.exports = router;
