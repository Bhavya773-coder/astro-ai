const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  upsertGrowthMetric,
  listGrowthMetrics,
  getGrowthMetricById,
  updateGrowthMetric,
  deleteGrowthMetric
} = require('../controllers/growthMetrics.controller');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(listGrowthMetrics));
router.post('/upsert', requireAuth, asyncHandler(upsertGrowthMetric));
router.get('/:id', requireAuth, validateObjectId('id'), asyncHandler(getGrowthMetricById));
router.patch('/:id', requireAuth, validateObjectId('id'), asyncHandler(updateGrowthMetric));
router.delete('/:id', requireAuth, validateObjectId('id'), asyncHandler(deleteGrowthMetric));

module.exports = router;
