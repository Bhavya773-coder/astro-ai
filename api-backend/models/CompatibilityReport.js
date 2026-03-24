const mongoose = require('mongoose');

const CompatibilityReportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    partner_profile: { type: mongoose.Schema.Types.Mixed, default: {} },
    compatibility_score: { type: Number, required: true, default: 0 },
    analysis: { type: String, default: '' },
    created_at: { type: Date, required: true, default: Date.now }
  },
  { collection: 'compatibility_reports' }
);

module.exports = mongoose.model('CompatibilityReport', CompatibilityReportSchema);
