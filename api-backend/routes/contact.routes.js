const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const rateLimit = require('express-rate-limit');

// Rate limit for contact form to prevent spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many messages sent from this IP, please try again after an hour'
  }
});

router.post('/submit', contactLimiter, contactController.submitContactForm);

module.exports = router;
