const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const sharedChatResponseController = require('../controllers/sharedChatResponse.controller');
const { requireAuth } = require('../middleware/auth');

// Rate limiting for sharing responses
const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 shares per 15 minutes
  message: {
    success: false,
    message: 'Too many shares. Please try again later.'
  }
});

// Public route - no authentication required
router.get('/shared-response/:shareId', sharedChatResponseController.getSharedResponse);

// Protected routes - require authentication
router.post('/chat-response/share', requireAuth, shareLimiter, sharedChatResponseController.shareChatResponse);
router.get('/chat-response/my-shares', requireAuth, sharedChatResponseController.getMySharedResponses);
router.delete('/chat-response/share/:shareId', requireAuth, sharedChatResponseController.deleteSharedResponse);

module.exports = router;
