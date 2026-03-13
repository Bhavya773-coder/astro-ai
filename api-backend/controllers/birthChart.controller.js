const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Report = require('../models/Report');
const llmService = require('../services/llmService');

// Helper function to get zodiac sign properties
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

// Get birth chart data for authenticated user
const getBirthChart = async (req, res, next) => {
  try {
    console.log('Birth Chart API - getBirthChart called');
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
    if (!profile.insights_generated) {
      // Try to generate basic zodiac data from birth date even if insights aren't generated
      const basicZodiacData = llmService.getEnhancedDefaultBirthChart({
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        time_of_birth: profile.time_of_birth,
        place_of_birth: profile.place_of_birth,
        gender: profile.gender,
        life_context: profile.life_context,
        numerology_data: profile.numerology_data
      });

      return res.json({
        success: true,
        message: 'Generate your insights to unlock detailed birth chart analysis',
        birthChart: basicZodiacData,
        sunSign: basicZodiacData.enhanced_birth_chart_data.sun_sign.sign,
        moonSign: basicZodiacData.enhanced_birth_chart_data.moon_sign.sign,
        ascendant: basicZodiacData.enhanced_birth_chart_data.ascendant.sign,
        dominantPlanet: basicZodiacData.enhanced_birth_chart_data.dominant_planet.planet
      });
    }

    // Always prefer cached birth chart from DB when it exists (no regeneration on GET)
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    if (!userObjectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const cachedReport = await Report.findOne({ 
      user_id: userObjectId, 
      report_type: 'birth_chart' 
    }).sort({ generated_at: -1 });

    if (cachedReport && cachedReport.content) {
      console.log('Returning cached birth chart from DB, generated at:', cachedReport.generated_at);
      const content = cachedReport.content;
      return res.json({
        success: true,
        message: 'Birth chart loaded from database',
        birthChart: content,
        cached: true,
        sunSign: content.enhanced_birth_chart_data?.sun_sign?.sign || (typeof content.sun_sign === 'string' ? content.sun_sign : 'Leo'),
        moonSign: content.enhanced_birth_chart_data?.moon_sign?.sign || (typeof content.moon_sign === 'string' ? content.moon_sign : 'Taurus'),
        ascendant: content.enhanced_birth_chart_data?.ascendant?.sign || (typeof content.ascendant === 'string' ? content.ascendant : 'Leo'),
        dominantPlanet: content.enhanced_birth_chart_data?.dominant_planet?.planet || (typeof content.dominant_planet === 'string' ? content.dominant_planet : 'Sun')
      });
    }

    console.log('No cached birth chart found in DB, building from profile (no LLM - fast path)...');

    // Build birth chart from profile.birth_chart_data - no slow LLM call for initial load
    // Profile already has sun_sign, moon_sign, ascendant, dominant_planet from onboarding
    const birthChartAnalysis = null;

    // Create comprehensive birth chart data from profile
    const birthChart = {
      enhanced_birth_chart_data: {
        // If we have simple string data, convert it to expected object structure
        sun_sign: typeof profile.birth_chart_data?.sun_sign === 'string' 
          ? { 
              sign: profile.birth_chart_data.sun_sign, 
              ...getZodiacProperties(profile.birth_chart_data.sun_sign),
              description: `${profile.birth_chart_data.sun_sign} represents your core identity and life purpose. As a ${getZodiacProperties(profile.birth_chart_data.sun_sign).element} sign, you embody ${getZodiacProperties(profile.birth_chart_data.sun_sign).element.toLowerCase()} energy.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.sun_sign ? birthChartAnalysis.enhanced_birth_chart_data.sun_sign : {
              sign: 'Leo',
              element: 'Fire',
              quality: 'Fixed',
              ruler: 'Sun',
              description: 'Leo represents your core identity and life purpose. As a Fire sign, you embody fire energy and fixed characteristics.'
            }),
        moon_sign: typeof profile.birth_chart_data?.moon_sign === 'string'
          ? { 
              sign: profile.birth_chart_data.moon_sign, 
              ...getZodiacProperties(profile.birth_chart_data.moon_sign),
              description: `${profile.birth_chart_data.moon_sign} represents your emotional nature and inner world. Your ${getZodiacProperties(profile.birth_chart_data.moon_sign).element} moon sign influences your feelings and instincts.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.moon_sign ? birthChartAnalysis.enhanced_birth_chart_data.moon_sign : {
              sign: 'Taurus',
              element: 'Earth',
              quality: 'Fixed',
              ruler: 'Venus',
              description: 'Taurus represents your emotional nature and inner world. Your Earth moon sign provides stability and practicality.'
            }),
        ascendant: typeof profile.birth_chart_data?.ascendant === 'string'
          ? { 
              sign: profile.birth_chart_data.ascendant, 
              ...getZodiacProperties(profile.birth_chart_data.ascendant),
              description: `${profile.birth_chart_data.ascendant} represents how others perceive you and your approach to life. Your ${getZodiacProperties(profile.birth_chart_data.ascendant).element} rising sign shapes your first impressions.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.ascendant ? birthChartAnalysis.enhanced_birth_chart_data.ascendant : {
              sign: 'Leo',
              element: 'Fire',
              quality: 'Fixed',
              ruler: 'Sun',
              description: 'Leo represents how others perceive you and your approach to life. Your Fire rising sign gives you a charismatic first impression.'
            }),
        dominant_planet: typeof profile.birth_chart_data?.dominant_planet === 'string'
          ? { 
              planet: profile.birth_chart_data.dominant_planet, 
              sign: profile.birth_chart_data.sun_sign || 'Leo', 
              element: getZodiacProperties(profile.birth_chart_data.sun_sign || 'Leo').element,
              description: `${profile.birth_chart_data.dominant_planet} is your ruling planet, strongly influencing your personality and life path. This planetary energy shapes your core motivations and drives.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.dominant_planet ? birthChartAnalysis.enhanced_birth_chart_data.dominant_planet : {
              planet: 'Sun',
              sign: 'Leo',
              element: 'Fire',
              description: 'The Sun is your ruling planet, strongly influencing your personality and life path. This solar energy shapes your core motivations.'
            })
      },
      detailed_analysis: birthChartAnalysis ? birthChartAnalysis.detailed_analysis : {
        personality_overview: 'Your personality combines creative self-expression with emotional depth and confident presence.',
        strengths: ['Natural leadership', 'Emotional intelligence', 'Strong determination', 'Natural charisma'],
        challenges: ['Balancing needs', 'Managing ego', 'Developing patience', 'Avoiding impulsiveness'],
        life_purpose: 'Your life purpose involves expressing your unique creativity while building stable foundations.',
        career_insights: 'You thrive in careers that allow creative expression and leadership.',
        relationship_insights: 'In relationships, you seek both deep emotional connection and admiration.',
        spiritual_path: 'Your spiritual journey involves balancing self-expression with inner wisdom.',
        timing_advice: 'Current period favors creative projects and relationship building.'
      },
      planetary_positions: birthChartAnalysis ? birthChartAnalysis.planetary_positions : {
        sun: { sign: 'Leo', degree: 120 },
        moon: { sign: 'Taurus', degree: 60 },
        mercury: { sign: 'Virgo', degree: 180 },
        venus: { sign: 'Libra', degree: 240 }
      },
      aspects: birthChartAnalysis ? birthChartAnalysis.aspects : [
        { planets: ['Sun', 'Moon'], type: 'Conjunction', angle: 0, meaning: 'Harmony between conscious and unconscious' },
        { planets: ['Sun', 'Mercury'], type: 'Trine', angle: 120, meaning: 'Easy self-expression and communication' }
      ],
      houses: birthChartAnalysis ? birthChartAnalysis.houses : {
        1: { sign: 'Leo', meaning: 'Self and identity' },
        2: { sign: 'Virgo', meaning: 'Values and possessions' },
        3: { sign: 'Libra', meaning: 'Communication and thinking' },
        4: { sign: 'Scorpio', meaning: 'Home and family' },
        5: { sign: 'Sagittarius', meaning: 'Creativity and romance' }
      },
      elements: birthChartAnalysis ? birthChartAnalysis.elements : {
        fire: { count: 2, meaning: 'Passion and inspiration' },
        earth: { count: 1, meaning: 'Stability and practicality' },
        air: { count: 1, meaning: 'Intellect and communication' },
        water: { count: 1, meaning: 'Emotion and intuition' }
      },
      modalities: birthChartAnalysis ? birthChartAnalysis.modalities : {
        cardinal: { count: 1, meaning: 'Initiation and leadership' },
        fixed: { count: 2, meaning: 'Stability and determination' },
        mutable: { count: 1, meaning: 'Adaptability and flexibility' }
      },
      dominant_patterns: birthChartAnalysis ? birthChartAnalysis.dominant_patterns : {
        element: 'Fire',
        modality: 'Fixed',
        ruling_planet: 'Sun'
      }
    };

    // Cache the birth chart in the reports collection
    try {
      console.log('Caching birth chart in reports collection...');
      
      // Ensure userObjectId is valid before saving
      const reportUserId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : null;
      
      if (!reportUserId) {
        console.error('Invalid userId for caching birth chart:', userId);
        throw new Error('Invalid user ID format');
      }
      
      const report = new Report({
        user_id: reportUserId,
        report_type: 'birth_chart',
        content: birthChart,
        summary: `Birth chart for ${profile.full_name} - Sun: ${birthChart.enhanced_birth_chart_data.sun_sign.sign}, Moon: ${birthChart.enhanced_birth_chart_data.moon_sign.sign}, Ascendant: ${birthChart.enhanced_birth_chart_data.ascendant.sign}`,
        generated_at: new Date()
      });
      
      await report.save();
      console.log('Birth chart cached successfully');
    } catch (cacheError) {
      console.error('Failed to cache birth chart:', cacheError);
      // Continue even if caching fails
    }

    console.log('Birth chart data prepared and cached');

    res.json({
      success: true,
      message: 'Birth chart generated successfully',
      birthChart,
      cached: false,
      sunSign: birthChart.enhanced_birth_chart_data?.sun_sign?.sign || 'Leo',
      moonSign: birthChart.enhanced_birth_chart_data?.moon_sign?.sign || 'Taurus',
      ascendant: birthChart.enhanced_birth_chart_data?.ascendant?.sign || 'Leo',
      dominantPlanet: birthChart.enhanced_birth_chart_data?.dominant_planet?.planet || 'Sun'
    });

  } catch (error) {
    console.error('Error fetching birth chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch birth chart data'
    });
  }
};

// Refresh birth chart (force regeneration)
const refreshBirthChart = async (req, res, next) => {
  try {
    console.log('Birth Chart API - refreshBirthChart called');
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
    if (!profile.insights_generated) {
      return res.status(400).json({
        success: false,
        message: 'Generate your insights first to unlock detailed birth chart analysis'
      });
    }

    // Delete existing cached birth chart reports
    console.log('Deleting existing cached birth chart reports...');
    await Report.deleteMany({ 
      user_id: userId, 
      report_type: 'birth_chart' 
    });

    // Generate fresh birth chart analysis
    console.log('Generating fresh birth chart analysis...');
    let birthChartAnalysis;
    try {
      birthChartAnalysis = await llmService.generateDetailedBirthChart({
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        time_of_birth: profile.time_of_birth,
        place_of_birth: profile.place_of_birth,
        gender: profile.gender,
        life_context: profile.life_context,
        numerology_data: profile.numerology_data,
        existing_birth_chart_data: profile.birth_chart_data
      });
    } catch (error) {
      console.error('LLM Service Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate fresh birth chart. AI service unavailable.'
      });
    }

    // Create comprehensive birth chart data
    const birthChart = {
      enhanced_birth_chart_data: {
        sun_sign: typeof profile.birth_chart_data?.sun_sign === 'string' 
          ? { 
              sign: profile.birth_chart_data.sun_sign, 
              ...getZodiacProperties(profile.birth_chart_data.sun_sign),
              description: `${profile.birth_chart_data.sun_sign} represents your core identity and life purpose. As a ${getZodiacProperties(profile.birth_chart_data.sun_sign).element} sign, you embody ${getZodiacProperties(profile.birth_chart_data.sun_sign).element.toLowerCase()} energy.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.sun_sign ? birthChartAnalysis.enhanced_birth_chart_data.sun_sign : {
              sign: 'Leo',
              element: 'Fire',
              quality: 'Fixed',
              ruler: 'Sun',
              description: 'Leo represents your core identity and life purpose. As a Fire sign, you embody fire energy and fixed characteristics.'
            }),
        moon_sign: typeof profile.birth_chart_data?.moon_sign === 'string'
          ? { 
              sign: profile.birth_chart_data.moon_sign, 
              ...getZodiacProperties(profile.birth_chart_data.moon_sign),
              description: `${profile.birth_chart_data.moon_sign} represents your emotional nature and inner world. Your ${getZodiacProperties(profile.birth_chart_data.moon_sign).element} moon sign influences your feelings and instincts.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.moon_sign ? birthChartAnalysis.enhanced_birth_chart_data.moon_sign : {
              sign: 'Taurus',
              element: 'Earth',
              quality: 'Fixed',
              ruler: 'Venus',
              description: 'Taurus represents your emotional nature and inner world. Your Earth moon sign provides stability and practicality.'
            }),
        ascendant: typeof profile.birth_chart_data?.ascendant === 'string'
          ? { 
              sign: profile.birth_chart_data.ascendant, 
              ...getZodiacProperties(profile.birth_chart_data.ascendant),
              description: `${profile.birth_chart_data.ascendant} represents how others perceive you and your approach to life. Your ${getZodiacProperties(profile.birth_chart_data.ascendant).element} rising sign shapes your first impressions.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.ascendant ? birthChartAnalysis.enhanced_birth_chart_data.ascendant : {
              sign: 'Leo',
              element: 'Fire',
              quality: 'Fixed',
              ruler: 'Sun',
              description: 'Leo represents how others perceive you and your approach to life. Your Fire rising sign gives you a charismatic first impression.'
            }),
        dominant_planet: typeof profile.birth_chart_data?.dominant_planet === 'string'
          ? { 
              planet: profile.birth_chart_data.dominant_planet, 
              sign: profile.birth_chart_data.sun_sign || 'Leo', 
              element: getZodiacProperties(profile.birth_chart_data.sun_sign || 'Leo').element,
              description: `${profile.birth_chart_data.dominant_planet} is your ruling planet, strongly influencing your personality and life path. This planetary energy shapes your core motivations and drives.` 
            }
          : (birthChartAnalysis && birthChartAnalysis.enhanced_birth_chart_data?.dominant_planet ? birthChartAnalysis.enhanced_birth_chart_data.dominant_planet : {
              planet: 'Sun',
              sign: 'Leo',
              element: 'Fire',
              description: 'The Sun is your ruling planet, strongly influencing your personality and life path. This solar energy shapes your core motivations.'
            })
      },
      detailed_analysis: birthChartAnalysis ? birthChartAnalysis.detailed_analysis : {
        personality_overview: 'Your personality combines creative self-expression with emotional depth and confident presence.',
        strengths: ['Natural leadership', 'Emotional intelligence', 'Strong determination', 'Natural charisma'],
        challenges: ['Balancing needs', 'Managing ego', 'Developing patience', 'Avoiding impulsiveness'],
        life_purpose: 'Your life purpose involves expressing your unique creativity while building stable foundations.',
        career_insights: 'You thrive in careers that allow creative expression and leadership.',
        relationship_insights: 'In relationships, you seek both deep emotional connection and admiration.',
        spiritual_path: 'Your spiritual journey involves balancing self-expression with inner wisdom.',
        timing_advice: 'Current period favors creative projects and relationship building.'
      },
      planetary_positions: birthChartAnalysis ? birthChartAnalysis.planetary_positions : {
        sun: { sign: 'Leo', degree: 120 },
        moon: { sign: 'Taurus', degree: 60 },
        mercury: { sign: 'Virgo', degree: 180 },
        venus: { sign: 'Libra', degree: 240 }
      },
      aspects: birthChartAnalysis ? birthChartAnalysis.aspects : [
        { planets: ['Sun', 'Moon'], type: 'Conjunction', angle: 0, meaning: 'Harmony between conscious and unconscious' },
        { planets: ['Sun', 'Mercury'], type: 'Trine', angle: 120, meaning: 'Easy self-expression and communication' }
      ],
      houses: birthChartAnalysis ? birthChartAnalysis.houses : {
        1: { sign: 'Leo', meaning: 'Self and identity' },
        2: { sign: 'Virgo', meaning: 'Values and possessions' },
        3: { sign: 'Libra', meaning: 'Communication and thinking' },
        4: { sign: 'Scorpio', meaning: 'Home and family' },
        5: { sign: 'Sagittarius', meaning: 'Creativity and romance' }
      },
      elements: birthChartAnalysis ? birthChartAnalysis.elements : {
        fire: { count: 2, meaning: 'Passion and inspiration' },
        earth: { count: 1, meaning: 'Stability and practicality' },
        air: { count: 1, meaning: 'Intellect and communication' },
        water: { count: 1, meaning: 'Emotion and intuition' }
      },
      modalities: birthChartAnalysis ? birthChartAnalysis.modalities : {
        cardinal: { count: 1, meaning: 'Initiation and leadership' },
        fixed: { count: 2, meaning: 'Stability and determination' },
        mutable: { count: 1, meaning: 'Adaptability and flexibility' }
      },
      dominant_patterns: birthChartAnalysis ? birthChartAnalysis.dominant_patterns : {
        element: 'Fire',
        modality: 'Fixed',
        ruling_planet: 'Sun'
      }
    };

    // Cache the fresh birth chart in the reports collection
    try {
      console.log('Caching fresh birth chart in reports collection...');
      
      // Ensure userId is converted to ObjectId
      const reportUserId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : null;
      
      if (!reportUserId) {
        console.error('Invalid userId for caching birth chart:', userId);
        throw new Error('Invalid user ID format');
      }
      
      const report = new Report({
        user_id: reportUserId,
        report_type: 'birth_chart',
        content: birthChart,
        summary: `Birth chart for ${profile.full_name} - Sun: ${birthChart.enhanced_birth_chart_data.sun_sign.sign}, Moon: ${birthChart.enhanced_birth_chart_data.moon_sign.sign}, Ascendant: ${birthChart.enhanced_birth_chart_data.ascendant.sign}`,
        generated_at: new Date()
      });
      
      await report.save();
      console.log('Fresh birth chart cached successfully');
    } catch (cacheError) {
      console.error('Failed to cache fresh birth chart:', cacheError);
    }

    console.log('Fresh birth chart data prepared and cached');

    res.json({
      success: true,
      message: 'Birth chart refreshed successfully',
      birthChart,
      cached: false,
      refreshed: true,
      sunSign: birthChart.enhanced_birth_chart_data?.sun_sign?.sign || 'Leo',
      moonSign: birthChart.enhanced_birth_chart_data?.moon_sign?.sign || 'Taurus',
      ascendant: birthChart.enhanced_birth_chart_data?.ascendant?.sign || 'Leo',
      dominantPlanet: birthChart.enhanced_birth_chart_data?.dominant_planet?.planet || 'Sun'
    });

  } catch (error) {
    console.error('Error refreshing birth chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh birth chart data'
    });
  }
};

module.exports = {
  getBirthChart,
  refreshBirthChart
};
