const express = require('express');
const { getZodiacInfo, getAllZodiacSigns } = require('../controllers/zodiac.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Get information for a specific zodiac sign
router.post('/sign-info', getZodiacInfo);

// Get information for all zodiac signs
router.get('/all-signs', getAllZodiacSigns);

module.exports = router;
