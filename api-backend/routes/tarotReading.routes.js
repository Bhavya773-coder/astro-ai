const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/requireCredits');
const { asyncHandler } = require('../middleware/asyncHandler');
const { interpretCard } = require('../controllers/tarotReading.controller');

const router = express.Router();

// AI interpretation — requires auth + 1 credit
router.post('/interpret', requireAuth, requireCredits, asyncHandler(interpretCard));

module.exports = router;
