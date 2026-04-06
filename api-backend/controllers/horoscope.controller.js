const aiService = require('../services/aiService');

/**
 * Horoscope Controller
 * Generates personalized daily horoscopes using LLaMA AI
 */
class HoroscopeController {
  
  /**
   * Generate a personalized horoscope for a zodiac sign
   * POST /api/horoscope
   */
  generateHoroscope = async (req, res) => {
    try {
      const { zodiac } = req.body;

      // Validate zodiac sign
      const validZodiacs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];

      if (!zodiac || !validZodiacs.includes(zodiac)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid zodiac sign'
        });
      }

      console.log('[HoroscopeController] Generating horoscope for:', zodiac);

      // Check if AI service is healthy first
      const healthCheck = await aiService.healthCheck();
      console.log('[HoroscopeController] AI health check:', healthCheck);
      
      if (!healthCheck.healthy) {
        return res.status(503).json({
          success: false,
          message: 'AI service (Ollama) is not running. Please start it with: ollama serve'
        });
      }

      if (!healthCheck.modelAvailable) {
        return res.status(503).json({
          success: false,
          message: `Model "${process.env.OLLAMA_MODEL || 'llama3:latest'}" not found. Please pull it: ollama pull llama3`,
          availableModels: healthCheck.availableModels
        });
      }

      // Build simple text-based prompt - NO JSON to avoid parsing issues
      const messages = [
        {
          role: 'system',
          content: 'You are a professional astrologer. Write in plain text only with clear sections. No JSON, no markdown, no intro phrases.'
        },
        {
          role: 'user',
          content: `Generate a complete daily cosmic reading for ${zodiac} with 4 sections:

1. HOROSCOPE: Main horoscope text (100-140 words, mystical tone, covers emotions/career/relationships)
2. INSIGHTS: Key insights for today - what the stars reveal specifically for this day
3. REASON: Why these cosmic energies are affecting you today - the astrological reason
4. ACTIONS: What you should do today - practical advice and actions to take

Format your response EXACTLY like this (include the labels):

HOROSCOPE:
[your horoscope text here]

INSIGHTS:
[your insights here]

REASON:
[your reason here]

ACTIONS:
[your actions here]`
        }
      ];

      // Generate horoscope using AI
      const aiResponse = await aiService.generateCompletion(messages, {
        temperature: 0.8
      });

      console.log('[HoroscopeController] AI response received');

      // Parse the 4 sections from the response
      const parseSection = (text, label) => {
        const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]+:|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };
      
      let horoscopeText = parseSection(aiResponse, 'HOROSCOPE');
      let insights = parseSection(aiResponse, 'INSIGHTS');
      let reason = parseSection(aiResponse, 'REASON');
      let actions = parseSection(aiResponse, 'ACTIONS');
      
      // Remove common intro phrases
      const cleanText = (text) => {
        return text
          .replace(/^here is .*?:\\s*/i, '')
          .replace(/^.*?for \\w+:\\s*/i, '')
          .replace(/^dear \\w+,?\\s*/i, '')
          .trim();
      };
      
      horoscopeText = cleanText(horoscopeText);
      insights = cleanText(insights);
      reason = cleanText(reason);
      actions = cleanText(actions);
      
      // Fallback if sections are empty
      if (horoscopeText.length < 50) {
        horoscopeText = `The cosmic energies favor ${zodiac} today. Trust your intuition and embrace the opportunities that come your way.`;
      }
      if (insights.length < 10) {
        insights = 'Today brings clarity and new perspectives on your path forward.';
      }
      if (reason.length < 10) {
        reason = 'The planetary alignment supports your zodiac sign with positive vibrations.';
      }
      if (actions.length < 10) {
        actions = 'Trust your instincts and take confident steps toward your goals.';
      }

      const today = new Date().toISOString().split('T')[0];
      
      const finalHoroscope = {
        zodiac: zodiac,
        date: today,
        horoscope: horoscopeText,
        insights: insights,
        reason: reason,
        actions: actions
      };

      console.log('[HoroscopeController] Horoscope generated successfully');

      res.json({
        success: true,
        data: finalHoroscope
      });

    } catch (error) {
      console.error('[HoroscopeController] Error generating horoscope:', error);
      
      if (error.code === 'SERVICE_UNAVAILABLE' || error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'AI service (Ollama) is not running. Please start it with: ollama serve'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to generate horoscope',
        error: error.message
      });
    }
  }
}

module.exports = new HoroscopeController();
