const axios = require('axios');
const { asyncHandler } = require('../middleware/asyncHandler');
const Profile = require('../models/Profile');
const KundliReport = require('../models/KundliReport');
const llmService = require('../services/llmService');
const { calculateKundliChart } = require('../services/kundliCalculator');

async function geocodePlace(place) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const response = await axios.get(url, {
    params: {
      q: place,
      format: 'json',
      limit: 1
    },
    headers: {
      'User-Agent': 'AstroAI-Kundli/1.0 (backend)'
    }
  });

  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('Unable to geocode place_of_birth');
  }

  const { lat, lon } = response.data[0];
  return {
    latitude: Number(lat),
    longitude: Number(lon)
  };
}

const getKundliReport = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  console.log('🔮 Kundli generation started for user:', userId);

  const profile = await Profile.findOne({ user_id: userId });
  if (!profile) {
    console.log('❌ No profile found for user:', userId);
    return res.status(400).json({
      success: false,
      message: 'Please complete your profile first. Redirecting to onboarding...',
      redirectToOnboarding: true
    });
  }

  const requiredFields = ['full_name', 'date_of_birth', 'time_of_birth', 'place_of_birth'];
  const missingFields = requiredFields.filter((field) => !profile[field]);

  if (missingFields.length > 0) {
    console.log('❌ Missing profile fields:', missingFields);
    return res.status(400).json({
      success: false,
      message: 'Please complete your profile first. Redirecting to onboarding...',
      redirectToOnboarding: true
    });
  }

  // 1. Try existing KundliReport
  const existing = await KundliReport.findOne({ user_id: userId });
  if (existing) {
    console.log('✅ Found existing Kundli for user:', userId);
    return res.json({
      success: true,
      source: 'cache',
      data: existing
    });
  }

  console.log('📍 Geocoding location:', profile.place_of_birth);
  // 2. Geocode place_of_birth
  const { latitude, longitude } = await geocodePlace(profile.place_of_birth);
  console.log('📍 Got coordinates:', { latitude, longitude });

  const birthDetails = {
    full_name: profile.full_name,
    date_of_birth: profile.date_of_birth,
    time_of_birth: profile.time_of_birth,
    place_of_birth: profile.place_of_birth,
    latitude,
    longitude
  };

  console.log('🪐 Calculating chart with Swiss Ephemeris...');
  // 3. Calculate chart using Swiss Ephemeris (no LLM here)
  const chart_data = await calculateKundliChart({
    date_of_birth: birthDetails.date_of_birth,
    time_of_birth: birthDetails.time_of_birth,
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude
  });
  console.log('✅ Chart calculated successfully');

  console.log('🤖 Generating AI interpretation...');
  // 4. Ask LLM only for interpretation (with timeout)
  let interpretation;
  try {
    const prompt = `
You are an experienced Vedic astrologer providing precise birth chart interpretation.

STRICT RULES:
- Use ONLY the exact planetary positions provided
- DO NOT invent any planetary placements
- Reference specific degrees and signs
- Apply authentic Vedic astrology principles
- Avoid generic astrology statements

BIRTH CHART DATA:
Ascendant (Lagna): ${chart_data.ascendant}
Moon Sign: ${chart_data.moon_sign}
Sun Sign: ${chart_data.sun_sign}
Nakshatra: ${chart_data.nakshatra}

PLANETARY POSITIONS:
${Object.entries(chart_data.planets).map(([planet, data]) => 
  `${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.sign} at ${data.degree}°`
).join('\n')}

HOUSE POSITIONS:
${Object.entries(chart_data.houses).map(([house, sign]) => 
  `House ${house}: ${sign}`
).join('\n')}

ANALYSIS INSTRUCTIONS:
1. Ascendant determines core personality and life approach
2. Moon sign governs emotional nature and inner self
3. Sun sign represents ego, vitality and soul purpose
4. Analyze planets in houses for life area effects
5. Consider planetary aspects and conjunctions
6. Identify major yogas (Raja Yoga, Gaj Kesari, Budha Aditya, etc.)
7. Evaluate career (10th house), relationships (7th house), wealth (2nd/11th), health (6th)
8. Use specific degrees for precise interpretations

WRITING STYLE:
- Reference exact placements (e.g., "Mars at 10.4° in Taurus in 4th house")
- Provide astrological reasoning for each interpretation
- Keep each section under 120 words
- Be specific and evidence-based

Return JSON only:
{
"personality":"",
"strengths":"",
"challenges":"",
"career":"",
"relationships":"",
"health":"",
"spiritual_path":"",
"important_yogas":[]
}`;

    const llmResponse = await Promise.race([
      llmService.callLLM(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLM timeout after 2 minutes')), 120000)
      )
    ]);
    
    let raw = llmResponse.choices[0].message.content || '{}';
    const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) raw = codeMatch[1];
    raw = raw.trim();

    interpretation = JSON.parse(raw);
  } catch (error) {
    console.error('LLM interpretation failed:', error.message);
    // Fallback interpretation
    interpretation = {
      personality: `Based on your ${chart_data.ascendant} ascendant and ${chart_data.moon_sign} moon sign, you have a unique personality that blends practical ambition with emotional depth. Your ascendant sets the foundation for your life approach, while the moon sign reveals your inner emotional nature.`,
      strengths: `Your ${chart_data.sun_sign} sun sign gives you natural leadership qualities, while your chart shows strong determination and analytical abilities. The planetary positions suggest resilience and adaptability as key strengths.`,
      challenges: `You may face challenges balancing your professional ambitions with personal relationships. Learning to manage stress and maintain work-life harmony is key, as indicated by your chart patterns.`,
      career: `Your chart suggests success in careers that require both analytical thinking and creativity. Fields like management, research, or entrepreneurship could be suitable based on your planetary placements.`,
      relationships: `You seek deep emotional connections and value loyalty in relationships. Your ideal partner is someone who understands your need for both independence and emotional security.`,
      health: `Pay attention to stress management and regular exercise. Your chart indicates sensitivity to nervous system health, so meditation and yoga could be beneficial.`,
      spiritual_path: `Your spiritual journey involves integrating practical wisdom with emotional intelligence. Meditation and self-reflection will help you find inner balance and purpose.`,
      important_yogas: []
    };
    console.log('🤖 Using fallback interpretation');
  }

  console.log('💾 Saving Kundli report to database...');
  // 5. Persist KundliReport
  const kundliReport = new KundliReport({
    user_id: userId,
    birth_details: birthDetails,
    chart_data,
    interpretation
  });

  await kundliReport.save();
  console.log('✅ Kundli report saved successfully');

  return res.json({
    success: true,
    source: 'generated',
    data: kundliReport
  });
});

const getBirthChart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  console.log('🔍 Birth Chart API called for user:', userId);

  // 1. Get logged-in user ID - already done
  if (!userId) {
    console.log('❌ User not authenticated');
    return res.status(401).json({
      message: 'User not authenticated'
    });
  }

  // 2. Query kundli_reports using user_id
  const existingKundli = await KundliReport.findOne({ user_id: userId });
  
  // 3. If kundli exists, return chart_data from the database
  if (existingKundli && existingKundli.chart_data) {
    // Validate chart_data structure
    const requiredFields = ['ascendant', 'moon_sign', 'sun_sign', 'nakshatra', 'planets', 'houses'];
    const missingFields = requiredFields.filter((field) => !existingKundli.chart_data[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Corrupted chart data detected, missing fields:', missingFields);
      return res.status(500).json({
        message: 'Birth chart data unavailable. Please regenerate kundli.'
      });
    }
    
    console.log('✅ Found existing Kundli for user:', userId);
    return res.json({
      success: true,
      source: 'database',
      data: {
        birth_details: existingKundli.birth_details,
        chart_data: existingKundli.chart_data,
        interpretation: existingKundli.interpretation
      }
    });
  }

  // 4. If kundli does not exist, check if profile exists
  const profile = await Profile.findOne({ user_id: userId });
  if (!profile) {
    console.log('❌ No profile found for user:', userId);
    return res.status(404).json({
      message: 'User profile not found. Please complete your birth details.'
    });
  }

  // Check required profile fields
  const requiredFields = ['full_name', 'date_of_birth', 'time_of_birth', 'place_of_birth'];
  const missingFields = requiredFields.filter((field) => !profile[field]);

  if (missingFields.length > 0) {
    console.log('❌ Missing profile fields:', missingFields);
    return res.status(400).json({
      message: 'User profile not found. Please complete your birth details.'
    });
  }

  // 5. Generate kundli using the existing profile data logic
  console.log('📍 Geocoding location:', profile.place_of_birth);
  const { latitude, longitude } = await geocodePlace(profile.place_of_birth);
  console.log('📍 Got coordinates:', { latitude, longitude });

  const birthDetails = {
    full_name: profile.full_name,
    date_of_birth: profile.date_of_birth,
    time_of_birth: profile.time_of_birth,
    place_of_birth: profile.place_of_birth,
    latitude,
    longitude
  };

  console.log('🪐 Calculating chart with Swiss Ephemeris...');
  const chart_data = await calculateKundliChart({
    date_of_birth: birthDetails.date_of_birth,
    time_of_birth: birthDetails.time_of_birth,
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude
  });
  console.log('✅ Chart calculated successfully');

  // 6. Save the result in kundli_reports
  console.log('💾 Saving new Kundli report to database...');
  const kundliReport = new KundliReport({
    user_id: userId,
    birth_details: birthDetails,
    chart_data,
    interpretation: {
      personality: `Based on your ${chart_data.ascendant} ascendant and ${chart_data.moon_sign} moon sign, you have a unique personality blending practical ambition with emotional depth.`,
      strengths: `Your ${chart_data.sun_sign} sun sign provides natural leadership qualities and determination.`,
      challenges: 'Balancing professional ambitions with personal relationships is a key challenge.',
      career: 'Careers requiring analytical thinking and creativity are well-suited for you.',
      relationships: 'You seek deep emotional connections and value loyalty in relationships.',
      health: 'Regular exercise and stress management through meditation and yoga are beneficial.',
      spiritual_path: 'Your spiritual journey involves integrating practical wisdom with emotional intelligence.',
      important_yogas: []
    }
  });

  await kundliReport.save();
  console.log('✅ New Kundli report saved successfully');

  // 7. Return the generated chart
  return res.json({
    success: true,
    source: 'generated',
    data: {
      birth_details: kundliReport.birth_details,
      chart_data: kundliReport.chart_data
    }
  });
});

module.exports = {
  getKundliReport,
  getBirthChart
};

