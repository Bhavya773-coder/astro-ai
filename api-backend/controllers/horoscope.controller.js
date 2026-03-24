const DailyHoroscope = require('../models/DailyHoroscope');
const { generateHoroscopeForSignIfMissing, getTodayDateString } = require('../services/horoscopeGenerator');
const Profile = require('../models/Profile');

const VALID_ZODIAC_SIGNS = [
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

function normalizeZodiacSign(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().toLowerCase();

  // Exact match on name ignoring case
  const exact = VALID_ZODIAC_SIGNS.find(
    (sign) => sign.toLowerCase() === cleaned
  );
  if (exact) return exact;

  // Handle values like "Libra ♎", "sun in libra", etc. by substring search
  const contains = VALID_ZODIAC_SIGNS.find((sign) =>
    cleaned.includes(sign.toLowerCase())
  );
  return contains || null;
}

class HoroscopeController {
  constructor() {
    this.getTodayHoroscope = this.getTodayHoroscope.bind(this);
  }

  getZodiacSignFromProfile(profile) {
    if (!profile) return null;
    const raw =
      profile.birth_chart_data?.sun_sign ||
      profile.birth_chart_data?.enhanced_birth_chart_data?.sun_sign?.sign;
    return normalizeZodiacSign(raw);
  }

  async getTodayHoroscope(req, res) {
    try {
      const userId = req.user.userId;

      const profile = await Profile.findOne({ user_id: userId });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found. Please complete your profile first.'
        });
      }

      const zodiacSign = this.getZodiacSignFromProfile(profile) || 'Aries';
      const today = getTodayDateString();

      // Try to find existing horoscope
      let record = await DailyHoroscope.findOne({
        zodiac_sign: zodiacSign,
        date: today
      }).lean();

      // If not found, generate it on-demand
      if (!record) {
        console.log(`[HoroscopeController] Generating horoscope for ${zodiacSign} (${today})`);
        try {
          record = await generateHoroscopeForSignIfMissing(zodiacSign, today);
        } catch (err) {
          console.error(`[HoroscopeController] Failed to generate horoscope for ${zodiacSign}:`, err);
          return res.status(500).json({
            success: false,
            message: 'Failed to generate today\'s horoscope. Please try again later.'
          });
        }
      }

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Unable to generate horoscope for your zodiac sign.'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          zodiac_sign: record.zodiac_sign,
          date: record.date,
          ...record.horoscope
        }
      });
    } catch (error) {
      console.error('Error in getTodayHoroscope:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load today\'s horoscope.'
      });
    }
  }

  // New endpoint to get horoscope for any zodiac sign
  async getHoroscopeForSign(req, res) {
    try {
      const { sign } = req.params;
      const normalizedSign = normalizeZodiacSign(sign);

      if (!normalizedSign) {
        return res.status(400).json({
          success: false,
          message: 'Invalid zodiac sign. Please provide a valid sign like Aries, Taurus, etc.'
        });
      }

      const today = getTodayDateString();

      // Try to find existing horoscope
      let record = await DailyHoroscope.findOne({
        zodiac_sign: normalizedSign,
        date: today
      }).lean();

      // If not found, generate it on-demand
      if (!record) {
        console.log(`[HoroscopeController] Generating horoscope for ${normalizedSign} (${today})`);
        try {
          record = await generateHoroscopeForSignIfMissing(normalizedSign, today);
        } catch (err) {
          console.error(`[HoroscopeController] Failed to generate horoscope for ${normalizedSign}:`, err);
          return res.status(500).json({
            success: false,
            message: 'Failed to generate horoscope. Please try again later.'
          });
        }
      }

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Unable to generate horoscope for this zodiac sign.'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          zodiac_sign: record.zodiac_sign,
          date: record.date,
          ...record.horoscope
        }
      });
    } catch (error) {
      console.error('Error in getHoroscopeForSign:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load horoscope.'
      });
    }
  }
}

module.exports = new HoroscopeController();
