const express = require('express');
const { getBirthChart, refreshBirthChart } = require('../controllers/birthChart.controller');
const { generateDetailedBirthChart } = require('../controllers/birthChartDetailed.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', getBirthChart);
router.post('/refresh', refreshBirthChart);
router.post('/generate-detailed', generateDetailedBirthChart);

module.exports = router;
