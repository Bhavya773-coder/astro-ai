const DailyHoroscope = require('../models/DailyHoroscope');
const llmService = require('./llmService');

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Simple horoscope templates for fallback
const HOROSCOPE_TEMPLATES = {
  Aries: {
    overall_theme: "Today brings fresh energy and new opportunities",
    mood: "Energetic and ready for action",
    love: "Your passion attracts positive attention",
    career: "Take initiative on important projects",
    health: "Channel your energy into physical activity",
    finance: "Bold financial moves may pay off",
    advice: "Trust your instincts but think before acting",
    warning: "Avoid impulsive decisions",
    lucky_number: 7,
    lucky_color: "Red"
  },
  Taurus: {
    overall_theme: "Stability and comfort are your priorities today",
    mood: "Grounded and practical",
    love: "Patience in relationships brings rewards",
    career: "Steady progress leads to success",
    health: "Focus on relaxation and self-care",
    finance: "Conservative financial planning is wise",
    advice: "Trust your practical instincts",
    warning: "Avoid stubbornness in negotiations",
    lucky_number: 6,
    lucky_color: "Green"
  },
  Gemini: {
    overall_theme: "Communication and connections highlight your day",
    mood: "Curious and adaptable",
    love: "Interesting conversations spark romance",
    career: "Networking opens new doors",
    health: "Mental stimulation keeps you sharp",
    finance: "Information leads to smart investments",
    advice: "Stay flexible and open-minded",
    warning: "Avoid spreading yourself too thin",
    lucky_number: 5,
    lucky_color: "Yellow"
  },
  Cancer: {
    overall_theme: "Emotional intelligence guides your decisions",
    mood: "Intuitive and nurturing",
    love: "Deep emotional connections flourish",
    career: "Teamwork brings the best results",
    health: "Emotional balance affects physical health",
    finance: "Security-focused decisions are smart",
    advice: "Trust your gut feelings",
    warning: "Avoid emotional overspending",
    lucky_number: 2,
    lucky_color: "Silver"
  },
  Leo: {
    overall_theme: "Your natural leadership shines today",
    mood: "Confident and charismatic",
    love: "Your warmth attracts admirers",
    career: "Take charge of important meetings",
    health: "Regular exercise boosts your vitality",
    finance: "Generous spending may backfire",
    advice: "Lead with confidence, not ego",
    warning: "Avoid being overly dramatic",
    lucky_number: 1,
    lucky_color: "Gold"
  },
  Virgo: {
    overall_theme: "Attention to detail brings success",
    mood: "Analytical and organized",
    love: "Small gestures mean the most",
    career: "Precision in work impresses others",
    health: "Routine health checks are important",
    finance: "Budget planning pays dividends",
    advice: "Focus on quality over quantity",
    warning: "Avoid perfectionism",
    lucky_number: 3,
    lucky_color: "Brown"
  },
  Libra: {
    overall_theme: "Balance and harmony guide your choices",
    mood: "Diplomatic and social",
    love: "Partnership energy is strong",
    career: "Collaboration leads to success",
    health: "Stress management is crucial",
    finance: "Fair financial decisions work best",
    advice: "Seek win-win solutions",
    warning: "Avoid indecisiveness",
    lucky_number: 8,
    lucky_color: "Pink"
  },
  Scorpio: {
    overall_theme: "Transformation and intensity mark your day",
    mood: "Passionate and focused",
    love: "Deep connections are favored",
    career: "Research uncovers hidden opportunities",
    health: "Detoxification benefits your body",
    finance: "Strategic investments pay off",
    advice: "Trust your powerful intuition",
    warning: "Avoid obsessive thinking",
    lucky_number: 4,
    lucky_color: "Black"
  },
  Sagittarius: {
    overall_theme: "Adventure and expansion call to you",
    mood: "Optimistic and free-spirited",
    love: "Honesty strengthens relationships",
    career: "Learning opportunities abound",
    health: "Outdoor activities energize you",
    finance: "Risks may lead to rewards",
    advice: "Stay open to new experiences",
    warning: "Avoid overcommitting",
    lucky_number: 9,
    lucky_color: "Purple"
  },
  Capricorn: {
    overall_theme: "Discipline and structure bring results",
    mood: "Ambitious and responsible",
    love: "Long-term planning strengthens bonds",
    career: "Hard work gets recognized",
    health: "Prevention is better than cure",
    finance: "Conservative growth is sustainable",
    advice: "Trust your experience",
    warning: "Avoid being too rigid",
    lucky_number: 10,
    lucky_color: "Gray"
  },
  Aquarius: {
    overall_theme: "Innovation and originality inspire others",
    mood: "Inventive and independent",
    love: "Friendship forms the foundation",
    career: "Unconventional approaches work",
    health: "Mental health needs attention",
    finance: "Tech investments look promising",
    advice: "Embrace your uniqueness",
    warning: "Avoid being too detached",
    lucky_number: 11,
    lucky_color: "Blue"
  },
  Pisces: {
    overall_theme: "Creativity and compassion flow through you",
    mood: "Intuitive and artistic",
    love: "Romance is in the air",
    career: "Creative projects flourish",
    health: "Meditation brings clarity",
    finance: "Intuition guides financial choices",
    advice: "Trust your creative instincts",
    warning: "Avoid escapism",
    lucky_number: 12,
    lucky_color: "Sea Green"
  }
};

function getTodayDateString() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
}

function buildPrompt(sign) {
  return `You are a professional astrologer.

Generate today's horoscope for zodiac sign: ${sign}

Return JSON only in this format:

{
"overall_theme":"",
"mood":"",
"love":"",
"career":"",
"health":"",
"finance":"",
"advice":"",
"warning":"",
"lucky_number": number,
"lucky_color":""
}

Each section should be 1–2 short sentences.

Do not include explanations outside JSON.`;
}

// Simple fallback generator when LLM fails
function generateSimpleHoroscope(sign) {
  const template = HOROSCOPE_TEMPLATES[sign];
  if (!template) {
    // Default template for unknown signs
    return {
      overall_theme: "Today brings unique opportunities for growth",
      mood: "Positive and receptive",
      love: "Open your heart to new connections",
      career: "Professional growth is possible",
      health: "Take care of your well-being",
      finance: "Smart financial choices matter",
      advice: "Stay positive and proactive",
      warning: "Avoid negative thinking",
      lucky_number: Math.floor(Math.random() * 12) + 1,
      lucky_color: "Blue"
    };
  }
  
  // Add some variety by slightly modifying the template
  return {
    ...template,
    lucky_number: template.lucky_number + Math.floor(Math.random() * 3) - 1 // Add some randomness
  };
}

async function generateHoroscopeForSignIfMissing(zodiacSign, date) {
  const existing = await DailyHoroscope.findOne({ zodiac_sign: zodiacSign, date }).lean();
  if (existing) {
    return existing;
  }

  let horoscope;
  try {
    // Try LLM first
    const prompt = buildPrompt(zodiacSign);
    const response = await llmService.callLLM(prompt);

    let raw = response?.choices?.[0]?.message?.content || '{}';

    // Strip markdown code blocks if present
    const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) {
      raw = codeMatch[1];
    }
    raw = raw.trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
      horoscope = parsed;
    } catch (err) {
      console.error('Failed to parse LLM horoscope JSON for', zodiacSign, 'raw:', raw);
      throw err;
    }
  } catch (err) {
    console.error('LLM generation failed for', zodiacSign, 'using simple fallback:', err.message || err);
    // Use simple template fallback
    horoscope = generateSimpleHoroscope(zodiacSign);
  }

  const doc = new DailyHoroscope({
    zodiac_sign: zodiacSign,
    date,
    horoscope: {
      overall_theme: horoscope.overall_theme || '',
      mood: horoscope.mood || '',
      love: horoscope.love || '',
      career: horoscope.career || '',
      health: horoscope.health || '',
      finance: horoscope.finance || '',
      advice: horoscope.advice || '',
      warning: horoscope.warning || '',
      lucky_number: typeof horoscope.lucky_number === 'number' ? horoscope.lucky_number : Number(horoscope.lucky_number) || 0,
      lucky_color: horoscope.lucky_color || ''
    },
    generated_by: horoscope.generated_by || 'simple-template'
  });

  try {
    await doc.save();
    return doc.toObject();
  } catch (err) {
    // Handle race condition with unique index: if another process created it, just read it
    if (err.code === 11000) {
      const existingAfterConflict = await DailyHoroscope.findOne({ zodiac_sign: zodiacSign, date }).lean();
      if (existingAfterConflict) {
        return existingAfterConflict;
      }
    }
    throw err;
  }
}

async function generateDailyHoroscopes() {
  const today = getTodayDateString();
  console.log('[HoroscopeGenerator] Generating daily horoscopes for', today);

  for (const sign of ZODIAC_SIGNS) {
    try {
      await generateHoroscopeForSignIfMissing(sign, today);
      console.log(`[HoroscopeGenerator] Horoscope ready for ${sign} (${today})`);
    } catch (err) {
      console.error(`[HoroscopeGenerator] Failed for ${sign} (${today}):`, err.message || err);
    }
  }
}

module.exports = {
  generateDailyHoroscopes,
  generateHoroscopeForSignIfMissing,
  getTodayDateString
};

