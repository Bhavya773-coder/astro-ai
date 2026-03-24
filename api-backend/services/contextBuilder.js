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
   * Build a complete system prompt from user profile with kundli data and response mode
   * @param {Object} profile - User profile document
   * @param {string} mode - 'short' or 'detailed'
   * @returns {Promise<string>} - Formatted system prompt
   */
  async buildSystemPrompt(profile, mode = 'short') {
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
      this._buildIdentitySection(mode),
      this._buildProfileSection(profile),
      this._buildKundliSection(kundliData),
      this._buildNumerologySection(profile.numerology_data),
      this._buildLifeContextSection(profile.life_context),
      this._buildInstructionsSection(mode)
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Build temporal context section with current date and astrological timing
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
    
    // Get Hindu calendar details (approximate)
    const hinduMonth = this._getHinduMonth(now);
    const paksha = this._getPaksha(now);
    const tithi = this._getTithi(now);
    
    // Get current planetary positions (simplified)
    const currentPlanetaryPositions = this._getCurrentPlanetaryPositions(now);
    
    return `CURRENT TEMPORAL CONTEXT:
Today's Date: ${today}
Day of Week: ${dayOfWeek}
Gregorian Date: ${date} ${month} ${year}

Hindu Calendar Context:
Hindu Month: ${hinduMonth}
Paksha (Fortnight): ${paksha}
Tithi (Lunar Day): ${tithi}

Current Astrological Timing:
${currentPlanetaryPositions}

Important: Use this current date and timing information for accurate predictions. Consider today's planetary positions, day of week influences, and Hindu calendar timing when providing astrological guidance. This ensures your predictions are temporally accurate and relevant to the present moment.`;
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
   * Build the astrologer identity section
   * @param {string} mode - 'short' or 'detailed'
   */
  _buildIdentitySection(mode = 'short') {
    const toneInstruction = mode === 'short' 
      ? 'Your tone is conversational, natural, and insightful - like a knowledgeable friend giving astrological guidance.'
      : 'Your tone is wise, calm, supportive, and slightly mystical but practical.';
    
    return `You are a professional Vedic astrologer with deep expertise in:
- Vedic astrology (Jyotish) and planetary influences
- Numerology and life path analysis
- Relationship compatibility and timing
- Career guidance based on planetary positions
- Personal growth and spiritual development

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
   * Build instructions section with response mode
   * @param {string} mode - 'short' or 'detailed'
   * @returns {string} - Instructions based on mode
   */
  _buildInstructionsSection(mode = 'short') {
    const isDetailed = mode === 'detailed';
    
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
11. IMPORTANT: Your predictions must be temporally accurate - use today's actual date and astrological timing, not generic information.`;

    if (isDetailed) {
      return `${baseInstructions}
10. This is a DETAILED response request. Provide comprehensive analysis with multiple paragraphs.
11. You may use formatting for clarity but avoid heavy tables or formal report structure.
12. Go deeper into astrological explanations and connections. Keep it informative yet conversational.`;
    } else {
      return `${baseInstructions}
10. DEFAULT MODE: Keep responses SHORT and conversational - 3 to 5 sentences maximum.
11. NO greetings like "Dear [Name]" - start directly with the insight.
12. NO tables, NO formal report sections, NO heavy markdown formatting.
13. Sound natural like ChatGPT - professional but conversational.
14. Always end with a brief offer like "Want me to explain more?" or "Should I go deeper on this?"`;
    }
  }

  /**
   * Default prompt when no profile exists
   * @param {string} mode - 'short' or 'detailed'
   */
  _getDefaultAstrologerPrompt(mode = 'short') {
    const isDetailed = mode === 'detailed';
    
    const shortInstructions = `DEFAULT MODE: Keep responses SHORT and conversational - 3 to 5 sentences maximum.
NO greetings like "Dear [Name]" - start directly with the insight.
NO tables, NO formal report sections, NO heavy markdown formatting.
Sound natural like ChatGPT - professional but conversational.
Always end with a brief offer like "Want me to explain more?" or "Should I go deeper on this?"`;

    const detailedInstructions = `DETAILED MODE: Provide comprehensive analysis with multiple paragraphs.
You may use formatting for clarity but avoid heavy tables or formal report structure.
Go deeper into astrological explanations. Keep it informative yet conversational.`;

    return `You are a professional Vedic astrologer. The user has not yet created a complete profile.

Encourage them to complete their profile for more personalized guidance, but still provide general astrological insights based on their questions.

Your tone is ${isDetailed ? 'wise, calm, supportive, and slightly mystical but practical' : 'conversational, natural, and insightful - like a knowledgeable friend'}.

INSTRUCTIONS:
1. Provide helpful astrological guidance based on the question asked.
2. Mention that a complete birth chart would enable more specific predictions.
3. Invite them to share their birth details (date, time, place) for personalized readings.
4. Keep responses conversational and warm.
5. ${isDetailed ? detailedInstructions : shortInstructions}`;
  }

  /**
   * Build conversation messages array for AI with response mode detection
   * @param {string} systemPrompt - The system context
   * @param {Array} chatHistory - Previous messages
   * @param {string} currentMessage - Current user message
   * @param {Object} profile - User profile for context
   * @returns {Promise<Array>} - Messages array for Ollama
   */
  async buildMessagesArray(systemPrompt, chatHistory, currentMessage, profile = null) {
    // Detect if user wants detailed response
    const responseMode = this.detectResponseMode(currentMessage);
    
    // Rebuild system prompt with detected mode
    const contextualPrompt = profile 
      ? await this.buildSystemPrompt(profile, responseMode)
      : this._getDefaultAstrologerPrompt(responseMode);
    
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
