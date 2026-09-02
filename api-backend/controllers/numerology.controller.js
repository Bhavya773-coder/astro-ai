const Profile = require('../models/Profile');
const User = require('../models/User');
const { calculateNumerology } = require('../utils/numerology');

// Get numerology data for the authenticated user
const getNumerology = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      const user = await User.findById(userId);
      const fallbackName = user?.email ? user.email.split('@')[0] : 'Seeker';
      profile = await Profile.create({
        user_id: userId,
        full_name: fallbackName,
        date_of_birth: '2000-01-01',
        place_of_birth: 'Unknown',
        time_of_birth: '12:00',
        gender: 'neutral'
      });
    }

    // Calculate fresh or load existing numerology
    let numerology = profile.numerology_data;
    const hasCompleteNumerology =
      numerology &&
      numerology.life_path &&
      (numerology.destiny || numerology.destiny_number) &&
      numerology.personal_year;

    if (!hasCompleteNumerology) {
      numerology = calculateNumerology({
        full_name: profile.full_name || 'Seeker',
        date_of_birth: profile.date_of_birth || '2000-01-01'
      });
      profile.numerology_data = numerology;
      profile.updated_at = new Date();
      await profile.save();
    } else {
      // Ensure alias fields are present
      if (!numerology.destiny && numerology.destiny_number) {
        numerology.destiny = String(numerology.destiny_number);
      }
      if (!numerology.destiny_number && numerology.destiny) {
        numerology.destiny_number = String(numerology.destiny);
      }
    }

    res.json({
      success: true,
      numerology,
      data: numerology
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
