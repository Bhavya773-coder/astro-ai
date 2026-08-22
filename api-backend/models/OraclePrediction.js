const mongoose = require('mongoose');
const crypto = require('crypto');

const STATUSES = [
  'open',
  'awaiting_outcome',
  'confirmed_strong',
  'confirmed_partial',
  'missed',
  'expired_unrated',
  'cancelled_due_to_changed_context'
];

const statementTagSchema = new mongoose.Schema({
  text: { type: String, required: true },
  tag: { type: String, enum: ['prediction', 'interpretation', 'advice'], required: true }
}, { _id: false });

const predictionOriginalSchema = new mongoose.Schema({
  text: { type: String, required: true },
  direction: { type: String, required: true },
  strength: { type: mongoose.Schema.Types.Mixed, required: true },
  time_window: { type: mongoose.Schema.Types.Mixed, required: true },
  manifestations: { type: [String], default: [] },
  signals: { type: [String], default: [] },
  recommended_action: { type: String },
  valid_until: { type: Date, required: true },
  reassessment_at: { type: Date },
  model_version: { type: String, required: true },
  statement_tags: { type: [statementTagSchema], default: [] }
}, { _id: false });

const postAnalysisSchema = new mongoose.Schema({
  kind: { type: String, required: true },
  text: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  model_version: { type: String }
}, { _id: false });

const analyticsFlagsSchema = new mongoose.Schema({
  certainty_pressure: { type: Boolean, default: false },
  binary_request: { type: Boolean, default: false },
  reused: { type: Boolean, default: false },
  method_switch: { type: Boolean, default: false },
  recalculation_reason: { type: String }
}, { _id: false });

const oraclePredictionSchema = new mongoose.Schema({
  prediction_id: { type: String, default: () => crypto.randomUUID(), required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  message_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  created_at: { type: Date, default: Date.now },
  canonical_question: { type: String, required: true },
  canonical_question_key: { type: String, required: true },
  question_cluster: { type: String, required: true },
  category: { type: String, required: true },
  horizon: { type: String, required: true },
  methods: { type: [String], required: true },
  input_snapshot_id: { type: String, required: true },
  material_snapshot_hash: { type: String, required: true },
  prediction_original: { type: predictionOriginalSchema, required: true, immutable: true },
  prediction_post_analysis: { type: [postAnalysisSchema], default: [] },
  status: { type: String, enum: STATUSES, default: 'open' },
  outcome: { type: mongoose.Schema.Types.Mixed },
  user_feedback: { type: mongoose.Schema.Types.Mixed },
  analytics_flags: { type: analyticsFlagsSchema, default: () => ({}) }
}, {
  collection: 'oracle_predictions',
  timestamps: false
});

oraclePredictionSchema.index({ prediction_id: 1 }, { unique: true });
oraclePredictionSchema.index({ user_id: 1, created_at: -1 });
oraclePredictionSchema.index({ user_id: 1, canonical_question_key: 1 });
oraclePredictionSchema.index({ user_id: 1, status: 1 });
oraclePredictionSchema.index({ question_cluster: 1 });
oraclePredictionSchema.index({ input_snapshot_id: 1 });

oraclePredictionSchema.pre('validate', function(next) {
  if (!this.isNew && this.isModified('prediction_original')) {
    return next(new Error('prediction_original is immutable'));
  }

  if (!this.isNew && this.isModified('prediction_post_analysis')) {
    const operations = this.prediction_post_analysis.$atomics();
    if (Object.keys(operations).some(operation => operation !== '$push')) {
      return next(new Error('prediction_post_analysis is append-only'));
    }
  }

  next();
});

function rejectNonAppendOnlyUpdates(next) {
  const update = this.getUpdate() || {};
  const changesPath = (fields, target) => Object.keys(fields || {}).some(
    path => path === target || path.startsWith(`${target}.`)
  );

  const direct = Object.fromEntries(Object.entries(update).filter(([key]) => !key.startsWith('$')));
  if (changesPath(direct, 'prediction_original')) {
    return next(new Error('prediction_original is immutable'));
  }
  if (changesPath(direct, 'prediction_post_analysis')) {
    return next(new Error('prediction_post_analysis is append-only'));
  }

  for (const [operator, fields] of Object.entries(update)) {
    if (!operator.startsWith('$') || !fields || typeof fields !== 'object') continue;
    if (changesPath(fields, 'prediction_original')) {
      return next(new Error('prediction_original is immutable'));
    }
    if (changesPath(fields, 'prediction_post_analysis') &&
        !(operator === '$push' && Object.keys(fields).every(path => path === 'prediction_post_analysis'))) {
      return next(new Error('prediction_post_analysis is append-only'));
    }
  }

  next();
}

oraclePredictionSchema.pre(['updateOne', 'findOneAndUpdate', 'replaceOne'], rejectNonAppendOnlyUpdates);

module.exports = mongoose.model('OraclePrediction', oraclePredictionSchema);
