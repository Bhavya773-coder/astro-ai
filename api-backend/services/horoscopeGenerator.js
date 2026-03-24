const DailyHoroscope = require('../models/DailyHoroscope');
const llmService = require('./llmService');

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
];

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

async function generateHoroscopeForSignIfMissing(zodiacSign, date) {
  const existing = await DailyHoroscope.findOne({ zodiac_sign: zodiacSign, date }).lean();
  if (existing) {
    return existing;
  }

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
  } catch (err) {
    console.error('Failed to parse LLM horoscope JSON for', zodiacSign, 'raw:', raw);
    throw err;
  }

  const doc = new DailyHoroscope({
    zodiac_sign: zodiacSign,
    date,
    horoscope: {
      overall_theme: parsed.overall_theme || '',
      mood: parsed.mood || '',
      love: parsed.love || '',
      career: parsed.career || '',
      health: parsed.health || '',
      finance: parsed.finance || '',
      advice: parsed.advice || '',
      warning: parsed.warning || '',
      lucky_number: typeof parsed.lucky_number === 'number' ? parsed.lucky_number : Number(parsed.lucky_number) || 0,
      lucky_color: parsed.lucky_color || ''
    },
    generated_by: 'gpt-oss:120B'
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
  getTodayDateString
};

