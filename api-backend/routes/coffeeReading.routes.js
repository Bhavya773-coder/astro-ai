const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/requireCredits');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getCoffeeReading } = require('../controllers/coffeeReading.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/', requireCredits(10), asyncHandler(getCoffeeReading));

module.exports = router;
