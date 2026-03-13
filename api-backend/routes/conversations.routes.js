const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const {
  createConversation,
  listConversations,
  getConversationById,
  updateConversation,
  deleteConversation
} = require('../controllers/conversations.controller');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(listConversations));
router.post('/', requireAuth, asyncHandler(createConversation));
router.get('/:id', requireAuth, validateObjectId('id'), asyncHandler(getConversationById));
router.patch('/:id', requireAuth, validateObjectId('id'), asyncHandler(updateConversation));
router.delete('/:id', requireAuth, validateObjectId('id'), asyncHandler(deleteConversation));

module.exports = router;
