const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const User = require('../models/User');
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

      // Get user and profile for astrology context
      const [user, profile] = await Promise.all([
        User.findById(userObjectId).lean(),
        Profile.findOne({ user_id: userObjectId }).lean()
      ]);
      console.log('[AIChatController] User found:', !!user, 'Profile found:', !!profile);
      console.log('[AIChatController] User isBeliever:', user?.is_believer);

      // Build system prompt with kundli context
      const systemPrompt = await contextBuilder.buildSystemPrompt(profile);

      // Get conversation history
      const history = await chatMemory.getContextWindow(chatId);
      console.log('[AIChatController] History length:', history.length);

      // Build messages array for AI with kundli context and user belief type
      const messages = await contextBuilder.buildMessagesArray(
        systemPrompt,
        history,
        message.trim(),
        profile,
        user
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

      // Get user and profile and build context
      const [user, profile] = await Promise.all([
        User.findById(userObjectId).lean(),
        Profile.findOne({ user_id: userObjectId }).lean()
      ]);
      const systemPrompt = await contextBuilder.buildSystemPrompt(profile);
      const history = await chatMemory.getContextWindow(chatId);
      const messages = contextBuilder.buildMessagesArray(
        systemPrompt,
        history,
        message.trim(),
        profile,
        user
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
   * Search chats by title
   */
  searchChats = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { query } = req.query;

      if (!query || query.trim() === '') {
        // Return all chats if no query
        const chats = await Chat.find({ user_id: userObjectId })
          .sort({ updated_at: -1 })
          .lean();
        
        return res.json({
          success: true,
          data: chats
        });
      }

      // Search chats by title (case-insensitive)
      const chats = await Chat.find({
        user_id: userObjectId,
        title: { $regex: query.trim(), $options: 'i' }
      })
        .sort({ updated_at: -1 })
        .lean();

      res.json({
        success: true,
        data: chats
      });
    } catch (error) {
      console.error('[AIChatController] Error searching chats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search chats'
      });
    }
  }

  /**
   * Generate chat title using AI based on first message
   */
  generateChatTitle = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId, message } = req.body;

      if (!chatId || !message) {
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

      // Only generate title if it's still "New Chat" or default
      if (chat.title && chat.title !== 'New Chat' && !chat.title.startsWith('Chat ')) {
        return res.json({
          success: true,
          data: { title: chat.title },
          message: 'Chat already has a custom title'
        });
      }

      // Generate title using AI
      const titlePrompt = `Based on this user's first message, generate a short, descriptive chat title (2-4 words max). Be concise and relevant.

User message: "${message.substring(0, 200)}"

Rules:
- 2-4 words maximum
- No quotes in the title
- Should summarize the main topic
- Examples: "Career Guidance", "Love Life Reading", "Birth Chart Help"

Return only the title, nothing else.`;

      const messages = [
        { role: 'system', content: 'You are a helpful assistant that generates concise chat titles.' },
        { role: 'user', content: titlePrompt }
      ];

      let generatedTitle = 'New Chat';
      try {
        const aiResponse = await aiService.generateCompletion(messages);
        generatedTitle = aiResponse.trim().replace(/["']/g, '').substring(0, 50);
        if (!generatedTitle || generatedTitle.length < 2) {
          generatedTitle = message.substring(0, 30).trim() || 'New Chat';
        }
      } catch (aiError) {
        console.error('[AIChatController] AI title generation failed:', aiError);
        // Fallback: use first 30 chars of message
        generatedTitle = message.substring(0, 30).trim() || 'New Chat';
      }

      // Update chat with generated title
      chat.title = generatedTitle;
      await chat.save();

      res.json({
        success: true,
        data: { title: generatedTitle }
      });

    } catch (error) {
      console.error('[AIChatController] Error generating chat title:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate chat title'
      });
    }
  }

  /**
   * Share a chat - make it public and return share link
   */
  shareChat = async (req, res) => {
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

      // Generate share ID if not already shared
      if (!chat.share_id) {
        chat.generateShareId();
        await chat.save();
      } else {
        chat.is_public = true;
        await chat.save();
      }

      // Use FRONTEND_BASE_URL from env, or fallback to production domain or localhost
      const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || 'https://astroai4u.com';
      const shareUrl = `${frontendUrl}/shared-chat/${chat.share_id}`;

      res.json({
        success: true,
        data: {
          shareId: chat.share_id,
          shareUrl: shareUrl,
          isPublic: chat.is_public
        }
      });

    } catch (error) {
      console.error('[AIChatController] Error sharing chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share chat'
      });
    }
  }

  /**
   * Unshare a chat - make it private
   */
  unshareChat = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { chatId } = req.params;

      const chat = await Chat.findOneAndUpdate(
        { _id: chatId, user_id: userObjectId },
        { is_public: false },
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
        data: { isPublic: false }
      });

    } catch (error) {
      console.error('[AIChatController] Error unsharing chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unshare chat'
      });
    }
  }

  /**
   * Get shared chat (public access - no auth required)
   */
  getSharedChat = async (req, res) => {
    try {
      const { shareId } = req.params;

      const chat = await Chat.findOne({
        share_id: shareId,
        is_public: true
      }).lean();

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Shared chat not found or is private'
        });
      }

      // Get all messages for this chat
      const messages = await chatMemory.getFullHistory(chat._id, 1000);

      // Remove sensitive user info
      const safeChat = {
        _id: chat._id,
        title: chat.title,
        preview: chat.preview,
        message_count: chat.message_count,
        created_at: chat.created_at,
        updated_at: chat.updated_at
      };

      res.json({
        success: true,
        data: {
          chat: safeChat,
          messages: messages
        }
      });

    } catch (error) {
      console.error('[AIChatController] Error getting shared chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared chat'
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
