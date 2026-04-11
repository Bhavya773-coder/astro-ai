const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getProfile, getInsightStatus, saveBasicProfile, saveLifeContext, saveStylePreferences, generateInsights } = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All profile routes require authentication
router.use(requireAuth);

router.get('/', asyncHandler(getProfile));
router.get('/insight-status', asyncHandler(getInsightStatus));
router.post('/basic', asyncHandler(saveBasicProfile));
router.post('/context', asyncHandler(saveLifeContext));
router.post('/style-preferences', asyncHandler(saveStylePreferences));
router.post('/generate-insights', asyncHandler(generateInsights));

module.exports = router;
