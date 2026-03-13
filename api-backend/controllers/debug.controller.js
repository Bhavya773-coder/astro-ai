const Profile = require('../models/Profile');
const { requireAuth } = require('../middleware/auth');

// Debug endpoint to check user's profile data
const debugProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Debug profile called for user:', userId);

    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.json({
        message: 'No profile found',
        userId,
        profile: null
      });
    }

    // Return full profile data for debugging
    res.json({
      message: 'Profile found',
      userId,
      profile: {
        user_id: profile.user_id,
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        time_of_birth: profile.time_of_birth,
        place_of_birth: profile.place_of_birth,
        gender: profile.gender,
        current_location: profile.current_location,
        life_context: profile.life_context,
        birth_chart_data: profile.birth_chart_data,
        numerology_data: profile.numerology_data,
        insights_generated: profile.insights_generated,
        insights_generated_at: profile.insights_generated_at,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Debug profile error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

module.exports = { debugProfile };
