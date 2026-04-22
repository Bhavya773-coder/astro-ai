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
  generated_image_url: {
    type: String,
    default: null
  },
  generated_image_base64: {
    type: String,
    default: null
  },
  colors: {
    type: [String],
    default: []
  },
  color_names: {
    type: [String],
    default: []
  },
  image_prompt_used: {
    type: String,
    default: ''
  },
  // Interactive state tracking
  selected_context: {
    type: String,
    default: 'Casual'
  },
  selected_modifier: {
    type: String,
    default: 'Standard'
  },
  vibe_selection: {
    type: String, // 'optionA' or 'optionB'
    default: null
  },
  outfit_score: {
    style: { type: Number, default: 85 },
    confidence: { type: Number, default: 90 },
    attention: { type: Number, default: 75 }
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
