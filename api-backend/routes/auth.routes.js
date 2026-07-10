const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { register, verifySignupOtp, resendSignupOtp, login, me, requestOtp, verifyOtp, resetPasswordWithOtp } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/verify-signup-otp', asyncHandler(verifySignupOtp));
router.post('/resend-signup-otp', asyncHandler(resendSignupOtp));
router.post('/login', asyncHandler(login));
router.post('/forgot-password/request-otp', asyncHandler(requestOtp));
router.post('/forgot-password/verify-otp', asyncHandler(verifyOtp));
router.post('/reset-password-with-otp', asyncHandler(resetPasswordWithOtp));
router.get('/me', requireAuth, asyncHandler(me));

module.exports = router;
