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

async function generateDynamicInterpretation(chart_data, birthDetails) {
  try {
    const prompt = `
You are an expert Vedic and Western Master Astrologer providing a deeply insightful, personalized birth chart synthesis.

STRICT INSTRUCTIONS:
- Ground your analysis in the user's EXACT planetary positions, ascendant, nakshatra, and house placements provided below.
- Write with eloquence, depth, nuance, and warmth (like a high-end personal astrological advisor).
- Synthesize the planetary energies into actionable life wisdom, not cold data points.
- Identify real astrological combinations (Yogas like Budhaditya, Gajakesari, Raja Yoga, Dhana Yoga, Vipareeta Raja Yoga, etc.) where applicable.
- For each section, provide 2-3 articulate, deeply personal paragraphs with concrete insights.

BIRTH CHART DATA:
Name: ${birthDetails.full_name || 'Seeker'}
Ascendant (Lagna): ${chart_data.ascendant}
Moon Sign (Chandra Rashi): ${chart_data.moon_sign}
Sun Sign (Surya Rashi): ${chart_data.sun_sign}
Nakshatra: ${chart_data.nakshatra}

PLANETARY POSITIONS (Exact Degrees & Signs):
${Object.entries(chart_data.planets).map(([planet, data]) => 
  `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.sign} at ${data.degree}°`
).join('\n')}

HOUSE PLACEMENTS (12 Bhavas):
${Object.entries(chart_data.houses).map(([house, sign]) => 
  `• House ${house}: ${sign}`
).join('\n')}

Please return ONLY valid JSON matching this exact schema:
{
  "personality": "Comprehensive synthesis of how the Ascendant (${chart_data.ascendant}) and Moon (${chart_data.moon_sign}) shape their aura, demeanor, emotional processing, and natural psychological archetype.",
  "strengths": "Detailed breakdown of their 3-4 greatest cosmic gifts, natural leadership/creative talents, and intellectual power points based on dominant planetary placements.",
  "challenges": "Honest, constructive look at shadow patterns, emotional blind spots, or karmic hurdles to overcome for self-mastery.",
  "career": "Deep vocational guidance analyzing the 10th house, 2nd house (wealth), and dominant planets — ideal industries, leadership style, and timing for professional breakthroughs.",
  "relationships": "Relational dynamics, attachment needs, love language, and ideal partner qualities indicated by the 7th house and Venus/Mars placements.",
  "health": "Vitality, nervous system tendencies, lifestyle recommendations, and grounding practices based on the 6th house and elemental balance.",
  "spiritual_path": "Soul purpose, dharmic destiny, and higher spiritual evolution indicated by Nakshatra (${chart_data.nakshatra}) and 9th/12th houses.",
  "important_yogas": [
    {
      "name": "Yoga / Planetary Alignment Name",
      "description": "Specific effect and blessings of this alignment in their life"
    }
  ]
}`;

    const llmResponse = await Promise.race([
      llmService.callLLM(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLM timeout after 2 minutes')), 120000)
      )
    ]);
    
    let raw = llmResponse?.choices?.[0]?.message?.content || '{}';
    const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) raw = codeMatch[1];
    raw = raw.trim();

    const parsed = JSON.parse(raw);
    if (parsed.personality && parsed.career) {
      return parsed;
    }
  } catch (error) {
    console.error('LLM interpretation failed, generating structured fallback:', error.message);
  }

  // Dynamic fallback synthesized from chart values
  return {
    personality: `With ${chart_data.ascendant} rising and your Moon in ${chart_data.moon_sign}, you possess a captivating blend of outward poise and inner emotional intensity. Your ${chart_data.ascendant} Ascendant provides a natural magnetic aura and clear purpose, while your ${chart_data.moon_sign} Moon grants deep intuitive discernment in your personal reflections.`,
    strengths: `Your core strength radiates from your ${chart_data.sun_sign} Sun, giving you unwavering resilience and creative vitality. Guided by your ${chart_data.nakshatra} Nakshatra, you have an innate capacity to perceive underlying motives, navigate complex challenges, and inspire confidence in those around you.`,
    challenges: `A key area of mindful growth is navigating the tension between your high personal expectations and external rhythms. Cultivating patience during transitional periods and setting conscious energetic boundaries will protect your vital reserves.`,
    career: `Your chart indicates strong potential in vocational pathways requiring strategic foresight, intellectual autonomy, and creative problem-solving. Placements connected to your 10th house favor roles where you lead with vision, innovate solutions, and mentor others.`,
    relationships: `In partnerships, you value intellectual resonance, emotional loyalty, and shared philosophical growth. You thrive with partners who honor your individuality while cultivating a safe sanctuary for mutual vulnerability and deep companionship.`,
    health: `Your constitutional vitality benefits from rhythmic grounding practices, mindful stress regulation, and consistent physical movement. Nourishing your nervous system through calming evening rituals and staying connected to nature restores your elemental balance.`,
    spiritual_path: `Your spiritual evolution is tied to mastering the wisdom of ${chart_data.nakshatra}. By aligning your daily actions with higher integrity and listening to your intuitive whispers, you unlock profound self-realization and purpose.`,
    important_yogas: [
      {
        name: `${chart_data.sun_sign}-${chart_data.moon_sign} Luminary Harmony`,
        description: "Fosters balanced alignment between conscious life goals and emotional well-being."
      },
      {
        name: `${chart_data.nakshatra} Dharmic Focus`,
        description: "Grants resilience, intuitive insight, and ability to manifest purpose through steady dedication."
      }
    ]
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

  console.log('🤖 Generating AI interpretation...');
  const interpretation = await generateDynamicInterpretation(chart_data, birthDetails);

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
  const interpretation = await generateDynamicInterpretation(chart_data, birthDetails);

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
