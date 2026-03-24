const DailyHoroscope = require('../models/DailyHoroscope');
const { getTodayDateString } = require('../services/horoscopeGenerator');
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

      const record = await DailyHoroscope.findOne({
        zodiac_sign: zodiacSign,
        date: today
      }).lean();

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Today\'s horoscope is not yet available for your zodiac sign.'
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
}

module.exports = new HoroscopeController();
