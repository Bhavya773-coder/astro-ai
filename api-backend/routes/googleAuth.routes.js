const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const { googleAuth } = require('../controllers/googleAuth.controller');

const router = express.Router();

router.post('/google', asyncHandler(googleAuth));

module.exports = router;
