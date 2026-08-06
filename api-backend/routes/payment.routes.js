const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const { verifyIAP, getPaymentStatus } = require('../controllers/payment.controller');

const router = express.Router();

// Protected routes
router.post('/verify-iap', requireAuth, asyncHandler(verifyIAP));
router.get('/status', requireAuth, asyncHandler(getPaymentStatus));

module.exports = router;
