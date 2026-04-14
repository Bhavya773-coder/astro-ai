const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const feedbackController = require('../controllers/feedback.controller');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');

// Rate limiting for feedback submission
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 submissions per 15 minutes
  message: {
    success: false,
    message: 'Too many feedback submissions. Please try again later.'
  }
});

// User routes (require authentication)
router.post('/feedback', requireAuth, feedbackLimiter, feedbackController.submitFeedback);
router.get('/feedback/my', requireAuth, feedbackController.getMyFeedback);

// Admin routes (require admin role)
router.get('/feedback', requireAuth, requireAdmin, feedbackController.getAllFeedback);
router.get('/feedback/stats', requireAuth, requireAdmin, feedbackController.getFeedbackStats);
router.get('/feedback/user/:userId', requireAuth, requireAdmin, feedbackController.getUserFeedback);
router.delete('/feedback/:feedbackId', requireAuth, requireAdmin, feedbackController.deleteFeedback);

module.exports = router;
