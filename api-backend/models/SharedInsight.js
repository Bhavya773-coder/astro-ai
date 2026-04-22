const mongoose = require('mongoose');
const crypto = require('crypto');

const sharedInsightSchema = new mongoose.Schema({
  share_id: {
    type: String,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  user_name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['horoscope', 'numerology', 'face', 'coffee', 'palm', 'style'],
    required: true
  },
  // For horoscope
  zodiac: {
    type: String
  },
  horoscope_data: {
    date: String,
    horoscope: String,
    insights: String,
    reason: String,
    actions: String
  },
  // For numerology
  numerology_data: {
    life_path: String,
    destiny: String,
    personal_year: String
  },
  // For face reading
  face_reading_data: {
    face_shape: String,
    element_type: String,
    overall_aura: String,
    forehead_reading: String,
    eyes_reading: String,
    nose_reading: String,
    mouth_reading: String,
    chin_reading: String,
    dominant_strength: String,
    hidden_trait: String,
    life_purpose_hint: String,
    compatible_with: String,
    personality_scores: {
      leadership: Number,
      creativity: Number,
      empathy: Number,
      ambition: Number,
      spirituality: Number
    },
    special_marking: String
  },
  // For coffee reading
  coffee_reading_data: {
    cup_overview: String,
    symbols_identified: [{
      symbol: String,
      position: String,
      meaning: String
    }],
    love_fortune: String,
    career_fortune: String,
    health_fortune: String,
    travel_fortune: String,
    warning: String,
    overall_fortune: String,
    lucky_number: Number,
    time_frame: String,
    special_message: String
  },
  // For style
  style_data: {
    headline: String,
    outfit_description: String,
    colors: [String],
    color_names: [String],
    astrological_reason: String,
    selected_context: String,
    selected_modifier: String,
    image_base64: String
  },
  // For palm reading
  palm_reading_data: {
    hand_type: String,
    overall_summary: String,
    life_line: String,
    heart_line: String,
    head_line: String,
    fate_line: String,
    sun_line: String,
    mount_of_venus: String,
    vitality_score: Number,
    love_score: Number,
    career_score: Number,
    lucky_color: String,
    lucky_number: Number,
    key_prediction: String
  },
  is_public: {
    type: Boolean,
    default: true
  },
  view_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  image_url: {
    type: String
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
  }
});

// Generate unique share ID
sharedInsightSchema.pre('save', function(next) {
  if (!this.share_id) {
    this.share_id = crypto.randomBytes(16).toString('hex');
  }
  next();
});

// Index for expiration cleanup
sharedInsightSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SharedInsight', sharedInsightSchema);
