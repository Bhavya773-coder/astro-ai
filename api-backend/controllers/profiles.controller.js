const Profile = require('../models/Profile');
const { pick } = require('../middleware/pick');

const createProfile = async (req, res) => {
  const payload = pick(req.body, [
    'user_id',
    'full_name',
    'date_of_birth',
    'time_of_birth',
    'place_of_birth',
    'gender',
    'birth_chart_data',
    'numerology_data'
  ]);

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

  const created = await Profile.create(payload);
  res.status(201).json(created);
};

const listProfiles = async (req, res) => {
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

  const profiles = await Profile.find(filter).sort({ created_at: -1 });
  res.json(profiles);
};

const getProfileById = async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);
  if (!profile) {
    res.status(404);
    return next(new Error('Profile not found'));
  }

  if (req.user.role !== 'admin' && profile.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }
  return res.json(profile);
};

const updateProfile = async (req, res, next) => {
  const payload = pick(req.body, [
    'full_name',
    'date_of_birth',
    'time_of_birth',
    'place_of_birth',
    'gender',
    'birth_chart_data',
    'numerology_data'
  ]);

  const existing = await Profile.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Profile not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const updated = await Profile.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    res.status(404);
    return next(new Error('Profile not found'));
  }

  return res.json(updated);
};

const deleteProfile = async (req, res, next) => {
  const existing = await Profile.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Profile not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const deleted = await Profile.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    return next(new Error('Profile not found'));
  }
  return res.status(204).send();
};

module.exports = { createProfile, listProfiles, getProfileById, updateProfile, deleteProfile };
