const llmService = require('../services/llmService');
const Profile = require('../models/Profile');
const { asyncHandler } = require('../middleware/asyncHandler');

// Generate detailed birth chart using GPT-OSS model
const generateDetailedBirthChart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user profile
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Check if user has basic birth chart data
    if (!profile.birth_chart_data) {
      return res.status(400).json({
        success: false,
        message: 'Birth chart data not available. Please complete onboarding first.'
      });
    }

    // Generate detailed birth chart using GPT-OSS model
    const birthChartAnalysis = await llmService.generateDetailedBirthChart({
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
      time_of_birth: profile.time_of_birth,
      place_of_birth: profile.place_of_birth,
      gender: profile.gender,
      existing_birth_chart_data: profile.birth_chart_data
    });

    // Update profile with detailed birth chart data
    if (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data) {
      await Profile.updateOne(
        { user_id: userId },
        {
          birth_chart_data: {
            ...profile.birth_chart_data,
            ...birthChartAnalysis.enhanced_birth_chart_data,
            detailed_analysis: birthChartAnalysis.detailed_analysis,
            planetary_positions: birthChartAnalysis.planetary_positions,
            aspects: birthChartAnalysis.aspects,
            houses: birthChartAnalysis.houses
          },
          updated_at: new Date()
        }
      );
    }

    res.json({
      success: true,
      birthChart: birthChartAnalysis
    });

  } catch (error) {
    console.error('Error generating detailed birth chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate detailed birth chart'
    });
  }
});

module.exports = {
  generateDetailedBirthChart
};
