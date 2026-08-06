const { AccessToken } = require('livekit-server-sdk');
const User = require('../models/User');

/**
 * LiveKit Token Controller
 * Generates signed JWTs for clients to connect to the LiveKit voice server.
 */
const getLiveKitToken = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: 'roomName is required'
      });
    }

    // Fetch user details for identity and metadata
    const user = await User.findById(userId).lean();
    const userName = user ? user.name : 'User';

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('[LiveKit] LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set in environment.');
      return res.status(500).json({
        success: false,
        message: 'LiveKit voice service is not configured on this server.'
      });
    }

    // Pass the userId in metadata so the voice agent can load the correct user profile
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: userName,
      metadata: JSON.stringify({ userId, userName })
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    const token = await at.toJwt();

    return res.json({
      success: true,
      token,
      url: process.env.LIVEKIT_URL
    });
  } catch (error) {
    console.error('[LiveKit Controller Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate LiveKit connection token.'
    });
  }
};

module.exports = {
  getLiveKitToken
};
