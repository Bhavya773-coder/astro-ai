const GrowthMetric = require('../models/GrowthMetric');
const { pick } = require('../middleware/pick');

const upsertGrowthMetric = async (req, res) => {
  const payload = pick(req.body, [
    'user_id',
    'emotional_score',
    'dominant_theme',
    'risk_level',
    'monthly_progress_score'
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

  const doc = await GrowthMetric.findOneAndUpdate(
    { user_id: payload.user_id },
    payload,
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(doc);
};

const listGrowthMetrics = async (req, res) => {
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

  const docs = await GrowthMetric.find(filter).sort({ updated_at: -1 });
  res.json(docs);
};

const getGrowthMetricById = async (req, res, next) => {
  const doc = await GrowthMetric.findById(req.params.id);
  if (!doc) {
    res.status(404);
    return next(new Error('Growth metric not found'));
  }

  if (req.user.role !== 'admin' && doc.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }
  return res.json(doc);
};

const updateGrowthMetric = async (req, res, next) => {
  const payload = pick(req.body, [
    'emotional_score',
    'dominant_theme',
    'risk_level',
    'monthly_progress_score'
  ]);

  const existing = await GrowthMetric.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Growth metric not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const updated = await GrowthMetric.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    res.status(404);
    return next(new Error('Growth metric not found'));
  }

  return res.json(updated);
};

const deleteGrowthMetric = async (req, res, next) => {
  const existing = await GrowthMetric.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Growth metric not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const deleted = await GrowthMetric.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    return next(new Error('Growth metric not found'));
  }
  return res.status(204).send();
};

module.exports = {
  upsertGrowthMetric,
  listGrowthMetrics,
  getGrowthMetricById,
  updateGrowthMetric,
  deleteGrowthMetric
};
