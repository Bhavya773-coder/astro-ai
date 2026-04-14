const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedbackSchema = new mongoose.Schema({
  feedback_id: {
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
  user_email: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    default: 'Anonymous'
  },
  // Overall app rating (1-5 stars)
  overall_rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Feature-specific ratings
  feature_ratings: {
    horoscope: { type: Number, min: 1, max: 5, default: null },
    numerology: { type: Number, min: 1, max: 5, default: null },
    chat: { type: Number, min: 1, max: 5, default: null },
    dressing_styler: { type: Number, min: 1, max: 5, default: null },
    birth_chart: { type: Number, min: 1, max: 5, default: null }
  },
  // General feedback questions
  ease_of_use: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  design_rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  would_recommend: {
    type: Boolean,
    default: null
  },
  // Favorite feature
  favorite_feature: {
    type: String,
    enum: ['horoscope', 'numerology', 'chat', 'dressing_styler', 'birth_chart', 'other', null],
    default: null
  },
  // Text feedback
  what_you_loved: {
    type: String,
    maxlength: 1000
  },
  what_to_improve: {
    type: String,
    maxlength: 1000
  },
  additional_comments: {
    type: String,
    maxlength: 2000
  },
  // Metadata
  submitted_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'submitted_at', updatedAt: 'updated_at' }
});

// Generate unique feedback ID before saving
feedbackSchema.pre('save', function(next) {
  if (!this.feedback_id) {
    this.feedback_id = uuidv4().replace(/-/g, '').substring(0, 16);
  }
  next();
});

// Index for querying by user
feedbackSchema.index({ user_id: 1, submitted_at: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
