const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  createCompatibilityReport,
  listCompatibilityReports,
  getCompatibilityReportById,
  updateCompatibilityReport,
  deleteCompatibilityReport
} = require('../controllers/compatibilityReports.controller');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(listCompatibilityReports));
router.post('/', requireAuth, asyncHandler(createCompatibilityReport));
router.get('/:id', requireAuth, validateObjectId('id'), asyncHandler(getCompatibilityReportById));
router.patch('/:id', requireAuth, validateObjectId('id'), asyncHandler(updateCompatibilityReport));
router.delete('/:id', requireAuth, validateObjectId('id'), asyncHandler(deleteCompatibilityReport));

module.exports = router;
