const aiService = require('../services/aiService');
const AIFeedback = require('../models/AIFeedback');
const Profile = require('../models/Profile');
const DailyDecision = require('../models/DailyDecision');

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

      // 0. Fetch user profile for deep context
      const profile = await Profile.findOne({ user_id: req.user.userId });
      
      let profilePrompt = 'CONTEXT FOR THE USER:\n';
      if (profile) {
        profilePrompt += `- Name: ${profile.full_name}\n`;
        profilePrompt += `- Gender: ${profile.gender}\n`;
        profilePrompt += `- Relationship Status: ${profile.life_context?.relationship_status}\n`;
        profilePrompt += `- Career Stage: ${profile.life_context?.career_stage}\n`;
        profilePrompt += `- Personality: ${profile.life_context?.personality_style}\n`;
        if (profile.birth_chart_data?.sun_sign) {
          profilePrompt += `- Sun Sign: ${profile.birth_chart_data.sun_sign}, Moon: ${profile.birth_chart_data.moon_sign}, ASC: ${profile.birth_chart_data.ascendant}\n`;
        }
      } else {
        profilePrompt += "- No profile found, use neutral context.\n";
      }

      // 0.1 Fetch user feedback for context personalization
      const pastFeedback = await AIFeedback.find({ user_id: req.user.userId })
        .sort({ created_at: -1 })
        .limit(5);

      let contextPrompt = '';
      if (pastFeedback.length > 0) {
        contextPrompt = "\n\nCRITICAL CONTEXT - PERSONALIZATION BASED ON PAST USER FEEDBACK:\n";
        pastFeedback.forEach(f => {
          contextPrompt += `- User marked "${f.content.substring(0, 50)}..." as ${f.rating.toUpperCase().replace('_', ' ')}.\n`;
        });
        contextPrompt += "Adjust your tone and specific predictions to better align with what the user considers accurate and avoid themes they marked as 'not me'.";
      }

      // 1. Build comprehensive prompt with new dashboard sections
      const messages = [
        {
          role: 'system',
          content: 'You are a professional astrologer. Write in plain text only with clear sections. No JSON, no markdown, no intro phrases. Be concise and actionable. ALWAYS respect the user gender and identity provided in context. Do NOT use gendered terms like Lioness for a male or Lion for a female unless it specifically matches their gender identity.\n\n' + profilePrompt + '\n' + contextPrompt
        },
        {
          role: 'user',
          content: `Generate a complete daily cosmic reading for ${zodiac} with these sections:

1. HOROSCOPE: Main horoscope text (100-140 words, mystical tone, covers emotions/career/relationships)
2. INSIGHTS: Key insights for today - what the stars reveal specifically for this day
3. REASON: Why these cosmic energies are affecting you today - the astrological reason
4. ACTIONS: What you should do today - practical advice and actions to take

5. ENERGY_LABEL: 3-word maximum label describing today's energy (e.g., "Unstable Genius", "Calm Power", "Creative Storm")

6. TRAITS: 3 traits with emoji icons, format: emoji|text|type (type = positive/warning/neutral)
   Example: 🎯|Big idea potential|positive
   Example: ⚠️|Risk of overthinking|warning
   Example: ✨|Social energy high|neutral

7. PREDICTION: One specific thing that might happen today - phrased as a concrete scenario (not vague)

8. LUCKY_MOMENT: Lucky attributes in this format:
   color|[lucky color name]
   number|[single digit lucky number]
   power_hour|[time like "2:10 PM"]
   avoid|[2-3 word thing to avoid]

9. DAILY_ACTIONS for 4 focus areas (max 6 words per action):
   WORK_DO: [action 1]|[action 2]
   WORK_AVOID: [thing 1]|[thing 2]
   WORK_LUCK: [time range]
   LOVE_DO: [action 1]|[action 2]
   LOVE_AVOID: [thing 1]|[thing 2]
   LOVE_LUCK: [time range]
   MIND_DO: [action 1]|[action 2]
   MIND_AVOID: [thing 1]|[thing 2]
   MIND_LUCK: [time range]
   MONEY_DO: [action 1]|[action 2]
   MONEY_AVOID: [thing 1]|[thing 2]
   MONEY_LUCK: [time range]

Format your response EXACTLY like this (include the labels):

HOROSCOPE:
[your horoscope text here]

INSIGHTS:
[your insights here]

REASON:
[your reason here]

ACTIONS:
[your actions here]

ENERGY_LABEL:
[3-word energy label]

TRAITS:
🎯|[trait1]|positive
⚠️|[trait2]|warning
✨|[trait3]|neutral

PREDICTION:
[one specific prediction]

LUCKY_MOMENT:
color|[color]
number|[number]
power_hour|[time]
avoid|[thing to avoid]

WORK_DO: [do1]|[do2]
WORK_AVOID: [avoid1]|[avoid2]
WORK_LUCK: [time]
LOVE_DO: [do1]|[do2]
LOVE_AVOID: [avoid1]|[avoid2]
LOVE_LUCK: [time]
MIND_DO: [do1]|[do2]
MIND_AVOID: [avoid1]|[avoid2]
MIND_LUCK: [time]
MONEY_DO: [do1]|[do2]
MONEY_AVOID: [avoid1]|[avoid2]
MONEY_LUCK: [time]`
        }
      ];

      // Generate horoscope using AI
      const aiResponse = await aiService.generateCompletion(messages, {
        temperature: 0.8
      });

      console.log('[HoroscopeController] AI response received');

      // Parse the sections from the response
      const parseSection = (text, label) => {
        const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z_]+:|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };
      
      // Parse list sections like TRAITS
      const parseListSection = (text, label) => {
        const section = parseSection(text, label);
        return section.split('\\n').map(line => line.trim()).filter(line => line);
      };
      
      // Parse lucky moment section
      const parseLuckyMoment = (text) => {
        const section = parseSection(text, 'LUCKY_MOMENT');
        const lines = section.split('\\n').map(line => line.trim()).filter(line => line);
        const result = {};
        lines.forEach(line => {
          const [key, value] = line.split('|').map(s => s.trim());
          if (key && value) result[key] = value;
        });
        return result;
      };
      
      // Parse daily actions for a focus area
      const parseDailyAction = (text, prefix) => {
        const doSection = parseSection(text, `${prefix}_DO`);
        const avoidSection = parseSection(text, `${prefix}_AVOID`);
        const luckSection = parseSection(text, `${prefix}_LUCK`);
        
        return {
          do: doSection.split('|').map(s => s.trim()).filter(s => s),
          avoid: avoidSection.split('|').map(s => s.trim()).filter(s => s),
          luck_window: luckSection
        };
      };
      
      let horoscopeText = parseSection(aiResponse, 'HOROSCOPE');
      let insights = parseSection(aiResponse, 'INSIGHTS');
      let reason = parseSection(aiResponse, 'REASON');
      let actions = parseSection(aiResponse, 'ACTIONS');
      let energyLabel = parseSection(aiResponse, 'ENERGY_LABEL');
      let prediction = parseSection(aiResponse, 'PREDICTION');
      
      // Parse traits
      const traitsLines = parseListSection(aiResponse, 'TRAITS');
      const traits = traitsLines.map(line => {
        const parts = line.split('|').map(s => s.trim());
        return {
          icon: parts[0] || '✨',
          text: parts[1] || 'Energy flowing',
          type: ['positive', 'warning', 'neutral'].includes(parts[2]) ? parts[2] : 'neutral'
        };
      });
      
      // Parse lucky moment
      const luckyMoment = parseLuckyMoment(aiResponse);
      
      // Parse daily actions for each focus area
      const dailyActions = {
        work: parseDailyAction(aiResponse, 'WORK'),
        love: parseDailyAction(aiResponse, 'LOVE'),
        mind: parseDailyAction(aiResponse, 'MIND'),
        money: parseDailyAction(aiResponse, 'MONEY')
      };
      
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
      energyLabel = cleanText(energyLabel);
      prediction = cleanText(prediction);
      
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
      if (energyLabel.length < 3) {
        energyLabel = 'Cosmic Flow';
      }
      if (prediction.length < 10) {
        prediction = 'An unexpected opportunity will present itself today.';
      }
      if (traits.length === 0) {
        traits.push(
          { icon: '✨', text: 'Energy flowing', type: 'neutral' },
          { icon: '🎯', text: 'Focus sharp', type: 'positive' },
          { icon: '⚠️', text: 'Stay mindful', type: 'warning' }
        );
      }

      const today = new Date().toISOString().split('T')[0];
      
      const finalHoroscope = {
        zodiac: zodiac,
        date: today,
        horoscope: horoscopeText,
        insights: insights,
        reason: reason,
        actions: actions,
        // NEW FIELDS for dashboard redesign
        energy_label: energyLabel,
        traits: traits,
        prediction: prediction,
        lucky_moment: {
          color: luckyMoment.color || 'Deep Violet',
          number: parseInt(luckyMoment.number) || 7,
          power_hour: luckyMoment.power_hour || '2:10 PM',
          avoid: luckyMoment.avoid || 'Rushed decisions'
        },
        daily_actions: dailyActions
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

  /**
   * Generate a single line action based on focus
   * POST /api/horoscope/daily-action
   */
  generateDailyFocusAction = async (req, res) => {
    try {
      const { focus, zodiac } = req.body;
      
      if (!focus || !['work', 'love', 'mind', 'money'].includes(focus)) {
        return res.status(400).json({ success: false, message: 'Invalid focus area' });
      }

      // Fetch profile context
      const profile = await Profile.findOne({ user_id: req.user.userId });
      const gender = profile?.gender || 'neutral';
      const name = profile?.full_name || 'the user';
      const relationship = profile?.life_context?.relationship_status || 'unknown';

      const pastFeedback = await AIFeedback.find({ user_id: req.user.userId, focus: focus })
        .sort({ created_at: -1 })
        .limit(3);

      let contextPrompt = '';
      if (pastFeedback.length > 0) {
        contextPrompt = "\nPAST FEEDBACK FOR " + focus.toUpperCase() + ":\n";
        pastFeedback.forEach(f => {
          contextPrompt += `- User rated "${f.content.substring(0, 40)}..." as ${f.rating.toUpperCase()}.\n`;
        });
      }

      const messages = [
        {
          role: 'system',
          content: `You are a direct personal advisor. Give 1-2 lines of highly specific, high-impact advice for ${name} (Gender: ${gender}, Relationship: ${relationship}) strictly about their focus area: ${focus.toUpperCase()}. Do not give generic advice like "take a breath". Tell them exactly what move to make in their ${focus} life today. Use simple English. NO astrology talk. NO quotes.` + contextPrompt
        },
        {
          role: 'user',
          content: `Focus: ${focus.toUpperCase()}\nZodiac: ${zodiac || 'Cosmic'}\nGenerate one single line of advice.`
        }
      ];

      const aiResponse = await aiService.generateCompletion(messages, { temperature: 0.7 });
      
      res.json({
        success: true,
        data: aiResponse.trim().replace(/^"|"$/g, '')
      });
    } catch (error) {
      console.error('[HoroscopeController] Focus action error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate action' });
    }
  }

  /**
   * Generate a 2-3 line personalized horoscope
   * POST /api/horoscope/personalized-prediction
   */
  generatePersonalizedPrediction = async (req, res) => {
    try {
      const { zodiac } = req.body;
      
      const profile = await Profile.findOne({ user_id: req.user.userId });
      const gender = profile?.gender || 'neutral';
      const name = profile?.full_name || 'the user';

      const pastFeedback = await AIFeedback.find({ user_id: req.user.userId, insight_type: 'daily_prediction' })
        .sort({ created_at: -1 })
        .limit(3);

      let contextPrompt = '';
      if (pastFeedback.length > 0) {
        contextPrompt = "\nPAST FEEDBACK FOR PREDICTIONS:\n";
        pastFeedback.forEach(f => {
          contextPrompt += `- User rated "${f.content.substring(0, 40)}..." as ${f.rating.toUpperCase()}.\n`;
        });
      }

      const messages = [
        {
          role: 'system',
          content: `You are a professional astrologer. Write a 2-3 line highly personalized daily horoscope prediction for ${name} (Gender: ${gender}). Mention planetary movements. Use a premium, insightful tone. Do NOT use gendered metaphors that clash with the user identity.` + contextPrompt
        },
        {
          role: 'user',
          content: `Zodiac: ${zodiac}\nGenerate a 2-3 line prediction.`
        }
      ];

      const aiResponse = await aiService.generateCompletion(messages, { temperature: 0.8 });
      
      res.json({
        success: true,
        data: aiResponse.trim().replace(/^"|"$/g, '')
      });
    } catch (error) {
      console.error('[HoroscopeController] Personalized prediction error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate prediction' });
    }
  }

  /**
   * Submit feedback for an AI insight
   * POST /api/horoscope/feedback
   */
  submitFeedback = async (req, res) => {
    try {
      const { insight_type, content, rating, zodiac, focus } = req.body;
      const user_id = req.user.userId;

      if (!insight_type || !content || !rating) {
        return res.status(400).json({ success: false, message: 'Missing feedback data' });
      }

      // Only allow one feedback record per content per user to avoid spam/context bloating
      const existing = await AIFeedback.findOne({ user_id, content: content.trim() });
      if (existing) {
        existing.rating = rating;
        await existing.save();
      } else {
        await AIFeedback.create({
          user_id,
          insight_type,
          content: content.trim(),
          rating,
          zodiac,
          focus
        });
      }

      res.json({ success: true, message: 'Feedback stored for future personalization' });
    } catch (error) {
      console.error('[HoroscopeController] Feedback error:', error);
      res.status(500).json({ success: false, message: 'Failed to save feedback' });
    }
  }

  /**
   * Generate highly engaging "Daily Decision Engine" content
   * POST /api/horoscope/daily-decision-engine
   */
  generateDailyDecisionData = async (req, res) => {
    try {
      const { zodiac } = req.body;
      const user_id = req.user.userId;
      const today = new Date().toISOString().split('T')[0];

      // 1. Check for stable daily data
      const existing = await DailyDecision.findOne({ user_id, date: today });
      if (existing) {
        return res.json({ success: true, data: existing.data });
      }

      const profile = await Profile.findOne({ user_id });

      let contextPrompt = 'USER CONTEXT:\n';
      if (profile) {
        contextPrompt += `- Focus Style: ${profile.life_context?.personality_style}\n`;
        contextPrompt += `- Current Stage: ${profile.life_context?.career_stage}\n`;
        contextPrompt += `- Sun Sign: ${profile.birth_chart_data?.sun_sign || zodiac}\n`;
      }

      // 2. Generate multi-focus package (All 4 quadrants)
      const messages = [
        {
          role: 'system',
          content: `You are the Daily Decision Engine for AstroAI4U. 
          TONE: Provocative, action-oriented, direct. No fluff.
          
          ${contextPrompt}`
        },
        {
          role: 'user',
          content: `Generate a decision-driven horoscope for ${zodiac}.
          Return EXACTLY in this JSON format (no other text):
          {
            "hook": "A single shared high-tension curiosity hook for the day",
            "signals": {
              "focus": "High" | "Low",
              "emotion": "Stable" | "Unstable"
            },
            "quadrants": {
              "work": {
                "moves": { "optionA": "Action 1", "optionB": "Action 2" },
                "actions": { "do": ["Item 1", "Item 2"], "avoid": ["Item 3", "Item 4"] },
                "timing": { "powerWindow": "Time range", "cautionWindow": "Time range" },
                "predictions": ["Possible event 1", "Possible event 2"],
                "insight": "Basis for this advice (2 lines)"
              },
              "love": { /* same structure as work */ },
              "mind": { /* same structure as work */ },
              "money": { /* same structure as work */ }
            }
          }`
        }
      ];

      const aiResponse = await aiService.generateCompletion(messages, { temperature: 0.95 });
      let parsedData;
      try {
        parsedData = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
      } catch (e) {
        console.error('JSON Parse error, trying fallback', e);
        throw new Error('AI output was not valid JSON');
      }

      // 3. Save for stability
      await DailyDecision.create({
        user_id,
        date: today,
        zodiac,
        data: parsedData
      });

      res.json({ success: true, data: parsedData });
    } catch (error) {
      console.error('[DecisionEngine] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate decision data' });
    }
  }
}

module.exports = new HoroscopeController();
