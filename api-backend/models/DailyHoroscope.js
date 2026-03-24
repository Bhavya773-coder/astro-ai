const mongoose = require('mongoose');

const HoroscopeFieldsSchema = new mongoose.Schema(
  {
    overall_theme: { type: String, required: true },
    mood: { type: String, required: true },
    love: { type: String, required: true },
    career: { type: String, required: true },
    health: { type: String, required: true },
    finance: { type: String, required: true },
    advice: { type: String, required: true },
    warning: { type: String, required: true },
    lucky_number: { type: Number, required: true },
    lucky_color: { type: String, required: true }
  },
  { _id: false }
);

const DailyHoroscopeSchema = new mongoose.Schema(
  {
    zodiac_sign: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    horoscope: { type: HoroscopeFieldsSchema, required: true },
    generated_by: { type: String, required: true, default: 'gpt-oss:120B' },
    created_at: { type: Date, required: true, default: Date.now }
  },
  {
    collection: 'daily_horoscopes'
  }
);

// Unique compound index: one horoscope per zodiac sign per day
DailyHoroscopeSchema.index({ zodiac_sign: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyHoroscope', DailyHoroscopeSchema);

