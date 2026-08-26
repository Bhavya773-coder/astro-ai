const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/requireCredits');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getVastuConsultation } = require('../controllers/vastuConsultant.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/', requireCredits(50), asyncHandler(getVastuConsultation));

module.exports = router;
