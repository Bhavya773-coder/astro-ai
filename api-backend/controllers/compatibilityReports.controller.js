const CompatibilityReport = require('../models/CompatibilityReport');
const { pick } = require('../middleware/pick');

const createCompatibilityReport = async (req, res) => {
  const payload = pick(req.body, [
    'user_id',
    'partner_profile',
    'compatibility_score',
    'analysis'
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

  const created = await CompatibilityReport.create(payload);
  res.status(201).json(created);
};

const listCompatibilityReports = async (req, res) => {
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

  const docs = await CompatibilityReport.find(filter).sort({ created_at: -1 });
  res.json(docs);
};

const getCompatibilityReportById = async (req, res, next) => {
  const doc = await CompatibilityReport.findById(req.params.id);
  if (!doc) {
    res.status(404);
    return next(new Error('Compatibility report not found'));
  }

  if (req.user.role !== 'admin' && doc.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }
  return res.json(doc);
};

const updateCompatibilityReport = async (req, res, next) => {
  const payload = pick(req.body, [
    'partner_profile',
    'compatibility_score',
    'analysis'
  ]);

  const existing = await CompatibilityReport.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Compatibility report not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const updated = await CompatibilityReport.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    res.status(404);
    return next(new Error('Compatibility report not found'));
  }

  return res.json(updated);
};

const deleteCompatibilityReport = async (req, res, next) => {
  const existing = await CompatibilityReport.findById(req.params.id);
  if (!existing) {
    res.status(404);
    return next(new Error('Compatibility report not found'));
  }

  if (req.user.role !== 'admin' && existing.user_id.toString() !== req.user.userId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const deleted = await CompatibilityReport.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    return next(new Error('Compatibility report not found'));
  }
  return res.status(204).send();
};

module.exports = {
  createCompatibilityReport,
  listCompatibilityReports,
  getCompatibilityReportById,
  updateCompatibilityReport,
  deleteCompatibilityReport
};
