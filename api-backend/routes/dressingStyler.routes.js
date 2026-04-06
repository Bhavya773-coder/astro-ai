const express = require('express');
const router = express.Router();
const dressingStylerController = require('../controllers/dressingStyler.controller');
const { requireAuth } = require('../middleware/auth');

/**
 * Dressing Styler Routes
 * 
 * POST /api/dressing-styler/generate - Generate today's dressing suggestion
 * GET /api/dressing-styler/today - Get today's suggestion (if exists)
 * GET /api/dressing-styler/history - Get suggestion history
 */

// All routes require authentication
router.use(requireAuth);

// Generate today's dressing suggestion
router.post('/generate', dressingStylerController.generateSuggestion);

// Get today's suggestion (if exists)
router.get('/today', dressingStylerController.getTodaySuggestion);

// Get suggestion history
router.get('/history', dressingStylerController.getHistory);

module.exports = router;
