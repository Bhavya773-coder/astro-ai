const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const { createOrder, verifyPayment, handleWebhook, getPaymentStatus } = require('../controllers/payment.controller');

const router = express.Router();

// Public webhook endpoint (no auth)
router.post('/webhook', asyncHandler(handleWebhook));

// Protected routes
router.post('/create-order', requireAuth, asyncHandler(createOrder));
router.post('/verify', requireAuth, asyncHandler(verifyPayment));
router.get('/status', requireAuth, asyncHandler(getPaymentStatus));

module.exports = router;
