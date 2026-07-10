const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  ip: String,
  user_agent: String,
  referrer: String,
  last_page_visited: String,
  visit_count: { type: Number, default: 1 },
  push_token: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { updatedAt: 'updated_at' } });

module.exports = mongoose.model('Visitor', VisitorSchema);
