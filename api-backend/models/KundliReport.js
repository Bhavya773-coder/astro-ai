const mongoose = require('mongoose');

const KundliReportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    birth_details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    chart_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    interpretation: {
      personality: { type: String },
      strengths: { type: String },
      challenges: { type: String },
      career: { type: String },
      relationships: { type: String },
      health: { type: String },
      spiritual_path: { type: String },
      important_yogas: [{ type: mongoose.Schema.Types.Mixed }]
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'kundli_reports',
    strict: false
  }
);

// Each user should only have one Kundli unless regenerated manually
KundliReportSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('KundliReport', KundliReportSchema);
