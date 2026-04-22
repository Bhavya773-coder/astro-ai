const mongoose = require('mongoose');

const UserCreditsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  credits: {
    type: Number,
    default: 10,   // new users get 10 free credits
    min: 0
  },
  total_used: {
    type: Number,
    default: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, { collection: 'user_credits', timestamps: false });

module.exports = mongoose.model('UserCredits', UserCreditsSchema);
