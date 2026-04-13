const mongoose = require('mongoose');
const crypto = require('crypto');

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
  // Share functionality fields
  is_public: {
    type: Boolean,
    default: false
  },
  share_id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
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

// Method to generate unique share ID
chatSchema.methods.generateShareId = function() {
  this.share_id = crypto.randomBytes(16).toString('hex');
  this.is_public = true;
  return this.share_id;
};

module.exports = mongoose.model('Chat', chatSchema);
