const Profile = require('../models/Profile');
const { calculateNumerology } = require('../utils/numerology');

// Get numerology data for the authenticated user
const getNumerology = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Always calculate fresh or load calculated numerology
    let numerology = profile.numerology_data;
    if ((!numerology || !numerology.life_path || !numerology.destiny) && profile.full_name && profile.date_of_birth) {
      numerology = calculateNumerology({
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth
      });
      profile.numerology_data = numerology;
      profile.updated_at = new Date();
      await profile.save();
    }

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
