const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/requireCredits');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getFaceReading } = require('../controllers/faceReading.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/', requireCredits, asyncHandler(getFaceReading));

module.exports = router;
