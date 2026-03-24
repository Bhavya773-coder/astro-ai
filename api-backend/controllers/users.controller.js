const User = require('../models/User');
const { pick } = require('../middleware/pick');

const createUser = async (req, res) => {
  const payload = pick(req.body, [
    'email',
    'password_hash',
    'role',
    'subscription_plan',
    'subscription_status'
  ]);

  const created = await User.create(payload);
  res.status(201).json(created);
};

const listUsers = async (req, res) => {
  const users = await User.find({}).sort({ created_at: -1 });
  res.json(users);
};

const getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    return next(new Error('User not found'));
  }
  return res.json(user);
};

const updateUser = async (req, res, next) => {
  const payload = pick(req.body, [
    'email',
    'password_hash',
    'role',
    'subscription_plan',
    'subscription_status'
  ]);

  const updated = await User.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    res.status(404);
    return next(new Error('User not found'));
  }

  return res.json(updated);
};

const deleteUser = async (req, res, next) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    return next(new Error('User not found'));
  }
  return res.status(204).send();
};

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };
