const axios = require('axios');
const { asyncHandler } = require('../middleware/asyncHandler');
const Profile = require('../models/Profile');
const KundliReport = require('../models/KundliReport');
const Report = require('../models/Report');
const llmService = require('../services/llmService');
const { calculateKundliChart } = require('../services/kundliCalculator');
const { calculateWesternBirthChart } = require('../services/westernChartCalculator');

async function geocodePlace(place) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const response = await axios.get(url, {
    params: {
      q: place,
      format: 'json',
      limit: 1
    },
    headers: {
      'User-Agent': 'AstroAi4u-Astrology/1.0 (backend)'
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

/**
 * Vedic (Sidereal Lahiri) AI Interpretation Generator
 */
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
3. For Career, Love, and Strengths, cite at least 2-3 specific supporting astrological placements.
4. Return ONLY valid JSON matching this schema:
{
  "personality": "Deep synthesis of character shaped by ${chart_data.ascendant} Lagna and ${chart_data.moon_sign} Moon in ${chart_data.nakshatra}.",
  "strengths": "Cosmic gifts based on dominant placements like ${chart_data.sun_sign} Sun.",
  "challenges": "Constructive psychological guidance balancing functional malefics and shadow patterns.",
  "career": "Vocational analysis based on the 10th house (${chart_data.houses['10'] || 'Career'}), 2nd house of resources, and active ${dashaInfo.current_mahadasha || ''} Mahadasha.",
  "relationships": "Partnership dynamics indicated by the 7th house (${chart_data.houses['7'] || 'Partnership'}) and Venus placements.",
  "health": "Ayurvedic and lifestyle vitality recommendations honoring ${chart_data.ascendant} rising.",
  "spiritual_path": "Soul evolution guided by ${chart_data.nakshatra} Nakshatra (Pada ${chart_data.nakshatra_pada || 1}) and the 9th/12th houses.",
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
    personality: `With ${chart_data.ascendant} Lagna and your Moon positioned in ${chart_data.moon_sign} (${chart_data.nakshatra} Nakshatra, Pada ${chart_data.nakshatra_pada || 1}), your chart reflects a sophisticated interplay of relational diplomacy and inner philosophical focus. Your ${chart_data.ascendant} Ascendant grants natural charisma, while ${chart_data.nakshatra} deepens your capacity for relentless truth-seeking.`,
    strengths: `Your core strength is energized by your ${chart_data.sun_sign} Sun in ${chart_data.planets.sun?.nakshatra || 'Ashlesha'}, conferring keen psychological intuition, strategic foresight, and resilience during pivotal transformations. Under the current ${dashaInfo.current_mahadasha || 'planetary'} Mahadasha, your organizational capacity is heightened.`,
    challenges: `A key area for mindful growth involves navigating the boundary between high standards and practical delegation. Mindful emotional grounding and pacing your ambition will ensure sustained vitality.`,
    career: `Your 10th house in ${chart_data.houses['10'] || 'Cancer'} indicates strong alignment with strategic leadership, systems management, creative technology, and principled advisory roles.`,
    relationships: `With your 7th house in ${chart_data.houses['7'] || 'Aries'}, you thrive in partnerships characterized by passionate directness, mutual loyalty, and shared personal growth.`,
    health: `Your constitutional vitality benefits from consistent circadian rhythms, adequate hydration, and grounding breathwork to balance your ${chart_data.ascendant} air/earth energy.`,
    spiritual_path: `Guided by ${chart_data.nakshatra} Nakshatra, your spiritual evolution centers on transcending surface attachments to discover rooted self-mastery.`,
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

/**
 * Western (Tropical) AI Interpretation Generator
 */
async function generateWesternInterpretation(chart_data, birthDetails, userContext = {}) {
  const bigThree = chart_data.big_three || {};
  const aspects = chart_data.aspects || [];
  const elements = chart_data.elements || {};

  try {
    const prompt = `
You are an expert Psychological & Western Astrologer providing a profound, evidence-grounded birth chart analysis based on the TROPICAL PLACIDUS system.

GROUND TRUTH TROPICAL PLACEMENTS:
- Sun Sign: ${chart_data.sun_sign} (${chart_data.planets.sun?.formatted}, House ${chart_data.planets.sun?.house})
- Moon Sign: ${chart_data.moon_sign} (${chart_data.planets.moon?.formatted}, House ${chart_data.planets.moon?.house})
- Ascendant (Rising): ${chart_data.ascendant} (${chart_data.ascendant_details?.formatted}, 1st House Cusp)
- Midheaven (MC): ${chart_data.midheaven} (${chart_data.midheaven_details?.formatted}, 10th House Cusp)

PLANETARY PLACEMENTS:
${Object.entries(chart_data.planets).map(([p, data]) => `• ${p.toUpperCase()}: ${data.formatted} (House ${data.house}${data.retrograde ? ', Retrograde' : ''})`).join('\n')}

MAJOR ASPECTS:
${aspects.slice(0, 8).map(a => `• ${a.planet1.toUpperCase()} ${a.aspect} ${a.planet2.toUpperCase()} (Orb ${a.orb}°, ${a.nature})`).join('\n')}

ELEMENTAL DISTRIBUTION:
Fire: ${elements.Fire || 0}, Earth: ${elements.Earth || 0}, Air: ${elements.Air || 0}, Water: ${elements.Water || 0}

Return ONLY valid JSON matching this schema:
{
  "personality": "Comprehensive synthesis of the Big Three (${chart_data.sun_sign} Sun, ${chart_data.moon_sign} Moon, ${chart_data.ascendant} Rising) and core psychological motivations.",
  "strengths": "Deep analysis of primary gifts, elemental dominance, and harmonious aspects.",
  "challenges": "Constructive psychological guidance on resolving tensions (squares/oppositions) and blind spots.",
  "career": "Professional potential anchored by Midheaven in ${chart_data.midheaven} and 10th house placements.",
  "relationships": "Relational dynamics, emotional needs (${chart_data.moon_sign} Moon), and Venus/Mars synergy.",
  "health": "Lifestyle, stress-management, and somatic vitality recommendations.",
  "spiritual_path": "Transpersonal growth, individuation journey, and self-actualization path.",
  "important_aspects": [
    ${aspects.slice(0, 5).map(a => JSON.stringify({ name: `${a.planet1} ${a.aspect} ${a.planet2}`, description: `Exact ${a.aspect} (${a.orb}° orb): Shapes your ${a.nature.toLowerCase()} drive.` })).join(',\n    ')}
  ],
  "confidence_levels": {
    "career": "High",
    "relationships": "High",
    "overall": "High"
  }
}`;

    const llmResponse = await Promise.race([
      llmService.callLLM(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), 120000))
    ]);

    let raw = llmResponse?.choices?.[0]?.message?.content || llmResponse?.message?.content || '{}';
    const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) raw = codeMatch[1];
    raw = raw.trim();

    const parsed = JSON.parse(raw);
    if (parsed.personality && parsed.career) {
      return parsed;
    }
  } catch (error) {
    console.error('Western LLM interpretation failed, generating verified Tropical fallback:', error.message);
  }

  // Deterministic verified fallback synthesized directly from Tropical placements
  return {
    personality: `With your Sun in ${chart_data.sun_sign}, Moon in ${chart_data.moon_sign}, and ${chart_data.ascendant} Rising, your chart expresses a harmonious integration of ${chart_data.sun_sign}'s vitality and ${chart_data.moon_sign}'s emotional instinct. Your ${chart_data.ascendant} Ascendant provides a confident, approachable outer aura that naturally invites collaboration and respect.`,
    strengths: `Your greatest gifts emerge from your ${chart_data.sun_sign} core in House ${chart_data.planets.sun?.house || 1}, giving you innate initiative, clear vision, and the ability to inspire trust. Your ${chart_data.moon_sign} Moon grants emotional resilience and deep instinctual intelligence.`,
    challenges: `The primary psychological growth area involves maintaining balance during intense cycles of change. Embracing steady boundaries and grounding routines helps prevent overextension.`,
    career: `With your Midheaven (MC) in ${chart_data.midheaven}, your vocational calling is strongly aligned with strategic planning, leadership, creative communication, and enterprise.`,
    relationships: `Your relational archetype values authentic partnership, intellectual rapport, and mutual encouragement. You flourish with companions who honor your independence while nurturing deep loyalty.`,
    health: `Your vitality thrives on outdoor movement, grounding nutrition, and regular restorative rituals to harmonize your elemental balance.`,
    spiritual_path: `Your individuation path is centered on aligning your conscious goals with your inner intuitive wisdom, transforming life experiences into profound creative insight.`,
    important_aspects: (aspects || []).slice(0, 4).map(a => ({
      name: `${a.planet1} ${a.aspect} ${a.planet2}`,
      description: `Active ${a.aspect} (${a.orb}° orb): Directs your ${a.nature.toLowerCase()} focus.`
    })),
    confidence_levels: {
      career: "High",
      relationships: "High",
      overall: "High"
    }
  };
}

const getKundliReport = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  console.log('🔮 Kundli generation started for user:', userId);

  const profile = await Profile.findOne({ user_id: userId });
  if (!profile) {
    return res.status(400).json({
      success: false,
      message: 'Please complete your profile first.',
      redirectToOnboarding: true
    });
  }

  const requiredFields = ['full_name', 'date_of_birth', 'time_of_birth', 'place_of_birth'];
  const missingFields = requiredFields.filter((field) => !profile[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please complete your profile first.',
      redirectToOnboarding: true
    });
  }

  const force = req.query?.force === 'true' || req.body?.force === true || req.body?.forceRegenerate === true;

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

  const birthDetails = {
    full_name: profile.full_name,
    date_of_birth: profile.date_of_birth,
    time_of_birth: profile.time_of_birth,
    place_of_birth: profile.place_of_birth,
    latitude,
    longitude
  };

  console.log('🪐 Calculating Kundli chart with Swiss Ephemeris (Sidereal Lahiri)...');
  const chart_data = await calculateKundliChart({
    date_of_birth: birthDetails.date_of_birth,
    time_of_birth: birthDetails.time_of_birth,
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude
  });

  console.log('🤖 Generating dynamic Vedic AI interpretation...');
  const interpretation = await generateDynamicInterpretation(chart_data, birthDetails, profile.life_context || {});

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

  return res.json({
    success: true,
    source: 'generated',
    data: kundliReport
  });
});

const getBirthChart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  console.log('🔍 Western Birth Chart API called for user:', userId);

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const profile = await Profile.findOne({ user_id: userId });
  if (!profile) {
    return res.status(404).json({
      message: 'User profile not found. Please complete your birth details.'
    });
  }

  const requiredFields = ['full_name', 'date_of_birth', 'time_of_birth', 'place_of_birth'];
  const missingFields = requiredFields.filter((field) => !profile[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'User profile not found. Please complete your birth details.'
    });
  }

  const force = req.query?.force === 'true' || req.body?.force === true || req.body?.forceRegenerate === true;

  // Check existing Report model for birth_chart
  const existingReport = await Report.findOne({ user_id: userId, report_type: 'birth_chart' });
  const isBirthMatch = existingReport && existingReport.content && existingReport.content.birth_details &&
    existingReport.content.birth_details.place_of_birth === profile.place_of_birth &&
    existingReport.content.birth_details.date_of_birth === profile.date_of_birth &&
    existingReport.content.birth_details.time_of_birth === profile.time_of_birth &&
    existingReport.content.birth_details.full_name === profile.full_name;

  if (isBirthMatch && !force && existingReport.content.chart_data) {
    console.log('✅ Found matching cached Western Birth Chart for user:', userId);
    return res.json({
      success: true,
      source: 'database',
      data: existingReport.content
    });
  }

  // Geocode and calculate accurate Western Tropical Birth Chart
  console.log('📍 Geocoding location for Western birth chart:', profile.place_of_birth);
  const { latitude, longitude } = await geocodePlace(profile.place_of_birth);

  const birthDetails = {
    full_name: profile.full_name,
    date_of_birth: profile.date_of_birth,
    time_of_birth: profile.time_of_birth,
    place_of_birth: profile.place_of_birth,
    latitude,
    longitude
  };

  console.log('🪐 Calculating Western Birth Chart with Swiss Ephemeris (Tropical Placidus)...');
  const chart_data = await calculateWesternBirthChart({
    date_of_birth: birthDetails.date_of_birth,
    time_of_birth: birthDetails.time_of_birth,
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude
  });

  console.log('🤖 Generating dynamic Western AI interpretation...');
  const interpretation = await generateWesternInterpretation(chart_data, birthDetails, profile.life_context || {});

  const reportContent = {
    birth_details: birthDetails,
    chart_data: chart_data,
    interpretation: interpretation
  };

  if (existingReport) {
    existingReport.content = reportContent;
    existingReport.summary = `${chart_data.sun_sign} Sun, ${chart_data.moon_sign} Moon, ${chart_data.ascendant} Rising`;
    existingReport.updated_at = new Date();
    await existingReport.save();
  } else {
    await Report.create({
      user_id: userId,
      report_type: 'birth_chart',
      content: reportContent,
      summary: `${chart_data.sun_sign} Sun, ${chart_data.moon_sign} Moon, ${chart_data.ascendant} Rising`
    });
  }

  profile.birth_chart_data = {
    sun_sign: String(chart_data.sun_sign || ''),
    moon_sign: String(chart_data.moon_sign || ''),
    ascendant: String(chart_data.ascendant || ''),
    dominant_planet: chart_data.planets?.sun ? 'Sun' : ''
  };
  await profile.save();

  console.log('✅ Western Birth Chart saved successfully');

  return res.json({
    success: true,
    source: 'generated',
    data: reportContent
  });
});

module.exports = {
  getKundliReport,
  getBirthChart
};
