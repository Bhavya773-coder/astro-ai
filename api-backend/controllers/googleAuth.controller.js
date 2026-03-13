const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const googleAuth = async (req, res, next) => {
  const { code } = req.body;

  console.log('[Google Auth] Received authorization code');

  if (!code) {
    console.log('[Google Auth] No authorization code provided');
    res.status(400);
    return next(new Error('Authorization code is required'));
  }

  try {
    // Exchange authorization code for access token
    console.log('[Google Auth] Exchanging code for tokens...');
    
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/auth/google/callback`
    });

    const { access_token, id_token } = tokenResponse.data;
    console.log('[Google Auth] Successfully obtained access token');

    // Get user info from Google
    console.log('[Google Auth] Fetching user info...');
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, picture, id } = userInfoResponse.data;
    console.log('[Google Auth] User info retrieved:', { email, name, id: id.substring(0, 10) + '...' });

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('[Google Auth] Creating new user for:', email);
      // Create new user
      user = await User.create({
        email: email.toLowerCase(),
        password_hash: '', // No password for OAuth users
        role: 'user',
        subscription_plan: 'free',
        subscription_status: 'inactive',
        google_id: id,
        avatar: picture
      });
      console.log('[Google Auth] New user created successfully');
    } else {
      console.log('[Google Auth] User already exists, updating Google info:', email);
      // Update existing user's Google info if not already set
      if (!user.google_id) {
        user.google_id = id;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
      console.log('[Google Auth] Existing user updated successfully');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('[Google Auth] Login successful for:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('[Google Auth] Error:', error.response?.data || error.message);
    res.status(400);
    return next(new Error('Google authentication failed'));
  }
};

module.exports = { googleAuth };
