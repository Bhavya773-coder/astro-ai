const mongoose = require('mongoose');

const AstroCalendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['special_day', 'puja', 'fast', 'birthday', 'astrological', 'other'],
      default: 'special_day',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AstroCalendarEvent', AstroCalendarEventSchema);
