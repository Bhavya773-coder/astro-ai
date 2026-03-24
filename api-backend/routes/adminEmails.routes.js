const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendEmail, sendBulkEmail } = require('../controllers/adminEmails.controller');

const router = express.Router();

router.post('/send', requireAuth, requireAdmin, asyncHandler(sendEmail));
router.post('/bulk', requireAuth, requireAdmin, asyncHandler(sendBulkEmail));

module.exports = router;
