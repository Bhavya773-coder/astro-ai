const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth');

// All chat routes require authentication
router.use(requireAuth);

// Get all conversations for the authenticated user
router.get('/conversations', chatController.getConversations);

// Create a new conversation
router.post('/conversations', chatController.createConversation);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', chatController.getMessages);

// Send a message in a conversation
router.post('/message', chatController.sendMessage);

// Delete a conversation
router.delete('/conversations/:conversationId', chatController.deleteConversation);

// Get a specific conversation
router.get('/conversations/:conversationId', chatController.getConversation);

module.exports = router;
