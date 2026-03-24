const Conversation = require('../models/Conversation');
const { pick } = require('../middleware/pick');

const createConversation = async (req, res) => {
  const payload = pick(req.body, ['user_id', 'title']);

  if (!req.user || !req.user.userId) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  if (req.user.role !== 'admin') {
    payload.user_id = req.user.userId;
  } else if (!payload.user_id) {
    res.status(400);
    throw new Error('user_id is required');
  }
  const created = await Conversation.create(payload);
  res.status(201).json(created);
};

const listConversations = async (req, res) => {
  const filter = {};

  if (!req.user || !req.user.userId) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  if (req.user.role !== 'admin') {
    filter.user_id = req.user.userId;
  } else if (req.query.user_id) {
    filter.user_id = req.query.user_id;
  }

  const conversations = await Conversation.find(filter).sort({ created_at: -1 });
  res.json(conversations);
};

const getConversationById = async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    res.status(404);
    return next(new Error('Conversation not found'));
  }

  if (req.user.role !== 'admin' && conversation.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }
  return res.json(conversation);
};

const updateConversation = async (req, res, next) => {
  const payload = pick(req.body, ['title']);

  const existing = await Conversation.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Conversation not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const updated = await Conversation.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    res.status(404);
    return next(new Error('Conversation not found'));
  }

  return res.json(updated);
};

const deleteConversation = async (req, res, next) => {
  const existing = await Conversation.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Conversation not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const deleted = await Conversation.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    return next(new Error('Conversation not found'));
  }
  return res.status(204).send();
};

module.exports = {
  createConversation,
  listConversations,
  getConversationById,
  updateConversation,
  deleteConversation
};
