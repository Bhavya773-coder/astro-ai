const express = require('express');
const router = express.Router();
const pushController = require('../controllers/push.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/save-token', requireAuth, pushController.saveToken);
router.post('/unsubscribe', requireAuth, pushController.unsubscribe);

module.exports = router;
