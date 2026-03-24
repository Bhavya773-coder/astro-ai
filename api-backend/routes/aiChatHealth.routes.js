const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');

/**
 * @route   GET /api/ai-chat/health
 * @desc    Check Ollama service health and model availability
 * @access  Private
 */
router.get('/health', requireAuth, async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    
    res.json({
      success: true,
      data: {
        ollama: health,
        model: aiService.model,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AIChatRoutes] Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service health',
      error: error.message
    });
  }
});

module.exports = router;
