const mongoose = require('mongoose');
const crypto = require('crypto');

const sharedChatResponseSchema = new mongoose.Schema({
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
    default: 'Anonymous'
  },
  question: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  context: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Generate unique share ID before saving
sharedChatResponseSchema.pre('save', function(next) {
  if (!this.share_id) {
    this.share_id = crypto.randomBytes(16).toString('hex');
  }
  next();
});

// Index for querying by user_id and recreation order
sharedChatResponseSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('SharedChatResponse', sharedChatResponseSchema);
