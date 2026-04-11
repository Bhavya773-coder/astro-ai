const aiService = require('../services/aiService');
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const DressingSuggestion = require('../models/DressingSuggestion');

/**
 * Dressing Styler Controller
 * Generates personalized daily clothing suggestions using AI
 */
class DressingStylerController {

  /**
   * Generate a personalized dressing suggestion for the day
   * POST /api/dressing-styler/generate
   */
  generateSuggestion = async (req, res) => {
    try {
      const userId = req.user.userId;
      const today = new Date().toISOString().split('T')[0];

      console.log('[DressingStylerController] Generating suggestion for user:', userId);

      // Get user profile
      const profile = await Profile.findOne({ user_id: userId });
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found. Please complete your profile first.'
        });
      }

      // Check if AI service is healthy
      const healthCheck = await aiService.healthCheck();
      if (!healthCheck.healthy) {
        return res.status(503).json({
          success: false,
          message: 'AI service is not running. Please try again later.'
        });
      }

      // Build user context from profile
      const userContext = {
        full_name: profile.full_name,
        gender: profile.gender || 'unspecified',
        date_of_birth: profile.date_of_birth,
        sun_sign: profile.birth_chart_data?.sun_sign || 'Unknown',
        moon_sign: profile.birth_chart_data?.moon_sign || 'Unknown',
        ascendant: profile.birth_chart_data?.ascendant || 'Unknown',
        numerology_life_path: profile.numerology_data?.life_path || 'Unknown',
        life_context: profile.life_context || {},
        style_preferences: profile.style_preferences || {}
      };

      // Get current season/weather context (simplified)
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                     currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                     currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

      // Build AI prompt
      const messages = [
        {
          role: 'system',
          content: 'You are a professional fashion and style consultant who specializes in astrological and numerology-based styling advice. Write in plain text only with clear sections. No JSON, no markdown, no intro phrases.'
        },
        {
          role: 'user',
          content: `Generate a high-end, hyper-personalized daily dressing suggestion for ${userContext.full_name} based on their cosmic and personal data:

USER PROFILE:
- Name: ${userContext.full_name}
- Sun Sign: ${userContext.sun_sign}
- Moon Sign: ${userContext.moon_sign}
- Ascendant: ${userContext.ascendant}
- Life Path Number: ${userContext.numerology_life_path}
- Current Season: ${season}

PERSONAL STYLE CONTEXT:
- Occasion/Setting: ${userContext.style_preferences.work_setting || 'Daily Wear'}
- Preferred Vibe: ${userContext.style_preferences.style_vibe || 'Authentic Self'}
- Ideal Fit: ${userContext.style_preferences.fit_preference || 'Standard'}
- Accessory Preference: ${userContext.style_preferences.accessory_level || 'Subtle'}
- Colors/Patterns to Avoid: ${userContext.style_preferences.avoid_colors || 'None'}

Provide a dressing suggestion with these exact sections (use these labels):

HEADLINE:
[Creative headline for today's look - 5-8 words]

OVERVIEW:
[Brief 2-3 sentence explanation of why this specific style works for their profile today]

COLOR_PALETTE:
[List 3-4 specific colors that resonate with their sign and requested setting today]

LUCKY_ITEM:
[One specific lucky item to carry or wear today]

ASTROLOGICAL_REASON:
[2-3 sentences linking their specific signs and life path to this choice]

MOOD_ENERGY:
[The vibe/mood this outfit should evoke]`
        }
      ];

      // Generate suggestion using AI
      const aiResponse = await aiService.generateCompletion(messages, {
        temperature: 0.8,
        max_tokens: 1500
      });

      console.log('[DressingStylerController] AI response received');

      // Parse sections from response
      const parseSection = (text, label) => {
        const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z_]+:|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      const suggestion = {
        headline: parseSection(aiResponse, 'HEADLINE'),
        overview: parseSection(aiResponse, 'OVERVIEW'),
        color_palette: parseSection(aiResponse, 'COLOR_PALETTE'),
        lucky_item: parseSection(aiResponse, 'LUCKY_ITEM'),
        astrological_reason: parseSection(aiResponse, 'ASTROLOGICAL_REASON'),
        mood_energy: parseSection(aiResponse, 'MOOD_ENERGY')
      };

      // Store in database - use findOneAndUpdate with upsert to allow refreshes
      const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;

      const newSuggestion = await DressingSuggestion.findOneAndUpdate(
        { user_id: userObjectId, date: today },
        { 
          ...suggestion,
          created_at: new Date()
        },
        { upsert: true, new: true }
      );

      console.log('[DressingStylerController] Suggestion saved/updated for user:', userId);

      res.json({
        success: true,
        data: suggestion,
        date: today,
        source: 'generated'
      });

    } catch (error) {
      console.error('[DressingStylerController] Error generating suggestion:', error);
      
      if (error.code === 'SERVICE_UNAVAILABLE' || error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'AI service is not running. Please try again later.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to generate dressing suggestion',
        error: error.message
      });
    }
  }

  /**
   * Get today's dressing suggestion (if exists)
   * GET /api/dressing-styler/today
   */
  getTodaySuggestion = async (req, res) => {
    try {
      const userId = req.user.userId;
      const today = new Date().toISOString().split('T')[0];

      const suggestion = await DressingSuggestion.findOne({
        user_id: userId,
        date: today
      });

      if (!suggestion) {
        return res.json({
          success: true,
          data: null,
          message: 'No suggestion generated yet today'
        });
      }

      res.json({
        success: true,
        data: suggestion
      });

    } catch (error) {
      console.error('[DressingStylerController] Error getting today suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get today suggestion'
      });
    }
  }

  /**
   * Get suggestion history
   * GET /api/dressing-styler/history
   */
  getHistory = async (req, res) => {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 7;

      const history = await DressingSuggestion.find({
        user_id: userId
      })
        .sort({ date: -1 })
        .limit(limit);

      res.json({
        success: true,
        data: history,
        count: history.length
      });

    } catch (error) {
      console.error('[DressingStylerController] Error getting history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestion history'
      });
    }
  }
}

module.exports = new DressingStylerController();
