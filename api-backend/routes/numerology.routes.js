const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getNumerology } = require('../controllers/numerology.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All numerology routes require authentication
router.use(requireAuth);

router.get('/', asyncHandler(getNumerology));

module.exports = router;
