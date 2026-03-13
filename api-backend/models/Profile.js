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
      career_stage: { type: String },
      relationship_status: { type: String },
      main_life_focus: { type: String },
      personality_style: { type: String },
      primary_life_problem: { type: String }
    },
    birth_chart_data: {
      sun_sign: { type: String },
      moon_sign: { type: String },
      ascendant: { type: String },
      dominant_planet: { type: String }
    },
    numerology_data: {
      life_path: { type: String },
      destiny: { type: String },
      personal_year: { type: String }
    },
    insights_generated: { type: Boolean, default: false },
    insights_generated_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date }
  },
  { collection: 'profiles' }
);

module.exports = mongoose.model('Profile', ProfileSchema);
