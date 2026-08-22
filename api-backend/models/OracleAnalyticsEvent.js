const mongoose = require('mongoose');

const EVENTS = [
  'disclosure_viewed',
  'disclosure_accepted',
  'prediction_created',
  'prediction_reused',
  'prediction_recalculated',
  'prediction_expired',
  'outcome_prompted',
  'outcome_recorded',
  'explanation_requested',
  'synchronicity_saved',
  'prediction_deleted',
  'memory_deleted',
  'oracle_settings_updated',
  'certainty_pressure_detected',
  'binary_request_detected',
  'method_switched'
];

const oracleAnalyticsEventSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: String, enum: EVENTS, required: true },
  prediction_id: { type: String },
  question_cluster: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'oracle_analytics_events',
  timestamps: false
});

oracleAnalyticsEventSchema.index({ user_id: 1, timestamp: -1 });
oracleAnalyticsEventSchema.index({ event: 1, timestamp: -1 });
oracleAnalyticsEventSchema.index({ prediction_id: 1 });
oracleAnalyticsEventSchema.index({ question_cluster: 1, timestamp: -1 });

module.exports = mongoose.model('OracleAnalyticsEvent', oracleAnalyticsEventSchema);
