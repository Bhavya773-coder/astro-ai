const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat',
    maxlength: 100
  },
  // First message preview for sidebar display
  preview: {
    type: String,
    default: ''
  },
  // Message count for quick reference
  message_count: {
    type: Number,
    default: 0
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
  timestamps: false,
  collection: 'chats'
});

// Indexes for faster queries
chatSchema.index({ user_id: 1, updated_at: -1 });
chatSchema.index({ user_id: 1, created_at: -1 });

// Pre-save middleware to update the updated_at timestamp
chatSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
