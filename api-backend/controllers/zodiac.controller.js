const llmService = require('../services/llmService');
const { asyncHandler } = require('../middleware/asyncHandler');

// Get detailed zodiac information using GPT-OSS model
const getZodiacInfo = asyncHandler(async (req, res) => {
  try {
    const { userSign } = req.body;
    
    if (!userSign) {
      return res.status(400).json({
        success: false,
        message: 'User zodiac sign is required'
      });
    }

    // Get comprehensive zodiac information from GPT-OSS model
    const zodiacInfo = await llmService.getZodiacSignInfo(userSign);
    
    res.json({
      success: true,
      zodiacInfo
    });

  } catch (error) {
    console.error('Error getting zodiac info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get zodiac information'
    });
  }
});

// Get all zodiac signs information
const getAllZodiacSigns = asyncHandler(async (req, res) => {
  try {
    // Get comprehensive information for all zodiac signs from GPT-OSS model
    const allZodiacInfo = await llmService.getAllZodiacSignsInfo();
    
    res.json({
      success: true,
      zodiacSigns: allZodiacInfo
    });

  } catch (error) {
    console.error('Error getting all zodiac signs info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get zodiac signs information'
    });
  }
});

module.exports = {
  getZodiacInfo,
  getAllZodiacSigns
};
