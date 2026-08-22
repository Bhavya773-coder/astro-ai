const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const controller = require('../controllers/oracle.controller');

const router = express.Router();
const predictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

router.use(requireAuth);
router.get('/disclosure', asyncHandler(controller.getDisclosure));
router.post('/disclosure/accept', asyncHandler(controller.acceptDisclosure));
router.post('/predict', predictLimiter, asyncHandler(controller.predict));
router.get('/feed', predictLimiter, asyncHandler(controller.feed));
router.get('/predictions', asyncHandler(controller.listPredictions));
router.get('/predictions/:id', asyncHandler(controller.getPrediction));
router.delete('/predictions/:id', asyncHandler(controller.deletePrediction));
router.post('/predictions/:id/outcome', asyncHandler(controller.submitOutcome));
router.post('/predictions/:id/explain', asyncHandler(controller.explainPrediction));
router.post('/predictions/:id/synchronicity', asyncHandler(controller.createSynchronicity));
router.get('/calibration', asyncHandler(controller.calibration));
router.get('/memories', asyncHandler(controller.listMemories));
router.delete('/memories/:id', asyncHandler(controller.deleteMemory));
router.get('/settings', asyncHandler(controller.getSettings));
router.patch('/settings', asyncHandler(controller.updateSettings));

module.exports = router;
