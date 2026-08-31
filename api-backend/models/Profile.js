const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    full_name: { type: String, required: true, trim: true },
    date_of_birth: { type: String, required: true },
    time_of_birth: { type: String },
    place_of_birth: { type: String, required: true },
    gender: { type: String },
    current_location: { type: String },
    life_context: {
      type: mongoose.Schema.Types.Mixed
    },
    birth_chart_data: {
      type: mongoose.Schema.Types.Mixed
    },
    numerology_data: {
      type: mongoose.Schema.Types.Mixed
    },
    style_preferences: {
      type: mongoose.Schema.Types.Mixed
    },
    insights_generated: { type: Boolean, default: false },
    insights_generated_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date }
  },
  { collection: 'profiles', strict: false }
);

module.exports = mongoose.model('Profile', ProfileSchema);
