const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const horoscopeController = require('../controllers/horoscope.controller');

// Rate limiting - 10 requests per minute per user for horoscope generation
const horoscopeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { 
    success: false, 
    message: 'Too many horoscope requests. Please wait a moment.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// All horoscope routes require authentication
router.use(requireAuth);

/**
 * @route   POST /api/horoscope
 * @desc    Generate a personalized horoscope for a zodiac sign
 * @access  Private
 * @body    { zodiac: string }
 * @response { success: boolean, data: { zodiac, date, horoscope, luckyElement } }
 */
router.post('/', horoscopeLimiter, horoscopeController.generateHoroscope);
router.post('/daily-action', horoscopeLimiter, horoscopeController.generateDailyFocusAction);
router.post('/personalized-prediction', horoscopeLimiter, horoscopeController.generatePersonalizedPrediction);
router.post('/daily-decision-engine', horoscopeLimiter, horoscopeController.generateDailyDecisionData);
router.post('/feedback', horoscopeController.submitFeedback);

module.exports = router;
