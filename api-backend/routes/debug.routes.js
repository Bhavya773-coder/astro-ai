const express = require('express');
const { debugProfile } = require('../controllers/debug.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/profile', debugProfile);

module.exports = router;
