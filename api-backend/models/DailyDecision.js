const mongoose = require('mongoose');

const dailyDecisionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  zodiac: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness per user per day
dailyDecisionSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyDecision', dailyDecisionSchema);
