const axios = require('axios');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const KundliReport = require('../models/KundliReport');
const ImageReading = require('../models/ImageReading');
const Report = require('../models/Report');
const GrowthMetric = require('../models/GrowthMetric');

/**
 * AI Interpretation of a tarot card (optional, uses 1 credit)
 * This is called ONLY when user explicitly clicks "Interpret with AI"
 * 
 * Gathers the user's FULL profile context:
 *  - Profile (DOB, birth chart, numerology, life context)
 *  - Recent chat messages (last 30)
 *  - Kundli report (planetary positions, yogas)
 *  - Past readings (palm, coffee, face)
 *  - Growth metrics (emotional score, dominant theme)
 *  - All 3 selected cards for a holistic spread interpretation
 */
const interpretCard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      card_name, is_reversed, meaning_up, meaning_rev, desc, position,
      all_cards // Array of all 3 selected cards for cross-card context
    } = req.body;

    if (!card_name) {
      return res.status(400).json({ success: false, error: 'Card name is required' });
    }

    // ─── 1. Gather ALL user context in parallel ───
    const [profile, user, kundli, recentChats, imageReadings, reports, growthMetric] = await Promise.all([
      Profile.findOne({ user_id: userId }),
      User.findById(userId).select('email is_believer credits created_at'),
      KundliReport.findOne({ user_id: userId }),
      // Get last 30 messages from user's most recent chats
      Chat.find({ user_id: userId }).sort({ updated_at: -1 }).limit(5).then(async chats => {
        if (!chats.length) return [];
        const chatIds = chats.map(c => c._id);
        return Message.find({ chat_id: { $in: chatIds } })
          .sort({ created_at: -1 })
          .limit(30)
          .select('role content created_at')
          .lean();
      }),
      ImageReading.find({ user_id: userId }).sort({ created_at: -1 }).limit(3).select('reading_type result created_at').lean(),
      Report.find({ user_id: userId }).sort({ generated_at: -1 }).limit(5).select('report_type summary content generated_at').lean(),
      GrowthMetric.findOne({ user_id: userId })
    ]);

    // Verify user has sufficient credits (1 credit required)
    if (!user || user.credits < 1) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits. This feature requires 1 Cosmic Credit.',
        code: 'INSUFFICIENT_CREDITS',
        credits: user ? user.credits : 0
      });
    }

    // ─── 2. Build rich user context string ───
    const contextParts = [];

    // Profile basics
    if (profile) {
      const sunSign = profile.birth_chart_data?.sun_sign || 'Unknown';
      const moonSign = profile.birth_chart_data?.moon_sign || 'Unknown';
      const ascendant = profile.birth_chart_data?.ascendant || 'Unknown';
      const dominantPlanet = profile.birth_chart_data?.dominant_planet || 'Unknown';

      contextParts.push(`📋 PROFILE:
- Name: ${profile.full_name || 'Unknown'}
- DOB: ${profile.date_of_birth || 'Unknown'}
- Birth time: ${profile.time_of_birth || 'Unknown'}
- Birth place: ${profile.place_of_birth || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}
- Current location: ${profile.current_location || 'Unknown'}
- Sun Sign: ${sunSign}, Moon Sign: ${moonSign}, Ascendant: ${ascendant}
- Dominant Planet: ${dominantPlanet}`);

      // Life context
      if (profile.life_context) {
        const lc = profile.life_context;
        contextParts.push(`🌟 LIFE CONTEXT:
- Career stage: ${lc.career_stage || 'Unknown'}
- Relationship status: ${lc.relationship_status || 'Unknown'}
- Main life focus: ${lc.main_life_focus || 'Unknown'}
- Personality style: ${lc.personality_style || 'Unknown'}
- Primary life problem: ${lc.primary_life_problem || 'Unknown'}`);
      }

      // Numerology
      if (profile.numerology_data) {
        const nd = profile.numerology_data;
        contextParts.push(`🔢 NUMEROLOGY:
- Life Path: ${nd.life_path || 'Unknown'}
- Destiny Number: ${nd.destiny || 'Unknown'}
- Personal Year: ${nd.personal_year || 'Unknown'}`);
      }
    }

    // Kundli / Birth Chart data
    if (kundli) {
      const chart = kundli.chart_data || {};
      const interp = kundli.interpretation || {};
      contextParts.push(`🕉️ KUNDLI / BIRTH CHART:
- Ascendant: ${chart.ascendant || 'Unknown'}
- Moon Sign: ${chart.moon_sign || 'Unknown'}
- Sun Sign: ${chart.sun_sign || 'Unknown'}
- Nakshatra: ${chart.nakshatra || 'Unknown'}
- Personality: ${interp.personality ? interp.personality.substring(0, 300) : 'N/A'}
- Career Insight: ${interp.career ? interp.career.substring(0, 200) : 'N/A'}
- Relationship Insight: ${interp.relationships ? interp.relationships.substring(0, 200) : 'N/A'}
- Spiritual Path: ${interp.spiritual_path ? interp.spiritual_path.substring(0, 200) : 'N/A'}
- Important Yogas: ${interp.important_yogas?.join(', ') || 'None detected'}`);
    }

    // Growth metrics
    if (growthMetric) {
      contextParts.push(`📈 GROWTH & EMOTIONAL STATE:
- Emotional Score: ${growthMetric.emotional_score ?? 'N/A'}/100
- Dominant Theme: ${growthMetric.dominant_theme || 'N/A'}
- Risk Level: ${growthMetric.risk_level || 'N/A'}
- Monthly Progress: ${growthMetric.monthly_progress_score ?? 'N/A'}/100`);
    }

    // Recent chat themes (extract key user messages)
    if (recentChats.length > 0) {
      const userMessages = recentChats
        .filter(m => m.role === 'user')
        .slice(0, 15)
        .map(m => `  • "${m.content.substring(0, 120)}${m.content.length > 120 ? '...' : ''}"`)
        .join('\n');
      
      if (userMessages) {
        contextParts.push(`💬 RECENT CONVERSATIONS (what's been on their mind):\n${userMessages}`);
      }
    }

    // Past readings summaries
    if (imageReadings.length > 0) {
      const readingSummaries = imageReadings.map(r => {
        let summary = '';
        if (r.result && typeof r.result === 'object') {
          // Extract key insights from each reading type
          if (r.result.summary) summary = r.result.summary.substring(0, 200);
          else if (r.result.overall) summary = r.result.overall.substring(0, 200);
          else summary = JSON.stringify(r.result).substring(0, 200);
        } else if (typeof r.result === 'string') {
          summary = r.result.substring(0, 200);
        }
        return `  • ${r.reading_type.toUpperCase()} reading: ${summary}`;
      }).join('\n');
      contextParts.push(`🔮 PAST IMAGE READINGS:\n${readingSummaries}`);
    }

    // Reports
    if (reports.length > 0) {
      const reportSummaries = reports.map(r => {
        const summ = r.summary || (typeof r.content === 'string' ? r.content.substring(0, 150) : JSON.stringify(r.content).substring(0, 150));
        return `  • ${r.report_type}: ${summ}`;
      }).join('\n');
      contextParts.push(`📊 GENERATED REPORTS:\n${reportSummaries}`);
    }

    // ─── 3. Build the full spread context ───
    let spreadContext = '';
    if (all_cards && Array.isArray(all_cards) && all_cards.length > 0) {
      spreadContext = `\n\n🃏 FULL SPREAD (Past → Present → Future):
${all_cards.map((c, i) => {
  const positions = ['Past', 'Present', 'Future'];
  return `${i + 1}. ${positions[i] || 'Card ' + (i + 1)}: ${c.name} (${c.is_reversed ? 'REVERSED' : 'UPRIGHT'})`;
}).join('\n')}`;
    }

    // ─── 4. Build the AI prompt ───
    const orientation = is_reversed ? 'REVERSED' : 'UPRIGHT';
    const isBeliever = user?.is_believer;

    const prompt = `You are an elite, deeply intuitive Tarot master${isBeliever ? ' and Vedic astrologer who integrates Vedic wisdom into every reading' : ''} who gives DEEPLY PERSONAL readings. You don't give generic interpretations — you weave the user's ENTIRE life story, their current struggles, emotional state, and cosmic blueprint into every card you interpret.

═══════════════════════════════════════
📌 CARD BEING INTERPRETED:
Card: "${card_name}" — ${orientation}
Position in spread: ${position || 'General'}

Card Details:
- Upright meaning: ${meaning_up || 'N/A'}
- Reversed meaning: ${meaning_rev || 'N/A'}
- Description: ${desc || 'N/A'}
${spreadContext}
═══════════════════════════════════════

═══════════════════════════════════════
🧬 COMPLETE USER PROFILE & HISTORY:
${contextParts.length > 0 ? contextParts.join('\n\n') : 'No detailed profile available — give a meaningful general reading.'}
═══════════════════════════════════════

YOUR TASK:
Based on EVERYTHING you know about this person — their birth chart, life struggles, recent conversations, emotional state, past readings, and cosmic alignments — give a deeply personal interpretation of "${card_name}" in the ${position || 'general'} position.

Structure your response like this:
1. **🌙 What This Card Reveals** — How this card mirrors their current life situation specifically
2. **💫 The Deeper Message** — Connect this card to their zodiac energy, planetary influences${isBeliever ? ', nakshatra, and Vedic insights' : ''}, and what their recent thoughts/chats reveal about why THIS card appeared
3. **🔑 Key Guidance** — Concrete, actionable advice that speaks directly to their primary life focus and challenges
4. **✨ Cosmic Alignment** — How this card connects to the other cards in their spread and what the universe is trying to tell them

Be warm, mystical, deeply empathetic, and specific. Reference their actual life details naturally (their career situation, relationship, emotional state, etc.). This should feel like a reading from someone who truly KNOWS them. 4-5 paragraphs. Do NOT use JSON format — respond in natural flowing text with the emoji headers.`;

    const aiService = require('../services/aiService');

    const responseText = await aiService.generateCompletion([
      { role: 'system', content: `You are an elite, deeply intuitive Tarot master${isBeliever ? ' and Vedic astrologer who integrates Vedic wisdom into every reading' : ''} who gives DEEPLY PERSONAL readings. You don't give generic interpretations — you weave the user's ENTIRE life story, their current struggles, emotional state, and cosmic blueprint into every card you interpret.` },
      { role: 'user', content: prompt }
    ], { temperature: 0.8 });

    if (!responseText) throw new Error('No content received from AI service');

    // Deduct 1 credit (if not already deducted during reveal)
    const { skipDeduction } = req.body;
    let remainingCredits;
    if (!skipDeduction) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: -1 } },
        { new: true }
      );
      remainingCredits = updatedUser.credits;
      console.log(`[TarotController] Deducted 1 credit for interpretation. Remaining: ${remainingCredits}`);
    } else {
      const user = await User.findById(userId).select('credits');
      remainingCredits = user ? user.credits : 0;
      console.log(`[TarotController] Skipped credit deduction for interpretation. Remaining: ${remainingCredits}`);
    }

    console.log(`[TarotController] Deep AI interpretation generated for "${card_name}" (${position}). Context sources: profile=${!!profile}, kundli=${!!kundli}, chats=${recentChats.length}, readings=${imageReadings.length}, reports=${reports.length}, growth=${!!growthMetric}. Credits remaining: ${remainingCredits}`);

    return res.json({
      success: true,
      interpretation: responseText,
      credits_used: skipDeduction ? 0 : 1,
      remaining_credits: remainingCredits
    });
  } catch (err) {
    console.error('[TarotController] Interpret error:', err.message);
    next(err);
  }
};

const deductTarotCredit = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log(`[TarotController] Deducting 1 credit for tarot reading card reveal for user: ${userId}`);

    // Deduct 1 credit
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -1 } },
      { new: true }
    );

    console.log(`[TarotController] 1 credit deducted. New balance: ${updatedUser.credits}`);

    return res.json({
      success: true,
      message: '1 Cosmic Credit deducted for Tarot Reading.',
      remaining_credits: updatedUser.credits
    });
  } catch (err) {
    console.error('[TarotController] Deduct credit error:', err.message);
    next(err);
  }
};

module.exports = { interpretCard, deductTarotCredit };
