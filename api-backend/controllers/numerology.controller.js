const Profile = require('../models/Profile');

// Get numerology data for the authenticated user
const getNumerology = async (req, res, next) => {
  try {
    console.log('Numerology API - getNumerology called');
    console.log('User ID from token:', req.user);
    
    const userId = req.user.userId;

    // Find user's profile
    const profile = await Profile.findOne({ user_id: userId });
    console.log('Profile found:', !!profile);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if insights have been generated
    if (!profile.insights_generated || !profile.numerology_data) {
      return res.json({
        success: true,
        message: 'Generate your insights to unlock numerology',
        numerology: null
      });
    }

    // Return numerology data
    const numerology = profile.numerology_data;
    console.log('Numerology data found:', numerology);

    res.json({
      success: true,
      numerology
    });

  } catch (error) {
    console.error('Error fetching numerology data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch numerology data'
    });
  }
};

module.exports = {
  getNumerology
};
