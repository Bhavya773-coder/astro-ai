const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: function() { return !this.google_id; } },
    reset_password_token_hash: { type: String },
    reset_password_expires_at: { type: Date },
    reset_otp: { type: String },
    reset_otp_expires_at: { type: Date },
    google_id: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscription_plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    subscription_status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'inactive'
    },
    subscription_expires_at: { type: Date },
    subscription_plan_type: { type: String, enum: ['monthly', 'yearly'] },
    razorpay_payment_id: { type: String },
    processed_payments: [{ type: String }], // Track processed payment IDs to prevent double crediting
    is_believer: { type: Boolean, default: true },
    credits: {
      type: Number,
      default: 50,
      min: 0
    },
    total_credits_purchased: {
      type: Number,
      default: 0
    },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date }
  },
  { collection: 'users', timestamps: { updatedAt: 'updated_at' } }
);

UserSchema.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date();
  this.updated_at = new Date();
  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model('User', UserSchema);
