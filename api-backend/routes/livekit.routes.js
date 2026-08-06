const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getLiveKitToken } = require('../controllers/livekit.controller');

const router = express.Router();

// Generate signed connection token for LiveKit voice session
router.post('/token', requireAuth, asyncHandler(getLiveKitToken));

module.exports = router;
