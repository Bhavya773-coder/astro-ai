const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  // Keep conversation_id for backward compatibility during migration
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  ai_analysis_tags: {
    type: [String],
    default: []
  },
  // Model used for AI responses
  model: {
    type: String,
    default: 'llama3:latest'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We use our own created_at field
  collection: 'messages'
});

messageSchema.index({ chat_id: 1, created_at: 1 });
messageSchema.index({ conversation_id: 1, created_at: 1 });
messageSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Message', messageSchema);
