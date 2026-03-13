const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getInsightStatus, saveBasicProfile, saveLifeContext, generateInsights } = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All profile routes require authentication
router.use(requireAuth);

router.get('/insight-status', asyncHandler(getInsightStatus));
router.post('/basic', asyncHandler(saveBasicProfile));
router.post('/context', asyncHandler(saveLifeContext));
router.post('/generate-insights', asyncHandler(generateInsights));

module.exports = router;
