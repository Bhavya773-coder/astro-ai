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
      }
    } catch (error) {
      console.error('[ContextBuilder] Error fetching kundli data:', error);
    }

    const sections = [
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
1. Always use the user's kundli data (Sun, Moon, Ascendant, Nakshatra, Planetary positions, Houses) in your analysis.
2. Reference numerology data when relevant to timing or life path questions.
3. Consider the user's life context (career stage, relationship status, main focus) in your guidance.
4. For relationship questions: reference their relationship status and emotional style (Moon sign, Venus position).
5. For career questions: use career stage and relevant planetary influences (Sun sign, 10th house, Saturn position).
6. For timing questions: reference the personal year and planetary transits based on kundli data.
7. Be specific to their kundli and situation - avoid generic advice.
8. If some kundli data is missing, work with what is provided and note that more detail could refine the reading.
9. Never refuse to answer. If a question is outside astrology, provide a helpful perspective.`;

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
