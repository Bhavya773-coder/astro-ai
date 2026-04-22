const mongoose = require('mongoose');

const ImageReadingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reading_type: { type: String, enum: ['palm', 'coffee', 'face'], required: true },
    image_data: { type: String }, // Base64 image data
    mime_type: { type: String, default: 'image/jpeg' },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'image_readings' }
);

// Compound index for efficient lookups
ImageReadingSchema.index({ user_id: 1, reading_type: 1 });

module.exports = mongoose.model('ImageReading', ImageReadingSchema);
