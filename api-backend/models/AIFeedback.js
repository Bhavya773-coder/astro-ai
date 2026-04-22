const mongoose = require('mongoose');

const aiFeedbackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  insight_type: {
    type: String,
    enum: ['horoscope', 'focus_action', 'daily_prediction'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  rating: {
    type: String,
    enum: ['accurate', 'not_me'],
    required: true
  },
  zodiac: {
    type: String
  },
  focus: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for context building fetch
aiFeedbackSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('AIFeedback', aiFeedbackSchema);
