const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/requireCredits');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getPalmReading } = require('../controllers/palmReading.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/', requireCredits, asyncHandler(getPalmReading));

module.exports = router;
