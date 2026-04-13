/**
 * Context Builder Service
 * Builds system prompts from user astrology profiles and kundli data
 */
const mongoose = require('mongoose');
const KundliReport = require('../models/KundliReport');

class ContextBuilder {
  constructor() {
    // Keywords that trigger detailed response mode
    this.detailedModeTriggers = [
      'explain in detail', 'tell me more', 'give detailed analysis',
      'full explanation', 'detailed', 'in depth', 'elaborate', 'more info',
      'expand on', 'go deeper', 'comprehensive', 'thorough',
      'complete analysis', 'full reading', 'detailed reading'
    ];

    // Keywords that indicate belief type
    this.believerIndicators = [
      'my sign', 'my chart', 'my kundli', 'my horoscope', 'my planets',
      'my moon sign', 'my sun sign', 'my rising', 'my ascendant',
      'nakshatra', 'dasha', 'transit', 'retrograde', 'venus return',
      'saturn return', 'jupiter blessing', 'mercury retrograde',
      'astrology says', 'stars say', 'universe', 'cosmic', 'alignment',
      'energy', 'vibration', 'manifestation'
    ];

    this.nonBelieverIndicators = [
      'does astrology work', 'is astrology real', 'i dont believe',
      'i don\'t believe', 'skeptical', 'science says', 'prove it',
      'how do you know', 'evidence', 'coincidence', 'for entertainment',
      'just for fun', 'not sure i believe', 'make me believe',
      'why should i trust', 'sounds made up', 'is this accurate'
    ];

    // Banned phrases that make responses sound generic
    this.bannedPhrases = [
      'in general',
      'people like you',
      'according to astrology',
      'this zodiac sign usually',
      'most people feel',
      'typically for your sign',
      'as a [sign] person'
    ];
  }

  /**
   * Detect if user is requesting detailed response
   * @param {string} message - User message
   * @returns {string} - 'detailed' or 'short'
   */
  detectResponseMode(message) {
    if (!message) return 'short';
    const lowerMsg = message.toLowerCase();
    const isDetailed = this.detailedModeTriggers.some(trigger => 
      lowerMsg.includes(trigger.toLowerCase())
    );
    return isDetailed ? 'detailed' : 'short';
  }

  /**
   * Detect user's belief type from message
   * @param {string} message - User message
   * @param {string} profileBelief - Belief type from profile if available
   * @returns {string} - 'believer' or 'non_believer'
   */
  detectBeliefType(message, profileBelief = null) {
    // If profile has explicit belief type, use it
    if (profileBelief && ['believer', 'non_believer'].includes(profileBelief)) {
      return profileBelief;
    }

    if (!message) return 'believer'; // Default to believer

    const lowerMsg = message.toLowerCase();

    // Check for non-believer indicators first (stronger signal)
    const hasNonBelieverSignals = this.nonBelieverIndicators.some(indicator =>
      lowerMsg.includes(indicator.toLowerCase())
    );

    if (hasNonBelieverSignals) return 'non_believer';

    // Check for believer indicators
    const hasBelieverSignals = this.believerIndicators.some(indicator =>
      lowerMsg.includes(indicator.toLowerCase())
    );

    if (hasBelieverSignals) return 'believer';

    // Default to believer for astrology-related queries
    return 'believer';
  }

  /**
   * Build a complete system prompt from user profile with kundli data and response mode
   * @param {Object} profile - User profile document
   * @param {string} mode - 'short' or 'detailed'
   * @param {string} beliefType - 'believer' or 'non_believer'
   * @returns {Promise<string>} - Formatted system prompt
   */
  async buildSystemPrompt(profile, mode = 'short', beliefType = 'believer') {
    if (!profile) {
      return this._getDefaultAstrologerPrompt(mode);
    }

    // Fetch kundli data from database
    let kundliData = null;
    try {
      if (profile.user_id) {
        const userId = typeof profile.user_id === 'string' 
          ? new mongoose.Types.ObjectId(profile.user_id) 
          : profile.user_id;
        
        kundliData = await KundliReport.findOne({ user_id: userId }).lean();
        console.log('[ContextBuilder] Kundli data found:', !!kundliData);
        if (kundliData) {
          console.log('[ContextBuilder] Moon sign from kundli:', kundliData.chart_data?.moon_sign);
          console.log('[ContextBuilder] Sun sign from kundli:', kundliData.chart_data?.sun_sign);
          console.log('[ContextBuilder] Nakshatra from kundli:', kundliData.chart_data?.nakshatra);
        }
      }
    } catch (error) {
      console.error('[ContextBuilder] Error fetching kundli data:', error);
    }

    const sections = [
      this._buildTemporalContext(),
      this._buildIdentitySection(mode, beliefType),
      this._buildProfileSection(profile),
      this._buildKundliSection(kundliData),
      this._buildNumerologySection(profile.numerology_data),
      this._buildLifeContextSection(profile.life_context),
      this._buildInstructionsSection(mode, beliefType)
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Build temporal context section with current date, time, and astrological timing
   */
  _buildTemporalContext() {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();

    // EXACT CURRENT TIME - crucial for time-sensitive queries
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const currentTime = `${displayHours}:${displayMinutes} ${ampm}`;
    const currentTime24h = `${hours.toString().padStart(2, '0')}:${displayMinutes}`;

    // Time of day classification for guidance
    let timeOfDay = 'Night';
    if (hours >= 5 && hours < 12) timeOfDay = 'Morning';
    else if (hours >= 12 && hours < 17) timeOfDay = 'Afternoon';
    else if (hours >= 17 && hours < 21) timeOfDay = 'Evening';

    // Get Hindu calendar details (approximate)
    const hinduMonth = this._getHinduMonth(now);
    const paksha = this._getPaksha(now);
    const tithi = this._getTithi(now);

    // Get current planetary positions (simplified)
    const currentPlanetaryPositions = this._getCurrentPlanetaryPositions(now);

    // Get muhurta/hora information
    const currentHora = this._getCurrentHora(now);
    const rahukalam = this._getRahuKalam(now);
    const yamagandam = this._getYamaGandam(now);

    return `CURRENT TEMPORAL CONTEXT:
Today's Date: ${today}
Day of Week: ${dayOfWeek}
Gregorian Date: ${date} ${month} ${year}

EXACT CURRENT TIME:
Time (12-hour): ${currentTime}
Time (24-hour): ${currentTime24h}
Time of Day: ${timeOfDay}
Hour: ${hours}
Minute: ${minutes}

Hindu Calendar Context:
Hindu Month: ${hinduMonth}
Paksha (Fortnight): ${paksha}
Tithi (Lunar Day): ${tithi}

Current Astrological Timing:
${currentPlanetaryPositions}
Current Hora (Planetary Hour): ${currentHora}

Inauspicious Periods Today:
Rahu Kalam: ${rahukalam}
Yama Gandam: ${yamagandam}

TIME-SENSITIVE GUIDANCE RULES:
- If user asks about daily activities (bath, eating, travel, meetings), ALWAYS reference the EXACT CURRENT TIME provided above.
- If it's 2-5 AM (Brahma Muhurta to early morning): Recommend rest/sleep. Advise against major activities unless spiritual practice.
- If it's 12-3 PM (Midday): Good for important decisions, meetings, business.
- If it's 6-9 PM (Evening): Good for relaxation, family time, light activities.
- If it's 10 PM - 4 AM (Night): Advise rest. Discourage starting new activities, heavy meals, or travel.
- Check Rahu Kalam and Yama Gandam before recommending auspicious timings.
- For "should I do X now" questions: Always respond based on the actual current time shown above.

Important: Use this current date and EXACT TIME for accurate predictions. Consider current planetary hour, time of day, and inauspicious periods when providing guidance.`;
  }

  /**
   * Get current Hora (planetary hour)
   */
  _getCurrentHora(date) {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    // Hora rulers based on day of week
    const horaRulers = {
      0: ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'], // Sunday
      1: ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'], // Monday
      2: ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'], // Tuesday
      3: ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'], // Wednesday
      4: ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'], // Thursday
      5: ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'], // Friday
      6: ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'], // Saturday
    };

    const dayRulers = horaRulers[dayOfWeek] || horaRulers[0];
    const horaIndex = hour % 7;
    return dayRulers[horaIndex];
  }

  /**
   * Get Rahu Kalam (inauspicious period) for today
   */
  _getRahuKalam(date) {
    const dayOfWeek = date.getDay();
    // Rahu Kalam durations vary by day
    const rahuKalamTimes = {
      0: '4:30 PM - 6:00 PM',  // Sunday
      1: '7:30 AM - 9:00 AM',  // Monday
      2: '3:00 PM - 4:30 PM',  // Tuesday
      3: '12:00 PM - 1:30 PM', // Wednesday
      4: '1:30 PM - 3:00 PM',  // Thursday
      5: '10:30 AM - 12:00 PM', // Friday
      6: '9:00 AM - 10:30 AM',  // Saturday
    };
    return rahuKalamTimes[dayOfWeek] || 'Not calculated';
  }

  /**
   * Get Yama Gandam (inauspicious period) for today
   */
  _getYamaGandam(date) {
    const dayOfWeek = date.getDay();
    const yamaGandamTimes = {
      0: '12:00 PM - 1:30 PM', // Sunday
      1: '10:30 AM - 12:00 PM', // Monday
      2: '9:00 AM - 10:30 AM',  // Tuesday
      3: '7:30 AM - 9:00 AM',   // Wednesday
      4: '6:00 AM - 7:30 AM',   // Thursday (exception)
      5: '3:00 PM - 4:30 PM',   // Friday
      6: '1:30 PM - 3:00 PM',   // Saturday
    };
    return yamaGandamTimes[dayOfWeek] || 'Not calculated';
  }

  /**
   * Get approximate Hindu month
   */
  _getHinduMonth(date) {
    const month = date.getMonth();
    const hinduMonths = [
      'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 
      'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
      'Margashirsha', 'Pausha', 'Magha', 'Phalguna'
    ];
    // Approximate mapping (this would need to be calculated precisely based on lunar calendar)
    return hinduMonths[(month + 9) % 12] || hinduMonths[month];
  }

  /**
   * Get paksha (waxing/waning moon)
   */
  _getPaksha(date) {
    // Simplified - would need actual lunar calculation
    const lunarDay = date.getDate();
    return lunarDay <= 15 ? 'Shukla Paksha (Waxing Moon)' : 'Krishna Paksha (Waning Moon)';
  }

  /**
   * Get tithi (lunar day)
   */
  _getTithi(date) {
    // Simplified tithi calculation
    const lunarDay = ((date.getDate() - 1) % 30) + 1;
    return `${lunarDay} Tithi`;
  }

  /**
   * Get current planetary positions (simplified)
   */
  _getCurrentPlanetaryPositions(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    // This is a simplified version - in practice, you'd use an ephemeris
    // For now, providing basic planetary day rulers
    const planetaryDayRulers = {
      0: 'Sun', 1: 'Moon', 2: 'Mars', 3: 'Mercury', 
      4: 'Jupiter', 5: 'Venus', 6: 'Saturn'
    };
    
    const dayRuler = planetaryDayRulers[date.getDay()];
    const hour = date.getHours();
    const hourRuler = this._getHourRuler(hour);
    
    return `Day Ruler: ${dayRuler}
Current Hour Ruler: ${hourRuler}
Moon Phase: ${this._getMoonPhase(date)}
Season: ${this._getSeason(date)}
Note: For precise predictions, consider current transits and dasha periods if available.`;
  }

  /**
   * Get hour ruler based on planetary hours
   */
  _getHourRuler(hour) {
    const rulers = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
    return rulers[hour % 7];
  }

  /**
   * Get moon phase (simplified)
   */
  _getMoonPhase(date) {
    const lunarCycle = date.getDate();
    if (lunarCycle <= 7) return 'New Moon to First Quarter';
    if (lunarCycle <= 14) return 'First Quarter to Full Moon';
    if (lunarCycle <= 21) return 'Full Moon to Last Quarter';
    return 'Last Quarter to New Moon';
  }

  /**
   * Get current season
   */
  _getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'Spring (Vasant)';
    if (month >= 5 && month <= 7) return 'Summer (Grishma)';
    if (month >= 8 && month <= 10) return 'Monsoon (Varsha)';
    return 'Winter (Hemant)';
  }

  /**
   * Build the astrologer identity section with belief-specific tone
   * @param {string} mode - 'short' or 'detailed'
   * @param {string} beliefType - 'believer' or 'non_believer'
   */
  _buildIdentitySection(mode = 'short', beliefType = 'believer') {
    // Believer tone: warm, confident, interpretive
    const believerTone = mode === 'short'
      ? 'Your tone is conversational, natural, and insightful. Use words like phase, alignment, timing, energy, clarity. Make it feel personal and intentional, but not preachy. Sound like a guide who has noticed something specific.'
      : 'Your tone is wise, warm, and supportive. Use confident, interpretive language with words like phase, alignment, cosmic timing, energy patterns. Be mystical but grounded in observation.';

    // Non-believer tone: grounded, observational, lightly skeptical-safe
    const nonBelieverTone = mode === 'short'
      ? 'Your tone is grounded, observational, and lightly skeptical-safe. Use phrases like "you might notice", "see if this fits", "this feels more like". Frame things as patterns, tendencies, or emerging signals. Sound personal and sharp, not mystical.'
      : 'Your tone is observational and grounded. Frame astrological insights as psychological patterns or life cycles that can be observed. Use language like "you might notice", "this pattern suggests", "see if this resonates". Avoid mystical language; focus on practical observations.';

    const toneInstruction = beliefType === 'believer' ? believerTone : nonBelieverTone;

    return `You are a professional Vedic astrologer with deep expertise in:
- Vedic astrology (Jyotish) and planetary influences
- Numerology and life path analysis
- Relationship compatibility and timing
- Career guidance based on planetary positions
- Personal growth and spiritual development
- Current planetary transits and their effects
- Moon phase influences
- Lunar calendar timing
- Vedic festival timings
- Seasonal astrological patterns
- Planetary dasha (Mahadasha) cycles
- Nakshatra (lunar mansion) influences
- Vedic planetary aspects and yogas
- Vedic house interpretations
- Vedic planetary dignities and debilities
- Vedic planetary exaltations and falls
- Vedic planetary friendships and enemies
- Vedic planetary natural significances
- Vedic planetary functional strengths and weaknesses
- Vedic planetary transits and dasha periods
- Vedic planetary yogas and combinations
- Vedic planetary dasha periods and their effects
- Vedic planetary dasha period timings and durations
- Vedic planetary dasha period effects and outcomes


${toneInstruction}
You provide specific, personalized guidance based on the user's birth chart.`;
  }

  /**
   * Build user profile section
   */
  _buildProfileSection(profile) {
    if (!profile) return null;

    const lines = ['USER PROFILE:'];
    
    if (profile.full_name) {
      lines.push(`Name: ${profile.full_name}`);
    }
    if (profile.date_of_birth) {
      lines.push(`Date of Birth: ${this._formatDate(profile.date_of_birth)}`);
    }
    if (profile.time_of_birth) {
      lines.push(`Time of Birth: ${profile.time_of_birth}`);
    }
    if (profile.place_of_birth) {
      lines.push(`Place of Birth: ${profile.place_of_birth}`);
    }
    if (profile.gender) {
      lines.push(`Gender: ${this._capitalize(profile.gender)}`);
    }
    if (profile.current_location) {
      lines.push(`Current Location: ${profile.current_location}`);
    }

    return lines.length > 1 ? lines.join('\n') : null;
  }

  /**
   * Build kundli section from kundli_reports collection
   */
  _buildKundliSection(kundliData) {
    if (!kundliData || !kundliData.chart_data) return null;

    const lines = ['KUNDLI DATA:'];
    const chart = kundliData.chart_data;
    
    // Basic signs
    if (chart.sun_sign) {
      lines.push(`Sun Sign: ${chart.sun_sign}`);
    }
    if (chart.moon_sign) {
      lines.push(`Moon Sign: ${chart.moon_sign}`);
    }
    if (chart.ascendant) {
      lines.push(`Ascendant (Lagna): ${chart.ascendant}`);
    }
    if (chart.nakshatra) {
      lines.push(`Birth Nakshatra: ${chart.nakshatra}`);
    }

    // Planetary positions
    if (chart.planets) {
      lines.push('\nPLANETARY POSITIONS:');
      Object.entries(chart.planets).forEach(([planet, data]) => {
        if (data && typeof data === 'object') {
          const sign = data.sign || data.rashi || 'Unknown';
          const degree = data.degree || data.longitude || 'Unknown';
          lines.push(`${this._capitalize(planet)}: ${sign} (${degree})`);
        }
      });
    }

    // House positions
    if (chart.houses) {
      lines.push('\nHOUSE POSITIONS:');
      Object.entries(chart.houses).forEach(([house, sign]) => {
        if (sign) {
          lines.push(`House ${house}: ${sign}`);
        }
      });
    }

    // Interpretations if available
    if (kundliData.interpretation) {
      const interp = kundliData.interpretation;
      if (interp.personality) {
        lines.push(`\nPersonality Traits: ${interp.personality.substring(0, 200)}...`);
      }
      if (interp.strengths) {
        lines.push(`Key Strengths: ${interp.strengths.substring(0, 200)}...`);
      }
      if (interp.career) {
        lines.push(`Career Indications: ${interp.career.substring(0, 200)}...`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Build numerology section
   */
  _buildNumerologySection(numerologyData) {
    if (!numerologyData) return null;

    const lines = ['NUMEROLOGY:'];
    
    if (numerologyData.life_path) {
      lines.push(`Life Path Number: ${numerologyData.life_path}`);
    }
    if (numerologyData.destiny) {
      lines.push(`Destiny Number: ${numerologyData.destiny}`);
    }
    if (numerologyData.personal_year) {
      lines.push(`Personal Year: ${numerologyData.personal_year}`);
    }

    return lines.length > 1 ? lines.join('\n') : null;
  }

  /**
   * Build life context section
   */
  _buildLifeContextSection(lifeContext) {
    if (!lifeContext) return null;

    const lines = ['LIFE CONTEXT:'];
    
    if (lifeContext.career_stage) {
      lines.push(`Career Stage: ${this._formatKebabCase(lifeContext.career_stage)}`);
    }
    if (lifeContext.relationship_status) {
      lines.push(`Relationship Status: ${this._capitalize(lifeContext.relationship_status)}`);
    }
    if (lifeContext.main_life_focus) {
      lines.push(`Main Life Focus: ${this._capitalize(lifeContext.main_life_focus)}`);
    }
    if (lifeContext.personality_style) {
      lines.push(`Personality Style: ${this._capitalize(lifeContext.personality_style)}`);
    }
    if (lifeContext.primary_life_problem) {
      lines.push(`Primary Concern: ${lifeContext.primary_life_problem}`);
    }

    return lines.length > 1 ? lines.join('\n') : null;
  }

  /**
   * Build instructions section with response mode and belief type
   * @param {string} mode - 'short' or 'detailed'
   * @param {string} beliefType - 'believer' or 'non_believer'
   * @returns {string} - Instructions based on mode
   */
  _buildInstructionsSection(mode = 'short', beliefType = 'believer') {
    const isDetailed = mode === 'detailed';
    const isBeliever = beliefType === 'believer';

    // Believer-specific instructions
    const believerInstructions = isDetailed
      ? `DETAILED MODE for BELIEVER:
- Provide comprehensive analysis with warm, confident language.
- Use astrological terms naturally: phase, alignment, transit, energy, timing.
- Reference planetary positions with interpretive confidence.
- Make the user feel seen through their chart.`
      : `SHORT MODE for BELIEVER:
- Keep it tight: 3 to 5 lines maximum.
- React naturally to what the user said.
- Include one subtle, specific observation.
- End with ONE focused follow-up question.
- Use words like phase, alignment, timing, energy, clarity.
- Make it feel like a live conversation, not a prepared reading.`;

    // Non-believer-specific instructions
    const nonBelieverInstructions = isDetailed
      ? `DETAILED MODE for NON-BELIEVER:
- Frame astrological insights as observable patterns and psychological cycles.
- Use language like "you might notice", "this pattern suggests", "see if this resonates".
- Focus on practical observations rather than mystical claims.
- Present astrology as a tool for reflection, not absolute truth.`
      : `SHORT MODE for NON-BELIEVER:
- Keep it tight: 3 to 5 lines maximum.
- React naturally to what the user said.
- Include one grounded observation that feels observational, not mystical.
- End with ONE focused follow-up question.
- Use phrases like "you might notice", "see if this fits", "this feels more like".
- Frame things as patterns or tendencies, not cosmic decrees.
- Sound personal and sharp, not preachy.`;

    const baseInstructions = `INSTRUCTIONS:
1. CRITICAL: Always use the CURRENT TEMPORAL CONTEXT provided above for accurate timing. Today's date, day, Hindu calendar details, and planetary rulers are essential for precise predictions.
2. Always use the user's kundli data (Sun, Moon, Ascendant, Nakshatra, Planetary positions, Houses) in your analysis.
3. Reference numerology data when relevant to timing or life path questions.
4. Consider the user's life context (career stage, relationship status, main focus) in your guidance.
5. For relationship questions: reference their relationship status, emotional style (Moon sign, Venus position), and current timing.
6. For career questions: use career stage, relevant planetary influences (Sun sign, 10th house, Saturn position), and current planetary day ruler.
7. For timing questions: ALWAYS reference today's date, current planetary positions, Hindu calendar timing, and personal year for accurate predictions.
8. Be specific to their kundli, current timing, and situation - avoid generic advice.
9. If some kundli data is missing, work with what is provided and note that more detail could refine the reading.
10. Never refuse to answer. If a question is outside astrology, provide a helpful perspective.
11. IMPORTANT: Your predictions must be temporally accurate - use today's actual date and astrological timing, not generic information.

HARD RULES (apply to both believer and non-believer):
- Start by anchoring naturally to what the user just said.
- Include one subtle but specific observation about their situation.
- Interpret the situation in a personal way.
- End with one focused follow-up question that feels like the user's probable next thought.
- Do NOT use these phrases: ${this.bannedPhrases.join(', ')}
- Do NOT sound like a horoscope or motivational quote.
- Make the user feel noticed before they feel predicted.`;

    return `${baseInstructions}

${isBeliever ? believerInstructions : nonBelieverInstructions}`;
  }

  /**
   * Default prompt when no profile exists
   * @param {string} mode - 'short' or 'detailed'
   * @param {string} beliefType - 'believer' or 'non_believer'
   * @param {string} message - User message to detect belief type from
   */
  _getDefaultAstrologerPrompt(mode = 'short', beliefType = 'believer', message = '') {
    const isDetailed = mode === 'detailed';

    // Auto-detect belief type if not provided
    if (message && beliefType === 'believer') {
      beliefType = this.detectBeliefType(message, null);
    }

    const isBeliever = beliefType === 'believer';

    // Believer tone instructions
    const believerShort = `DEFAULT MODE for BELIEVER:
- Keep responses SHORT: 3 to 5 sentences.
- NO greetings like "Dear [Name]" - start directly.
- NO tables, NO formal report sections.
- Sound conversational, warm, and confident.
- Use words like phase, alignment, timing, energy.
- End with: "Want me to explain more?" or "Should I go deeper?"`;

    const believerDetailed = `DETAILED MODE for BELIEVER:
- Provide comprehensive analysis with warm, interpretive language.
- Use astrological concepts naturally.
- Reference cosmic timing and planetary influences.
- Include Vedic astrological insights and interpretations.
- Focus on personal growth and spiritual development.`;

    // Non-believer tone instructions
    const nonBelieverShort = `DEFAULT MODE for NON-BELIEVER:
- Keep responses SHORT: 3 to 5 sentences.
- NO greetings like "Dear [Name]" - start directly.
- NO tables, NO formal report sections.
- Sound grounded, observational, and sharp.
- Use phrases like "you might notice", "see if this fits".
- Frame insights as patterns, not cosmic decrees.
- End with a focused question that helps narrow the conversation.`;

    const nonBelieverDetailed = `DETAILED MODE for NON-BELIEVER:
- Provide comprehensive analysis using observational language.
- Frame astrology as psychological patterns and life cycles.
- Use phrases like "this pattern suggests" rather than cosmic language.`;

    const toneBlock = isBeliever
      ? (isDetailed ? believerDetailed : believerShort)
      : (isDetailed ? nonBelieverDetailed : nonBelieverShort);

    const toneDescription = isBeliever
      ? 'warm, confident, and interpretive - using astrological language naturally'
      : 'grounded, observational, and lightly skeptical-safe - framing insights as patterns';

    return `You are a professional Vedic astrologer. The user has not yet created a complete profile.

Encourage them to complete their profile for more personalized guidance, but still provide general astrological insights based on their questions.

Your tone is ${toneDescription}.

INSTRUCTIONS:
1. Provide helpful astrological guidance based on the question asked.
2. Mention that a complete birth chart would enable more specific predictions.
3. Invite them to share their birth details (date, time, place) for personalized readings.
4. Start by anchoring to what the user just said.
5. Include one subtle observation about their situation.
6. End with one focused follow-up question.
7. Do NOT use these phrases: ${this.bannedPhrases.join(', ')}
8. Make the user feel noticed before predicted.

${toneBlock}`;
  }

  /**
   * Build conversation messages array for AI with response mode and belief detection
   * @param {string} systemPrompt - The system context
   * @param {Array} chatHistory - Previous messages
   * @param {string} currentMessage - Current user message
   * @param {Object} profile - User profile for context
   * @param {Object} user - User object (contains is_believer field)
   * @param {string} beliefType - 'believer' or 'non_believer' (optional, auto-detected if not provided)
   * @returns {Promise<Array>} - Messages array for Ollama
   */
  async buildMessagesArray(systemPrompt, chatHistory, currentMessage, profile = null, user = null, beliefType = null) {
    // Detect response mode and belief type
    const responseMode = this.detectResponseMode(currentMessage);

    // Get belief type from profile/user or detect from message
    let userBeliefType = beliefType;
    if (!userBeliefType) {
      // Check user object first (contains is_believer field)
      if (user && typeof user.is_believer === 'boolean') {
        userBeliefType = user.is_believer ? 'believer' : 'non_believer';
      }
      // Check profile for isBeliever field
      else if (profile && typeof profile.isBeliever === 'boolean') {
        userBeliefType = profile.isBeliever ? 'believer' : 'non_believer';
      }
      // Fallback to old field names if they exist
      else if (profile && (profile.belief_type || profile.beliefType)) {
        userBeliefType = profile.belief_type || profile.beliefType;
      }
    }
    userBeliefType = this.detectBeliefType(currentMessage, userBeliefType);

    // Rebuild system prompt with detected mode and belief type
    const contextualPrompt = profile
      ? await this.buildSystemPrompt(profile, responseMode, userBeliefType)
      : this._getDefaultAstrologerPrompt(responseMode, userBeliefType, currentMessage);

    const messages = [
      {
        role: 'system',
        content: contextualPrompt
      }
    ];

    // Add chat history (last N messages to avoid token overflow)
    const MAX_HISTORY = 10;
    const recentHistory = chatHistory.slice(-MAX_HISTORY);
    
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  /**
   * Utility: Format date string
   */
  _formatDate(dateStr) {
    if (!dateStr) return 'Not provided';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Utility: Capitalize first letter
   */
  _capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Utility: Format kebab-case to readable
   */
  _formatKebabCase(str) {
    if (!str) return '';
    return str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}

module.exports = new ContextBuilder();
