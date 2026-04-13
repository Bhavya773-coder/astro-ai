const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const aiChatController = require('../controllers/aiChat.controller');

// Rate limiting - 30 requests per minute per user
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { 
    success: false, 
    message: 'Too many messages. Please wait a moment.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public route - get shared chat (must be before auth middleware)
/**
 * @route   GET /api/chat/shared/:shareId
 * @desc    Get shared chat (public access)
 * @access  Public
 */
router.get('/shared/:shareId', aiChatController.getSharedChat);

// All other chat routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/chat/list
 * @desc    Get all chats for the user
 * @access  Private
 */
router.get('/list', aiChatController.getChats);

/**
 * @route   POST /api/chat/create
 * @desc    Create a new chat
 * @access  Private
 */
router.post('/create', aiChatController.createChat);

/**
 * @route   GET /api/chat/search
 * @desc    Search chats by title
 * @access  Private
 */
router.get('/search', aiChatController.searchChats);

/**
 * @route   POST /api/chat/generate-title
 * @desc    Generate chat title using AI based on first message
 * @access  Private
 */
router.post('/generate-title', aiChatController.generateChatTitle);

/**
 * @route   GET /api/chat/:chatId
 * @desc    Get a specific chat
 * @access  Private
 */
router.get('/:chatId', aiChatController.getChat);

/**
 * @route   GET /api/chat/:chatId/messages
 * @desc    Get messages for a chat
 * @access  Private
 */
router.get('/:chatId/messages', aiChatController.getMessages);

/**
 * @route   POST /api/chat/send
 * @desc    Send a message (non-streaming)
 * @access  Private
 */
router.post('/send', chatLimiter, aiChatController.sendMessage);

/**
 * @route   POST /api/chat/send-stream
 * @desc    Send a message with streaming response
 * @access  Private
 */
router.post('/send-stream', chatLimiter, aiChatController.sendMessageStream);

/**
 * @route   PUT /api/chat/:chatId
 * @desc    Update chat (title, etc.)
 * @access  Private
 */
router.put('/:chatId', aiChatController.updateChat);

/**
 * @route   DELETE /api/chat/:chatId
 * @desc    Delete a chat and all messages
 * @access  Private
 */
router.delete('/:chatId', aiChatController.deleteChat);

/**
 * @route   POST /api/chat/:chatId/share
 * @desc    Share a chat - make it public
 * @access  Private
 */
router.post('/:chatId/share', aiChatController.shareChat);

/**
 * @route   POST /api/chat/:chatId/unshare
 * @desc    Unshare a chat - make it private
 * @access  Private
 */
router.post('/:chatId/unshare', aiChatController.unshareChat);

module.exports = router;
