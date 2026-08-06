const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/requireCredits');
const { asyncHandler } = require('../middleware/asyncHandler');
const { interpretCard, deductTarotCredit } = require('../controllers/tarotReading.controller');

const router = express.Router();

// AI interpretation — requires auth + 1 credit
router.post('/interpret', requireAuth, requireCredits(), asyncHandler(interpretCard));

// Deduct tarot reveal credit — requires auth + 1 credit check
router.post('/deduct-credit', requireAuth, requireCredits(), asyncHandler(deductTarotCredit));

module.exports = router;
