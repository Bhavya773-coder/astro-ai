const mongoose = require('mongoose');

const GrowthMetricsSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emotional_score: { type: Number, default: 5.0 },
    dominant_theme: { type: String, default: '' },
    risk_level: { type: String, default: '' },
    monthly_progress_score: { type: Number, default: 0.0 },
    updated_at: { type: Date, required: true, default: Date.now }
  },
  { collection: 'growth_metrics' }
);

module.exports = mongoose.model('GrowthMetrics', GrowthMetricsSchema);
