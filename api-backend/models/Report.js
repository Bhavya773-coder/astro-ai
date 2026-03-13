const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  report_type: {
    type: String,
    required: true,
    enum: ['birth_chart', 'horoscope', 'numerology', 'compatibility', 'insights']
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Can store any type of data
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  generated_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'generated_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
reportSchema.index({ user_id: 1, report_type: 1 });

module.exports = mongoose.model('Report', reportSchema);
