const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getReadingHistory } = require('../controllers/readingHistory.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/:type', asyncHandler(getReadingHistory));

module.exports = router;
