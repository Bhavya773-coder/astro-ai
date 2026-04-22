const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  device_type: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_used_at: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PushToken', pushTokenSchema);
