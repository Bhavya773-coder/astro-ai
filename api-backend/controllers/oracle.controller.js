const User = require('../models/User');
const OraclePrediction = require('../models/OraclePrediction');
const OracleInputSnapshot = require('../models/OracleInputSnapshot');
const OracleMemory = require('../models/OracleMemory');
const OracleAnalyticsEvent = require('../models/OracleAnalyticsEvent');
const Message = require('../models/Message');
const oracleEngine = require('../services/oracleEngine');
const { recordOutcome, OUTCOMES } = require('../services/oracleOutcomeService');
const { getCalibration, saveSynchronicity } = require('../services/oracleCalibrationService');
const { trackOracleEvent } = require('../services/oracleAnalytics');

const DISCLOSURE_VERSION = 'hope-v2-2026-08';
const DISCLOSURE_TEXT = 'Hope is an adaptive Oracle for predictive entertainment, curiosity, and self-exploration—not factual certainty or professional advice. Hope predicts. Reality happens. You validate. Hope learns.';
const METHODS = new Set(['astrology', 'tarot', 'numerology', 'palm', 'face', 'coffee']);
const PREDICTION_STATUSES = new Set(['open', 'awaiting_outcome', 'confirmed_strong', 'confirmed_partial', 'missed', 'expired_unrated', 'cancelled_due_to_changed_context']);

function validatePredictBody(body = {}) {
  const message = String(body.message || body.question || '').trim();
  const method = String(body.method || 'astrology').trim().toLowerCase();
  if (!message || message.length > 5000) throw new Error('message must contain 1-5000 characters');
  if (!METHODS.has(method)) throw new Error('method is not supported');
  return {
    message,
    method,
    category: body.category,
    horizon: body.horizon,
    methodInputs: body.methodInputs,
    chatId: body.chatId
  };
}

function parsePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function validateFeedPeriod(value) {
  const period = String(value || 'morning').toLowerCase();
  if (!['morning', 'evening'].includes(period)) throw new Error('Feed period must be morning or evening');
  return period;
}

function validateOutcomeBody(body = {}) {
  if (!OUTCOMES[body.choice]) throw new Error('Invalid outcome choice');
  if (body.text !== undefined && (typeof body.text !== 'string' || body.text.length > 2000)) {
    throw new Error('Outcome text must be at most 2000 characters');
  }
  let eventAt;
  if (body.event_at !== undefined) {
    eventAt = new Date(body.event_at);
    if (!Number.isFinite(eventAt.getTime())) throw new Error('Outcome event date is invalid');
  }
  return { choice: body.choice, text: body.text?.trim() || '', eventAt };
}

function sanitizeSettings(body = {}) {
  const output = {};
  for (const key of ['personalized_learning', 'contextual_signals']) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'boolean') throw new Error(`${key} must be a boolean`);
    output[key] = body[key];
  }
  return output;
}

function badRequest(res, error) {
  return res.status(400).json({ success: false, message: error.message });
}

function plain(value) {
  return value?.toObject ? value.toObject() : value;
}

async function acceptedUser(userId) {
  return User.findOne({
    _id: userId,
    'oracle_disclosure.version': DISCLOSURE_VERSION,
    'oracle_disclosure.accepted_at': { $ne: null }
  }).select('_id').lean();
}

async function getDisclosure(req, res) {
  const user = await User.findById(req.user.userId).select('oracle_disclosure').lean();
  const accepted = user?.oracle_disclosure?.version === DISCLOSURE_VERSION && Boolean(user.oracle_disclosure.accepted_at);
  trackOracleEvent({ userId: req.user.userId, event: 'disclosure_viewed' });
  res.json({ success: true, data: { version: DISCLOSURE_VERSION, text: DISCLOSURE_TEXT, accepted, accepted_at: user?.oracle_disclosure?.accepted_at || null } });
}

async function acceptDisclosure(req, res) {
  const acceptedAt = new Date();
  await User.updateOne({ _id: req.user.userId }, {
    $set: { oracle_disclosure: { version: DISCLOSURE_VERSION, accepted_at: acceptedAt } }
  });
  trackOracleEvent({ userId: req.user.userId, event: 'disclosure_accepted', metadata: { version: DISCLOSURE_VERSION } });
  res.json({ success: true, data: { version: DISCLOSURE_VERSION, accepted: true, accepted_at: acceptedAt } });
}

async function predict(req, res) {
  let input;
  try { input = validatePredictBody(req.body); } catch (error) { return badRequest(res, error); }
  if (!await acceptedUser(req.user.userId)) {
    return res.status(428).json({ success: false, code: 'ORACLE_DISCLOSURE_REQUIRED', message: DISCLOSURE_TEXT, version: DISCLOSURE_VERSION });
  }
  const result = await oracleEngine.respond({ userId: req.user.userId, ...input });
  res.json({ success: true, data: { ...result, prediction: plain(result.prediction) } });
}

async function feed(req, res) {
  if (!await acceptedUser(req.user.userId)) {
    return res.status(428).json({ success: false, code: 'ORACLE_DISCLOSURE_REQUIRED', message: DISCLOSURE_TEXT, version: DISCLOSURE_VERSION });
  }
  let period;
  try { period = validateFeedPeriod(req.query.period); } catch (error) { return badRequest(res, error); }
  const date = new Date().toISOString().slice(0, 10);
  const result = await oracleEngine.respond({
    userId: req.user.userId,
    message: `What will matter most in my ${period} on ${date}?`,
    method: 'astrology',
    category: 'general',
    horizon: period,
    responseMode: 'short'
  });
  res.json({ success: true, data: { ...result, prediction: plain(result.prediction) } });
}

async function listPredictions(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  await OraclePrediction.updateMany({
    user_id: req.user.userId,
    status: 'open',
    'prediction_original.valid_until': { $lte: new Date() }
  }, { $set: { status: 'awaiting_outcome' } });
  const filter = { user_id: req.user.userId };
  if (req.query.status) {
    if (!PREDICTION_STATUSES.has(req.query.status)) return res.status(400).json({ success: false, message: 'Invalid prediction status' });
    filter.status = req.query.status;
  }
  const [items, total] = await Promise.all([
    OraclePrediction.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    OraclePrediction.countDocuments(filter)
  ]);
  res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total / limit) } });
}

async function getPrediction(req, res) {
  const prediction = await OraclePrediction.findOne({ user_id: req.user.userId, prediction_id: req.params.id }).lean();
  if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
  res.json({ success: true, data: prediction });
}

async function deletePrediction(req, res) {
  const ownership = { user_id: req.user.userId, prediction_id: req.params.id };
  const prediction = await OraclePrediction.findOne(ownership).lean();
  if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
  await Promise.all([
    OracleInputSnapshot.deleteOne({ user_id: req.user.userId, snapshot_id: prediction.input_snapshot_id }),
    OracleMemory.deleteMany({ user_id: req.user.userId, prediction_id: prediction.prediction_id }),
    OracleAnalyticsEvent.deleteMany({ user_id: req.user.userId, prediction_id: prediction.prediction_id }),
    Message.updateMany({ user_id: req.user.userId, oracle_prediction_id: prediction.prediction_id }, { $unset: { oracle_prediction_id: 1, oracle_metadata: 1 } })
  ]);
  await OraclePrediction.deleteOne(ownership);
  res.json({ success: true });
}

async function submitOutcome(req, res) {
  let input;
  try { input = validateOutcomeBody(req.body); } catch (error) { return badRequest(res, error); }
  const prediction = await recordOutcome({
    userId: req.user.userId,
    predictionId: req.params.id,
    choice: input.choice,
    text: input.text,
    eventAt: input.eventAt
  });
  if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
  trackOracleEvent({ userId: req.user.userId, event: 'outcome_recorded', predictionId: req.params.id, metadata: { choice: input.choice } });
  res.json({ success: true, data: plain(prediction) });
}

async function explainPrediction(req, res) {
  const prediction = await OraclePrediction.findOne({ user_id: req.user.userId, prediction_id: req.params.id }).lean();
  if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
  const factors = [
    ...(prediction.methods || []).map(method => `${method} method`),
    ...(prediction.prediction_original?.signals || [])
  ].slice(0, 5);
  trackOracleEvent({ userId: req.user.userId, event: 'explanation_requested', predictionId: req.params.id });
  res.json({ success: true, data: { factors, note: 'These are concise input factors, not hidden chain-of-thought. The original prediction remains unchanged.' } });
}

async function createSynchronicity(req, res) {
  if (typeof req.body?.text !== 'string' || !req.body.text.trim() || req.body.text.length > 2000) {
    return res.status(400).json({ success: false, message: 'Synchronicity text must contain 1-2000 characters' });
  }
  const memory = await saveSynchronicity({
    userId: req.user.userId,
    predictionId: req.params.id,
    text: req.body?.text,
    explicitSave: req.body?.save === true
  });
  if (!memory) return res.status(409).json({ success: false, message: 'Only explicitly saved strong matches can become Synchronicities' });
  trackOracleEvent({ userId: req.user.userId, event: 'synchronicity_saved', predictionId: req.params.id });
  res.status(201).json({ success: true, data: plain(memory) });
}

async function calibration(req, res) {
  res.json({ success: true, data: await getCalibration(req.user.userId) });
}

async function listMemories(req, res) {
  const items = await OracleMemory.find({ user_id: req.user.userId }).sort({ created_at: -1 }).lean();
  res.json({ success: true, data: items });
}

async function deleteMemory(req, res) {
  const deleted = await OracleMemory.findOneAndDelete({ user_id: req.user.userId, memory_id: req.params.id }).lean();
  if (!deleted) return res.status(404).json({ success: false, message: 'Memory not found' });
  trackOracleEvent({ userId: req.user.userId, event: 'memory_deleted', metadata: { memory_id: req.params.id } });
  res.json({ success: true });
}

async function getSettings(req, res) {
  const user = await User.findById(req.user.userId).select('oracle_preferences').lean();
  res.json({ success: true, data: user?.oracle_preferences || { personalized_learning: true, contextual_signals: true } });
}

async function updateSettings(req, res) {
  let settings;
  try { settings = sanitizeSettings(req.body); } catch (error) { return badRequest(res, error); }
  if (!Object.keys(settings).length) return res.status(400).json({ success: false, message: 'No supported settings supplied' });
  const updates = Object.fromEntries(Object.entries(settings).map(([key, value]) => [`oracle_preferences.${key}`, value]));
  const user = await User.findByIdAndUpdate(req.user.userId, { $set: updates }, { new: true }).select('oracle_preferences').lean();
  trackOracleEvent({ userId: req.user.userId, event: 'oracle_settings_updated', metadata: settings });
  res.json({ success: true, data: user.oracle_preferences });
}

module.exports = {
  DISCLOSURE_VERSION,
  DISCLOSURE_TEXT,
  validatePredictBody,
  validateFeedPeriod,
  validateOutcomeBody,
  parsePagination,
  sanitizeSettings,
  getDisclosure,
  acceptDisclosure,
  predict,
  feed,
  listPredictions,
  getPrediction,
  deletePrediction,
  submitOutcome,
  explainPrediction,
  createSynchronicity,
  calibration,
  listMemories,
  deleteMemory,
  getSettings,
  updateSettings
};
