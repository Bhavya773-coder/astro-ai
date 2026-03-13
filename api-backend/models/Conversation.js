const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation',
    maxlength: 100
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We use our own created_at and updated_at fields
  collection: 'conversations'
});

// Index for faster queries
conversationSchema.index({ user_id: 1, updated_at: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
