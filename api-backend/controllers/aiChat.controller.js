const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const contextBuilder = require('../services/contextBuilder');
const chatMemory = require('../services/chatMemory');

// Helper function to convert string ID to ObjectId (outside class to avoid binding issues)
const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * AI Chat Controller
 * Unified chat system with astrology context integration
 */
class AIChatController {
  
  /**
   * Get all chats for the authenticated user
   */
  getChats = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      
      console.log('[AIChatController] Getting chats for user:', userId);

      const chats = await Chat.find({ user_id: userObjectId })
        .sort({ updated_at: -1 })
        .lean();

      console.log(`[AIChatController] Found ${chats.length} chats`);

      res.json({
        success: true,
        data: chats
      });
    } catch (error) {
      console.error('[AIChatController] Error getting chats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chats'
      });
    }
  }

  /**
   * Create a new chat
   */
  createChat = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { title = 'New Chat' } = req.body;
      
      console.log('[AIChatController] Creating chat for user:', userId);

      const chat = new Chat({
        user_id: userObjectId,
        title: title.substring(0, 100),
        created_at: new Date(),
        updated_at: new Date()
      });

      await chat.save();

      console.log('[AIChatController] Created chat:', chat._id);

      res.status(201).json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('[AIChatController] Error creating chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create chat'
      });
    }
  }

  /**
   * Get a specific chat by ID
   */
  getChat = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId } = req.params;

      const chat = await Chat.findOne({
        _id: chatId,
        user_id: userObjectId
      }).lean();

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('[AIChatController] Error getting chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat'
      });
    }
  }

  /**
   * Get messages for a specific chat
   */
  getMessages = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId } = req.params;

      // Verify chat belongs to user
      const chat = await Chat.findOne({
        _id: chatId,
        user_id: userObjectId
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      const messages = await chatMemory.getFullHistory(chatId, 100);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('[AIChatController] Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get messages'
      });
    }
  }

  /**
   * Send a message and get AI response
   */
  sendMessage = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId, message } = req.body;

      console.log('[AIChatController] Sending message:', {
        userId,
        chatId,
        messageLength: message?.length
      });

      if (!chatId || !message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Chat ID and message are required'
        });
      }

      // Verify chat belongs to user
      const chat = await Chat.findOne({
        _id: chatId,
        user_id: userObjectId
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      // Save user message
      const userMessage = await chatMemory.saveMessage({
        chatId,
        userId: userObjectId,
        role: 'user',
        content: message.trim()
      });

      console.log('[AIChatController] Saved user message:', userMessage._id);

      // Update chat preview and timestamp
      if (!chat.preview) {
        chat.preview = message.trim().substring(0, 100);
        await chat.save();
      }

      // Get user profile for astrology context
      const profile = await Profile.findOne({ user_id: userObjectId }).lean();
      console.log('[AIChatController] Profile found:', !!profile);

      // Build system prompt with kundli context
      const systemPrompt = await contextBuilder.buildSystemPrompt(profile);

      // Get conversation history
      const history = await chatMemory.getContextWindow(chatId);
      console.log('[AIChatController] History length:', history.length);

      // Build messages array for AI with kundli context
      const messages = await contextBuilder.buildMessagesArray(
        systemPrompt,
        history,
        message.trim(),
        profile
      );

      // Generate AI response
      console.log('[AIChatController] Calling AI service...');
      const aiContent = await aiService.generateCompletion(messages);

      console.log('[AIChatController] AI response received, length:', aiContent.length);

      // Save AI response
      const aiMessage = await chatMemory.saveMessage({
        chatId,
        userId: userObjectId,
        role: 'assistant',
        content: aiContent,
        tags: ['astrology', 'ai-response']
      });

      // Update chat message count
      chat.message_count = await chatMemory.getMessageCount(chatId);
      await chat.save();

      res.json({
        success: true,
        data: {
          userMessage,
          aiMessage,
          chat: {
            _id: chat._id,
            title: chat.title,
            message_count: chat.message_count,
            updated_at: chat.updated_at
          }
        }
      });

    } catch (error) {
      console.error('[AIChatController] Error sending message:', error);
      
      // Handle specific error types
      if (error.code === 'SERVICE_UNAVAILABLE') {
        return res.status(503).json({
          success: false,
          message: 'AI service is not available. Please ensure Ollama is running.'
        });
      }
      
      if (error.code === 'TIMEOUT') {
        return res.status(504).json({
          success: false,
          message: 'AI response timed out. Please try again.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  /**
   * Streaming message endpoint
   */
  sendMessageStream = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId, message } = req.body;

      console.log('[AIChatController] Streaming message:', {
        userId,
        chatId,
        messageLength: message?.length
      });

      if (!chatId || !message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Chat ID and message are required'
        });
      }

      // Verify chat belongs to user
      const chat = await Chat.findOne({
        _id: chatId,
        user_id: userObjectId
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // Save user message
      const userMessage = await chatMemory.saveMessage({
        chatId,
        userId: userObjectId,
        role: 'user',
        content: message.trim()
      });

      // Update chat preview
      if (!chat.preview) {
        chat.preview = message.trim().substring(0, 100);
      }

      // Get profile and build context
      const profile = await Profile.findOne({ user_id: userObjectId }).lean();
      const systemPrompt = await contextBuilder.buildSystemPrompt(profile);
      const history = await chatMemory.getContextWindow(chatId);
      const messages = contextBuilder.buildMessagesArray(
        systemPrompt,
        history,
        message.trim(),
        profile
      );

      let fullResponse = '';
      const messageId = new mongoose.Types.ObjectId();

      // Stream callback
      const onToken = ({ token, fullResponse: currentResponse, done }) => {
        fullResponse = currentResponse;
        
        const eventData = {
          type: 'token',
          token,
          messageId: messageId.toString()
        };
        
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);

        if (done) {
          // Save final response
          const aiMessage = new Message({
            _id: messageId,
            chat_id: chatId,
            user_id: userObjectId,
            role: 'assistant',
            content: fullResponse,
            ai_analysis_tags: ['astrology', 'ai-response', 'streamed'],
            created_at: new Date()
          });

          aiMessage.save().then(() => {
            // Update chat
            chat.message_count = chat.message_count + 2; // user + assistant
            chat.save();

            // Send completion event
            res.write(`data: ${JSON.stringify({
              type: 'complete',
              messageId: messageId.toString(),
              content: fullResponse
            })}\n\n`);
            res.end();
          }).catch(err => {
            console.error('[AIChatController] Error saving streamed message:', err);
            res.write(`data: ${JSON.stringify({
              type: 'error',
              error: 'Failed to save message'
            })}\n\n`);
            res.end();
          });
        }
      };

      // Generate streaming response
      await aiService.generateCompletion(messages, {
        stream: true,
        onToken
      });

    } catch (error) {
      console.error('[AIChatController] Streaming error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Streaming failed'
        });
      } else {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: error.message
        })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * Delete a chat and all its messages
   */
  deleteChat = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId } = req.params;

      // Verify chat belongs to user
      const chat = await Chat.findOne({
        _id: chatId,
        user_id: userObjectId
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      // Delete all messages
      await Message.deleteMany({ chat_id: chatId });

      // Delete chat
      await Chat.findByIdAndDelete(chatId);

      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });
    } catch (error) {
      console.error('[AIChatController] Error deleting chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chat'
      });
    }
  }

  /**
   * Update chat title
   */
  updateChat = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId } = req.params;
      const { title } = req.body;

      const chat = await Chat.findOneAndUpdate(
        { _id: chatId, user_id: userObjectId },
        { 
          title: title?.substring(0, 100),
          updated_at: new Date()
        },
        { new: true }
      );

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('[AIChatController] Error updating chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update chat'
      });
    }
  }

  /**
   * Helper: Convert string ID to ObjectId
   * @deprecated Use the module-level toObjectId function instead
   */
  _toObjectId(id) {
    return toObjectId(id);
  }
}

module.exports = new AIChatController();
