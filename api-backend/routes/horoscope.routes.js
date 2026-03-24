const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscope.controller');
const { requireAuth } = require('../middleware/auth');

// Get today's horoscope for authenticated user based on zodiac sign
router.get('/today', requireAuth, horoscopeController.getTodayHoroscope);

// Get today's horoscope for any zodiac sign (no auth required)
router.get('/sign/:sign', horoscopeController.getHoroscopeForSign);

// Backwards-compatible alias for existing clients
router.get('/daily', requireAuth, horoscopeController.getTodayHoroscope);

module.exports = router;
