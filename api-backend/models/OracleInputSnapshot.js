const mongoose = require('mongoose');
const crypto = require('crypto');

const oracleInputSnapshotSchema = new mongoose.Schema({
  snapshot_id: { type: String, default: () => crypto.randomUUID(), required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  calculation_versions: { type: mongoose.Schema.Types.Mixed, default: {} },
  profile_versions: { type: mongoose.Schema.Types.Mixed, default: {} },
  authorized_inputs: { type: mongoose.Schema.Types.Mixed, required: true },
  deterministic_sources: { type: [String], default: [] },
  contextual_signals: {
    location: { type: mongoose.Schema.Types.Mixed },
    environment: { type: mongoose.Schema.Types.Mixed },
    calendar: { type: mongoose.Schema.Types.Mixed }
  },
  relevant_memories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OracleMemory' }],
  recent_prediction_ids: { type: [String], default: [] },
  question_context: { type: mongoose.Schema.Types.Mixed },
  snapshot_hash: { type: String, required: true }
}, {
  collection: 'oracle_input_snapshots',
  timestamps: false
});

oracleInputSnapshotSchema.index({ snapshot_id: 1 }, { unique: true });
oracleInputSnapshotSchema.index({ user_id: 1, timestamp: -1 });
oracleInputSnapshotSchema.index({ user_id: 1, snapshot_hash: 1 });

module.exports = mongoose.model('OracleInputSnapshot', oracleInputSnapshotSchema);
