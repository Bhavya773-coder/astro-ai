const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Report = require('../models/Report');
const llmService = require('../services/llmService');

const getZodiacProperties = (sign) => {
  const zodiacData = {
    'Aries': { element: 'Fire', quality: 'Cardinal', ruler: 'Mars' },
    'Taurus': { element: 'Earth', quality: 'Fixed', ruler: 'Venus' },
    'Gemini': { element: 'Air', quality: 'Mutable', ruler: 'Mercury' },
    'Cancer': { element: 'Water', quality: 'Cardinal', ruler: 'Moon' },
    'Leo': { element: 'Fire', quality: 'Fixed', ruler: 'Sun' },
    'Virgo': { element: 'Earth', quality: 'Mutable', ruler: 'Mercury' },
    'Libra': { element: 'Air', quality: 'Cardinal', ruler: 'Venus' },
    'Scorpio': { element: 'Water', quality: 'Fixed', ruler: 'Pluto' },
    'Sagittarius': { element: 'Fire', quality: 'Mutable', ruler: 'Jupiter' },
    'Capricorn': { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn' },
    'Aquarius': { element: 'Air', quality: 'Fixed', ruler: 'Uranus' },
    'Pisces': { element: 'Water', quality: 'Mutable', ruler: 'Neptune' }
  };
  return zodiacData[sign] || { element: 'Unknown', quality: 'Unknown', ruler: 'Unknown' };
};

// Check if user has generated insights
const getInsightStatus = async (req, res, next) => {
  try {
    console.log('Profile API - getInsightStatus called');
    console.log('User ID from token:', req.user);
    
    const userId = req.user.userId;

    // Find user's profile
    const profile = await Profile.findOne({ user_id: userId });
    console.log('Profile found:', !!profile);

    if (!profile) {
      console.log('No profile found for user');
      return res.json({
        success: false,
        message: 'No profile found'
      });
    }

    // Check if insights have been generated
    const insightsGenerated = profile.insights_generated || false;
    console.log('Insights generated flag:', insightsGenerated);

    res.json({
      success: true,
      profile: {
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        time_of_birth: profile.time_of_birth,
        place_of_birth: profile.place_of_birth,
        gender: profile.gender,
        birth_chart_data: profile.birth_chart_data,
        insights_generated: insightsGenerated
      }
    });

  } catch (error) {
    console.error('Error checking insight status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check insight status'
    });
  }
};

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    console.log('Profile API - getProfile called');
    const userId = req.user.userId;

    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Save basic profile information
const saveBasicProfile = async (req, res, next) => {
  try {
    console.log('Profile API - saveBasicProfile called');
    console.log('User ID from token:', req.user);
    console.log('Request body:', req.body);
    
    const userId = req.user.userId;
    const {
      full_name,
      date_of_birth,
      time_of_birth,
      place_of_birth,
      gender,
      current_location
    } = req.body;

    // Validate required fields
    if (!full_name || !date_of_birth || !place_of_birth) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Full name, date of birth, and place of birth are required'
      });
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ user_id: userId });
    console.log('Existing profile found:', !!profile);

    if (profile) {
      // Update existing profile
      profile.full_name = full_name;
      profile.date_of_birth = date_of_birth;
      profile.time_of_birth = time_of_birth;
      profile.place_of_birth = place_of_birth;
      profile.gender = gender;
      profile.current_location = current_location;
      profile.updated_at = new Date();
      await profile.save();
      console.log('Profile updated successfully');
    } else {
      // Create new profile
      profile = await Profile.create({
        user_id: userId,
        full_name,
        date_of_birth,
        time_of_birth,
        place_of_birth,
        gender,
        current_location,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('Profile created successfully');
    }

    res.json({
      success: true,
      message: 'Basic profile saved successfully',
      profile
    });

  } catch (error) {
    console.error('Error saving basic profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save basic profile'
    });
  }
};

// Save life context information
const saveLifeContext = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      career_stage,
      relationship_status,
      main_life_focus,
      personality_style,
      primary_life_problem
    } = req.body;

    // Validate required fields
    if (!career_stage || !relationship_status || !main_life_focus || !personality_style || !primary_life_problem) {
      return res.status(400).json({
        success: false,
        message: 'All life context fields are required'
      });
    }

    // Find and update profile
    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete basic profile first.'
      });
    }

    // Update life context
    profile.life_context = {
      career_stage,
      relationship_status,
      main_life_focus,
      personality_style,
      primary_life_problem
    };
    profile.updated_at = new Date();
    await profile.save();

    res.json({
      success: true,
      message: 'Life context saved successfully',
      profile
    });

  } catch (error) {
    console.error('Error saving life context:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save life context'
    });
  }
};

// Generate astrology and numerology insights
const generateInsights = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log('Generate insights called for user:', userId);

    // Get user profile
    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if insights are already generated
    if (profile.insights_generated) {
      console.log('Insights already generated for user:', userId);
      return res.json({
        success: true,
        message: 'Insights already generated',
        insights: {
          birth_chart_data: profile.birth_chart_data,
          numerology_data: profile.numerology_data
        }
      });
    }

    // Check if profile has required data
    if (!profile.full_name || !profile.date_of_birth || !profile.place_of_birth) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete profile data. Please complete all required fields.'
      });
    }

    // Prepare data for LLM
    const userData = {
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
      time_of_birth: profile.time_of_birth,
      place_of_birth: profile.place_of_birth,
      life_context: profile.life_context || {}
    };

    console.log('Generating insights for user data:', userData);

    // Generate insights using LLM service
    const insights = await llmService.generateAstrologyInsights(userData);

    // Update profile with generated insights and mark as generated
    await Profile.updateOne(
      { user_id: userId },
      {
        birth_chart_data: insights.birth_chart_data,
        numerology_data: insights.numerology_data,
        insights_generated: true,
        insights_generated_at: new Date(),
        updated_at: new Date()
      }
    );

    // Save birth chart to reports collection so Birth Chart page loads instantly
    const bc = insights.birth_chart_data;
    const sunSign = bc?.sun_sign || llmService.getSunSign?.(profile.date_of_birth) || 'Leo';
    const moonSign = bc?.moon_sign || 'Taurus';
    const ascendant = bc?.ascendant || sunSign;
    const dominantPlanet = bc?.dominant_planet || getZodiacProperties(sunSign).ruler;
    const sunProps = getZodiacProperties(sunSign);
    const moonProps = getZodiacProperties(moonSign);
    const ascProps = getZodiacProperties(ascendant);
    const birthChart = {
      enhanced_birth_chart_data: {
        sun_sign: { sign: sunSign, ...sunProps, description: `${sunSign} represents your core identity.` },
        moon_sign: { sign: moonSign, ...moonProps, description: `${moonSign} represents your emotional nature.` },
        ascendant: { sign: ascendant, ...ascProps, description: `${ascendant} represents how others perceive you.` },
        dominant_planet: { planet: dominantPlanet, sign: sunSign, element: sunProps.element, description: `${dominantPlanet} influences your personality.` }
      },
      detailed_analysis: { personality_overview: 'Your unique cosmic blueprint.', strengths: [], challenges: [], life_purpose: '', career_insights: '', relationship_insights: '', spiritual_path: '', timing_advice: '' },
      planetary_positions: { sun: { sign: sunSign, degree: 120 }, moon: { sign: moonSign, degree: 60 } },
      aspects: [],
      houses: {},
      elements: {},
      modalities: {},
      dominant_patterns: {}
    };
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Save to reports collection - wrapped in try-catch to handle validation issues
    try {
      // First check if document exists
      const existingReport = await Report.findOne({ user_id: userObjectId, report_type: 'birth_chart' });
      
      if (existingReport) {
        // Update existing document
        await Report.updateOne(
          { user_id: userObjectId, report_type: 'birth_chart' },
          { 
            $set: { 
              content: birthChart, 
              summary: `Birth chart for ${profile.full_name}`, 
              updated_at: new Date() 
            } 
          }
        );
        console.log('✅ Birth chart updated in reports for user:', userId);
      } else {
        // Create new document - use insertOne with all required fields
        const newReport = new Report({
          user_id: userObjectId,
          report_type: 'birth_chart',
          content: birthChart, 
          summary: `Birth chart for ${profile.full_name}`, 
          generated_at: new Date(), 
          updated_at: new Date() 
        });
        await newReport.save({ validateBeforeSave: false });
        console.log('✅ Birth chart saved to reports for user:', userId);
      }
    } catch (reportError) {
      console.error('⚠️ Failed to save to reports collection (non-critical):', reportError.message);
      if (reportError.code === 121) {
        console.error('MongoDB Validation Error on reports collection:', JSON.stringify(reportError.errInfo, null, 2));
      }
      // Continue - this is not critical as KundliReport is the main storage
    }

    console.log('Insights generated and saved for user:', userId);

    res.json({
      success: true,
      message: 'Insights generated successfully',
      insights
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    if (error.code === 121) {
      console.error('MongoDB Validation Error Details:', error.errInfo);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  getInsightStatus,
  saveBasicProfile,
  saveLifeContext,
  generateInsights
};
