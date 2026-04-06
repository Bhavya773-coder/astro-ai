const mongoose = require('mongoose');

const dressingSuggestionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  headline: {
    type: String,
    default: ''
  },
  overview: {
    type: String,
    default: ''
  },
  color_palette: {
    type: String,
    default: ''
  },
  outfit_top: {
    type: String,
    default: ''
  },
  outfit_bottom: {
    type: String,
    default: ''
  },
  outfit_footwear: {
    type: String,
    default: ''
  },
  accessories: {
    type: String,
    default: ''
  },
  jewelry: {
    type: String,
    default: ''
  },
  makeup_grooming: {
    type: String,
    default: ''
  },
  lucky_item: {
    type: String,
    default: ''
  },
  astrological_reason: {
    type: String,
    default: ''
  },
  mood_energy: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Compound index to ensure one suggestion per user per day
dressingSuggestionSchema.index({ user_id: 1, date: 1 }, { unique: true });

const DressingSuggestion = mongoose.model('DressingSuggestion', dressingSuggestionSchema);

module.exports = DressingSuggestion;
