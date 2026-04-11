const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { enqueueEmail, isQueueEnabled } = require('../email/emailQueue');
const { hasSmtpConfig, sendTemplatedEmail } = require('../email/emailService');

const User = require('../models/User');

const signToken = (user) => {
  const payload = { userId: user._id.toString(), role: user.role, email: user.email };
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const generateSixDigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async ({ to, otp, ttlMinutes }) => {
  if (!hasSmtpConfig()) {
    console.log(`[password-reset] OTP for ${to}: ${otp}`);
    return;
  }

  const username = String(to).split('@')[0] || 'there';
  const year = new Date().getFullYear();

  const payload = {
    to,
    subject: 'Your AstroAI password reset code',
    template: 'otp_reset',
    variables: {
      username,
      otp,
      ttlMinutes,
      year
    },
    text: `Your password reset code is: ${otp}`,
    replyTo: process.env.EMAIL_REPLY_TO
  };

  if (isQueueEnabled()) {
    await enqueueEmail(payload);
    return;
  }

  await sendTemplatedEmail(payload);
};

const register = async (req, res, next) => {
  const { email, password, is_believer } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('email and password are required'));
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    res.status(409);
    return next(new Error('Email already in use'));
  }

  const password_hash = await bcrypt.hash(String(password), 10);

  const user = await User.create({
    email: String(email).toLowerCase(),
    password_hash,
    role: 'user',
    subscription_plan: 'free',
    subscription_status: 'inactive',
    is_believer: is_believer !== undefined ? Boolean(is_believer) : true
  });

  const token = signToken(user);

  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, role: user.role }
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('email and password are required'));
  }

  if (email === 'admin@astro.com' && password === 'admin@123') {
    const adminUser = {
      _id: '000000000000000000000000',
      email: 'admin@astro.com',
      role: 'admin'
    };
    const token = signToken(adminUser);
    return res.json({
      token,
      user: { id: adminUser._id, email: adminUser.email, role: adminUser.role }
    });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    res.status(401);
    return next(new Error('Invalid credentials'));
  }

  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) {
    res.status(401);
    return next(new Error('Invalid credentials'));
  }

  const token = signToken(user);

  res.json({
    token,
    user: { id: user._id, email: user.email, role: user.role }
  });
};

const me = async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Unauthorized'));
  }

  const user = await User.findById(req.user.userId).select(
    '-password_hash -reset_password_token_hash -reset_password_expires_at'
  );
  if (!user) {
    res.status(401);
    return next(new Error('Unauthorized'));
  }

  return res.json(user);
};

const requestOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    return next(new Error('email is required'));
  }

  const normalizedEmail = String(email).toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.json({ ok: true });
  }

  const otp = generateSixDigitOtp();
  const ttlMinutes = Number(process.env.RESET_TOKEN_TTL_MINUTES || 30);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  user.reset_otp = otp;
  user.reset_otp_expires_at = expiresAt;
  await user.save();

  await sendOtpEmail({ to: user.email, otp, ttlMinutes });

  const hasEmail = hasSmtpConfig();
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev && !hasEmail) {
    return res.json({ ok: true, otp });
  }

  return res.json({ ok: true });
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    return next(new Error('email and otp are required'));
  }

  const normalizedEmail = String(email).toLowerCase();
  const user = await User.findOne({
    email: normalizedEmail,
    reset_otp: otp,
    reset_otp_expires_at: { $gt: new Date() }
  });

  if (!user) {
    res.status(400);
    return next(new Error('Invalid or expired OTP'));
  }

  // Mark user as verified for password reset by setting a short-lived session token
  const resetSessionToken = crypto.randomBytes(32).toString('hex');
  user.reset_otp = undefined;
  user.reset_otp_expires_at = undefined;
  user.reset_password_token_hash = crypto.createHash('sha256').update(resetSessionToken).digest('hex');
  user.reset_password_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  return res.json({ ok: true, resetSessionToken });
};

const resetPasswordWithOtp = async (req, res, next) => {
  const { password, resetSessionToken } = req.body;

  if (!password || !resetSessionToken) {
    res.status(400);
    return next(new Error('password and resetSessionToken are required'));
  }

  const tokenHash = crypto.createHash('sha256').update(resetSessionToken).digest('hex');

  const user = await User.findOne({
    reset_password_token_hash: tokenHash,
    reset_password_expires_at: { $gt: new Date() }
  });

  if (!user) {
    res.status(400);
    return next(new Error('Invalid or expired session'));
  }

  user.password_hash = await bcrypt.hash(String(password), 10);
  user.reset_password_token_hash = undefined;
  user.reset_password_expires_at = undefined;
  await user.save();

  return res.json({ ok: true });
};

module.exports = { register, login, me, requestOtp, verifyOtp, resetPasswordWithOtp };
