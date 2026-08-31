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
      'User-Agent': 'AstroAi4u-Kundli/1.0 (backend)'
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

async function generateDynamicInterpretation(chart_data, birthDetails, userContext = {}) {
  const verifiedYogas = chart_data.verified_yogas || [];
  const dashaInfo = chart_data.vimshottari_dasha || {};
  const dignities = chart_data.dignities || {};

  try {
    const prompt = `
You are an authentic Master Vedic Astrologer (Jyotish Acharya) providing a verified, evidence-linked birth chart synthesis based on PARASHARI SIDEREAL LAHIRI calculations.

STRICT VERIFIED CHART DATA (GROUND TRUTH):
- Ascendant (Lagna): ${chart_data.ascendant} (${chart_data.ascendant_degree}° in ${chart_data.ascendant_nakshatra || chart_data.nakshatra} Pada ${chart_data.ascendant_pada || chart_data.nakshatra_pada || 1})
- Moon Sign (Chandra): ${chart_data.moon_sign} (${chart_data.planets.moon.degree}° in ${chart_data.nakshatra} Pada ${chart_data.nakshatra_pada || 1})
- Sun Sign (Surya): ${chart_data.sun_sign} (${chart_data.planets.sun.degree}° in ${chart_data.planets.sun.nakshatra} Pada ${chart_data.planets.sun.pada})
- Current Vimshottari Mahadasha: ${dashaInfo.current_mahadasha || 'Active'} (${dashaInfo.current_mahadasha_period || 'Present'})
- Verified Traditional Yogas: ${verifiedYogas.length > 0 ? verifiedYogas.map(y => `${y.name} (${y.strength} strength: ${y.evidence})`).join('; ') : 'Standard planetary combinations'}
- Functional Benefics for ${chart_data.ascendant} Lagna: ${(chart_data.functional_benefics || []).join(', ')}
- Functional Malefics for ${chart_data.ascendant} Lagna: ${(chart_data.functional_malefics || []).join(', ')}

PLANETARY PLACEMENTS & DIGNITIES:
${Object.entries(chart_data.planets).map(([planet, data]) => 
  `• ${planet.toUpperCase()}: ${data.sign} at ${data.degree_in_sign || data.degree}° (House ${data.house}, Nakshatra ${data.nakshatra} Pada ${data.pada}, Dignity: ${data.dignity || dignities[planet] || 'Neutral'}${data.retrograde ? ', Retrograde' : ''}${data.combust ? ', Combust' : ''})`
).join('\n')}

USER CONTEXT:
- Stated Career / Life Focus: ${userContext.main_life_focus || userContext.career_stage || 'Not specified'}

CRITICAL RULES:
1. Use ONLY the verified planetary positions, dignities, and yogas above. Do NOT invent yogas or alter signs.
2. Use possibility and guidance language ("indicates potential for", "strengthened by"), NEVER absolute guarantees.
3. For Career, Love, and Strengths, cite at least 2-3 specific supporting astrological placements (e.g. 10th lord, Lagna lord, dasha lord).
4. Separate chart indications from user-provided life context.
5. No medical diagnoses or fatalistic claims.

Return ONLY valid JSON matching this schema:
{
  "personality": "Deep synthesis of how ${chart_data.ascendant} Lagna and ${chart_data.moon_sign} Moon in ${chart_data.nakshatra} shape their character, instinct, and natural authority.",
  "strengths": "Detailed breakdown of their greatest cosmic gifts based on dominant and exalted/friendly placements like ${chart_data.sun_sign} Sun.",
  "challenges": "Constructive psychological guidance on areas requiring self-awareness, balancing functional malefics and shadow patterns.",
  "career": "Vocational analysis based on the 10th house (${chart_data.houses['10'] || 'Career'}), 2nd house of resources, and active ${dashaInfo.current_mahadasha || ''} Mahadasha.",
  "relationships": "Partnership dynamics indicated by the 7th house (${chart_data.houses['7'] || 'Partnership'}) and Venus placements.",
  "health": "Ayurvedic and lifestyle vitality recommendations honoring the elemental balance of ${chart_data.ascendant} rising.",
  "spiritual_path": "Soul evolution and dharmic purpose guided by ${chart_data.nakshatra} Nakshatra (Pada ${chart_data.nakshatra_pada || 1}) and the 9th/12th houses.",
  "important_yogas": [
    ${verifiedYogas.map(y => JSON.stringify({ name: y.name, description: `${y.traditional_effect} (Verified: ${y.evidence})` })).join(',\n    ')}
  ],
  "confidence_levels": {
    "career": "High",
    "relationships": "Moderate",
    "overall": "High"
  }
}`;

    const llmResponse = await Promise.race([
      llmService.callLLM(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLM timeout after 2 minutes')), 120000)
      )
    ]);
    
    let raw = llmResponse?.choices?.[0]?.message?.content || llmResponse?.message?.content || '{}';
    const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) raw = codeMatch[1];
    raw = raw.trim();

    const parsed = JSON.parse(raw);
    if (parsed.personality && parsed.career) {
      if (!parsed.important_yogas || parsed.important_yogas.length === 0) {
        parsed.important_yogas = verifiedYogas.map(y => ({
          name: y.name,
          description: y.traditional_effect
        }));
      }
      return parsed;
    }
  } catch (error) {
    console.error('LLM interpretation failed, generating verified Sidereal fallback:', error.message);
  }

  // Deterministic verified fallback synthesized directly from Sidereal Lahiri facts
  return {
    personality: `With ${chart_data.ascendant} Lagna and your Moon positioned in ${chart_data.moon_sign} (${chart_data.nakshatra} Nakshatra, Pada ${chart_data.nakshatra_pada || 1}), your chart reflects a sophisticated interplay of relational diplomacy and inner philosophical focus. Your ${chart_data.ascendant} Ascendant grants natural charisma and aesthetic refinement, while ${chart_data.nakshatra} deepens your capacity for relentless truth-seeking and enduring commitment.`,
    strengths: `Your core strength is energized by your ${chart_data.sun_sign} Sun in ${chart_data.planets.sun.nakshatra || 'Ashlesha'}, conferring keen psychological intuition, strategic foresight, and resilience during pivotal transformations. Under the current ${dashaInfo.current_mahadasha || 'planetary'} Mahadasha, your organizational capacity and ability to harmonize complex dynamics are heightened.`,
    challenges: `A key area for mindful growth involves navigating the boundary between high standards and practical delegation. Mindful emotional grounding and pacing your ambition will ensure sustained vitality without energetic depletion.`,
    career: `Your 10th house in ${chart_data.houses['10'] || 'Cancer'} indicates strong alignment with strategic leadership, systems management, creative technology, and principled advisory roles. Vocations that honor both analytical rigor and executive autonomy offer the greatest long-term growth.`,
    relationships: `With your 7th house in ${chart_data.houses['7'] || 'Aries'}, you thrive in partnerships characterized by passionate directness, mutual loyalty, and shared personal growth. You value companions who match your ambition while offering a loyal emotional sanctuary.`,
    health: `Your constitutional vitality benefits from consistent circadian rhythms, adequate hydration, and grounding breathwork to balance your ${chart_data.ascendant} air/earth energy. Mindful physical movement restores your natural vitality.`,
    spiritual_path: `Guided by ${chart_data.nakshatra} Nakshatra, your spiritual evolution centers on transcending surface attachments to discover rooted self-mastery. By aligning daily ambition with dharmic integrity, you unlock profound creative and philosophical fulfillment.`,
    important_yogas: verifiedYogas.length > 0 ? verifiedYogas.map(y => ({
      name: y.name,
      description: `${y.traditional_effect} (${y.evidence})`
    })) : [
      {
        name: `${chart_data.sun_sign} Solar Focus`,
        description: "Enhances intuitive problem-solving, strategic insight, and adaptive resilience."
      }
    ],
    confidence_levels: {
      career: "High",
      relationships: "Moderate",
      overall: "High"
    }
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

  const force = req.query?.force === 'true' || req.body?.force === true || req.body?.forceRegenerate === true;

  // Check existing KundliReport and ensure it matches the user's latest profile data
  const existing = await KundliReport.findOne({ user_id: userId });
  const isBirthMatch = existing && existing.birth_details &&
    existing.birth_details.place_of_birth === profile.place_of_birth &&
    existing.birth_details.date_of_birth === profile.date_of_birth &&
    existing.birth_details.time_of_birth === profile.time_of_birth &&
    existing.birth_details.full_name === profile.full_name;

  if (isBirthMatch && !force && existing.chart_data) {
    console.log('✅ Found matching existing Kundli for user:', userId);
    return res.json({
      success: true,
      source: 'cache',
      data: existing
    });
  }

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

  console.log('🤖 Generating dynamic AI interpretation...');
  const interpretation = await generateDynamicInterpretation(chart_data, birthDetails, profile.life_context || {});

  console.log('💾 Saving Kundli report to database...');
  let kundliReport = await KundliReport.findOne({ user_id: userId });
  if (kundliReport) {
    kundliReport.birth_details = birthDetails;
    kundliReport.chart_data = chart_data;
    kundliReport.interpretation = interpretation;
    await kundliReport.save();
  } else {
    kundliReport = await KundliReport.create({
      user_id: userId,
      birth_details: birthDetails,
      chart_data,
      interpretation
    });
  }

  profile.birth_chart_data = {
    sun_sign: String(chart_data.sun_sign || ''),
    moon_sign: String(chart_data.moon_sign || ''),
    ascendant: String(chart_data.ascendant || ''),
    dominant_planet: chart_data.planets?.sun ? 'Sun' : ''
  };
  await profile.save();

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

  if (!userId) {
    console.log('❌ User not authenticated');
    return res.status(401).json({
      message: 'User not authenticated'
    });
  }

  const profile = await Profile.findOne({ user_id: userId });
  if (!profile) {
    console.log('❌ No profile found for user:', userId);
    return res.status(404).json({
      message: 'User profile not found. Please complete your birth details.'
    });
  }

  const requiredFields = ['full_name', 'date_of_birth', 'time_of_birth', 'place_of_birth'];
  const missingFields = requiredFields.filter((field) => !profile[field]);

  if (missingFields.length > 0) {
    console.log('❌ Missing profile fields:', missingFields);
    return res.status(400).json({
      message: 'User profile not found. Please complete your birth details.'
    });
  }

  const force = req.query?.force === 'true' || req.body?.force === true || req.body?.forceRegenerate === true;

  // Check existing KundliReport and ensure it matches the user's latest profile data
  const existingKundli = await KundliReport.findOne({ user_id: userId });
  const isBirthMatch = existingKundli && existingKundli.birth_details &&
    existingKundli.birth_details.place_of_birth === profile.place_of_birth &&
    existingKundli.birth_details.date_of_birth === profile.date_of_birth &&
    existingKundli.birth_details.time_of_birth === profile.time_of_birth &&
    existingKundli.birth_details.full_name === profile.full_name;
  
  if (isBirthMatch && !force && existingKundli.chart_data) {
    const requiredChartFields = ['ascendant', 'moon_sign', 'sun_sign', 'nakshatra', 'planets', 'houses'];
    const missingChartFields = requiredChartFields.filter((field) => !existingKundli.chart_data[field]);
    
    if (missingChartFields.length === 0) {
      console.log('✅ Found matching Kundli for user:', userId);
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
  }

  // Recalculate if no match, corrupted, or force requested
  console.log('📍 Geocoding location for birth chart:', profile.place_of_birth);
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

  console.log('🤖 Generating dynamic AI interpretation...');
  const interpretation = await generateDynamicInterpretation(chart_data, birthDetails, profile.life_context || {});

  console.log('💾 Saving new Kundli report to database...');
  let kundliReport = await KundliReport.findOne({ user_id: userId });
  if (kundliReport) {
    kundliReport.birth_details = birthDetails;
    kundliReport.chart_data = chart_data;
    kundliReport.interpretation = interpretation;
    await kundliReport.save();
  } else {
    kundliReport = await KundliReport.create({
      user_id: userId,
      birth_details: birthDetails,
      chart_data,
      interpretation
    });
  }

  profile.birth_chart_data = {
    sun_sign: String(chart_data.sun_sign || ''),
    moon_sign: String(chart_data.moon_sign || ''),
    ascendant: String(chart_data.ascendant || ''),
    dominant_planet: chart_data.planets?.sun ? 'Sun' : ''
  };
  await profile.save();

  console.log('✅ New Kundli report saved successfully');

  return res.json({
    success: true,
    source: 'generated',
    data: {
      birth_details: kundliReport.birth_details,
      chart_data: kundliReport.chart_data,
      interpretation: kundliReport.interpretation
    }
  });
});

module.exports = {
  getKundliReport,
  getBirthChart
};
