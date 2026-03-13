const mongoose = require('mongoose');

const KundliReportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    birth_details: {
      full_name: { type: String, required: true },
      date_of_birth: { type: String, required: true },
      time_of_birth: { type: String, required: true },
      place_of_birth: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    chart_data: {
      ascendant: { type: String, required: true },
      moon_sign: { type: String, required: true },
      sun_sign: { type: String, required: true },
      nakshatra: { type: String, required: true },
      planets: {
        sun: { type: Object, required: true },
        moon: { type: Object, required: true },
        mars: { type: Object, required: true },
        mercury: { type: Object, required: true },
        jupiter: { type: Object, required: true },
        venus: { type: Object, required: true },
        saturn: { type: Object, required: true },
        rahu: { type: Object, required: true },
        ketu: { type: Object, required: true }
      },
      houses: {
        1: { type: String, required: true },
        2: { type: String, required: true },
        3: { type: String, required: true },
        4: { type: String, required: true },
        5: { type: String, required: true },
        6: { type: String, required: true },
        7: { type: String, required: true },
        8: { type: String, required: true },
        9: { type: String, required: true },
        10: { type: String, required: true },
        11: { type: String, required: true },
        12: { type: String, required: true }
      }
    },
    interpretation: {
      personality: { type: String },
      strengths: { type: String },
      challenges: { type: String },
      career: { type: String },
      relationships: { type: String },
      health: { type: String },
      spiritual_path: { type: String },
      important_yogas: [{ type: String }]
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'kundli_reports'
  }
);

// Each user should only have one Kundli unless regenerated manually
KundliReportSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('KundliReport', KundliReportSchema);

