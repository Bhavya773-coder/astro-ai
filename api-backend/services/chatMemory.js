const Message = require('../models/Message');

/**
 * Chat Memory Service
 * Manages conversation history and context window
 */
class ChatMemory {
  constructor() {
    // Maximum messages to keep in context window
    this.maxContextMessages = 10;
    // Maximum characters per message (truncation threshold)
    this.maxMessageLength = 2000;
  }

  /**
   * Get conversation history for a chat
   * @param {string} chatId - The chat/conversation ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of messages
   */
  async getHistory(chatId, options = {}) {
    const { limit = this.maxContextMessages, before = null } = options;
    
    const query = { 
      conversation_id: chatId 
    };
    
    if (before) {
      query.created_at = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ created_at: 1 })
      .limit(limit)
      .lean();

    return messages.map(msg => ({
      _id: msg._id.toString(),
      role: msg.role,
      content: this._truncateContent(msg.content),
      created_at: msg.created_at,
      timestamp: msg.created_at
    }));
  }

  /**
   * Get extended history for display (not for AI context)
   * @param {string} chatId - The chat ID
   * @param {number} limit - Number of messages to fetch
   * @returns {Promise<Array>} - Array of messages
   */
  async getFullHistory(chatId, limit = 50) {
    const messages = await Message.find({ conversation_id: chatId })
      .sort({ created_at: 1 })
      .limit(limit)
      .lean();

    return messages.map(msg => ({
      _id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at,
      ai_analysis_tags: msg.ai_analysis_tags || []
    }));
  }

  /**
   * Save a message to the database
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} - Saved message
   */
  async saveMessage(messageData) {
    const { chatId, userId, role, content, tags = [] } = messageData;
    
    const message = new Message({
      chat_id: chatId,        // Required by schema
      conversation_id: chatId, // For backward compatibility
      user_id: userId,
      role: role,
      content: content,
      ai_analysis_tags: tags,
      created_at: new Date()
    });

    await message.save();
    
    return {
      _id: message._id.toString(),
      role: message.role,
      content: message.content,
      created_at: message.created_at
    };
  }

  /**
   * Get context window for AI (limited messages)
   * @param {string} chatId - The chat ID
   * @returns {Promise<Array>} - Recent messages for context
   */
  async getContextWindow(chatId) {
    return this.getHistory(chatId, { limit: this.maxContextMessages });
  }

  /**
   * Clear all messages for a chat
   * @param {string} chatId - The chat ID
   */
  async clearHistory(chatId) {
    await Message.deleteMany({ conversation_id: chatId });
  }

  /**
   * Get message count for a chat
   * @param {string} chatId - The chat ID
   * @returns {Promise<number>} - Message count
   */
  async getMessageCount(chatId) {
    return await Message.countDocuments({ conversation_id: chatId });
  }

  /**
   * Build AI-ready conversation context
   * Formats messages for the AI service
   * @param {Array} messages - Chat messages
   * @returns {Array} - Formatted messages for AI
   */
  buildAIContext(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Truncate long messages to prevent token overflow
   * @param {string} content - Message content
   * @returns {string} - Truncated content
   */
  _truncateContent(content) {
    if (!content || content.length <= this.maxMessageLength) {
      return content;
    }
    
    return content.substring(0, this.maxMessageLength) + '...';
  }

  /**
   * Format messages for display
   * @param {Array} messages - Raw messages
   * @returns {Array} - Formatted messages
   */
  formatForDisplay(messages) {
    return messages.map(msg => ({
      id: msg._id?.toString(),
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      formattedTime: new Date(msg.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }
}

module.exports = new ChatMemory();
