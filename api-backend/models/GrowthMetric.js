const mongoose = require('mongoose');

const GrowthMetricSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    emotional_score: { type: Number },
    dominant_theme: { type: String },
    risk_level: { type: String },
    monthly_progress_score: { type: Number },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'growth_metrics' }
);

GrowthMetricSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

GrowthMetricSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model('GrowthMetric', GrowthMetricSchema);
