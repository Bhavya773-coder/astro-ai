const mongoose = require('mongoose');
const crypto = require('crypto');

const sharedInsightSchema = new mongoose.Schema({
  share_id: {
    type: String,
    unique: true,
    index: true
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
    enum: ['horoscope', 'numerology'],
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
