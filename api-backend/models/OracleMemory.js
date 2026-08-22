const mongoose = require('mongoose');
const crypto = require('crypto');

const oracleMemorySchema = new mongoose.Schema({
  memory_id: { type: String, default: () => crypto.randomUUID(), required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: {
    type: String,
    enum: ['correction', 'confirmed_pattern', 'synchronicity'],
    required: true
  },
  text: { type: String, required: true },
  source_metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  prediction_id: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'oracle_memories',
  timestamps: false
});

oracleMemorySchema.index({ memory_id: 1 }, { unique: true });
oracleMemorySchema.index({ user_id: 1, created_at: -1 });
oracleMemorySchema.index({ user_id: 1, kind: 1 });
oracleMemorySchema.index({ user_id: 1, prediction_id: 1 });

module.exports = mongoose.model('OracleMemory', oracleMemorySchema);
