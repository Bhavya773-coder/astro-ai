const express = require('express');
const router = express.Router();
const { getCredits } = require('../controllers/credits.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(requireAuth);
router.get('/', asyncHandler(getCredits));

module.exports = router;
