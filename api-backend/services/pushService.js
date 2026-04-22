const webpush = require('web-push');
const PushToken = require('../models/PushToken');

class PushService {
  constructor() {
    this.init();
  }

  init() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:support@astroai4u.com',
        publicKey,
        privateKey
      );
      console.log('[PushService] Web-Push VAPID details set successfully');
    } else {
      console.warn('[PushService] VAPID keys missing in .env. Push notifications disabled.');
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId, payload) {
    try {
      const tokens = await PushToken.find({ user_id: userId, is_active: true });
      if (tokens.length === 0) return { success: false, message: 'No active tokens for user' };

      const results = await Promise.all(tokens.map(async (tokenDoc) => {
        try {
          // The 'token' in PushToken model for web-push is the full subscription object stringified
          const subscription = JSON.parse(tokenDoc.token);
          
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              icon: payload.icon || '/favicon.png',
              data: {
                url: payload.click_action || '/dashboard'
              }
            })
          );
          return { success: true };
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription expired or removed
            await PushToken.deleteOne({ _id: tokenDoc._id });
            return { success: false, reason: 'expired' };
          }
          return { success: false, error: err.message };
        }
      }));

      return { success: true, results };
    } catch (error) {
      console.error('[PushService] Error sending to user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast to all active users
   */
  async broadcast(payload) {
    try {
      const tokens = await PushToken.find({ is_active: true });
      if (tokens.length === 0) return { success: false, message: 'No tokens found' };

      const results = await Promise.all(tokens.map(async (tokenDoc) => {
        try {
          const subscription = JSON.parse(tokenDoc.token);
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              icon: payload.icon || '/favicon.png',
              data: {
                url: payload.click_action || '/dashboard'
              }
            })
          );
          return { success: true };
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await PushToken.deleteOne({ _id: tokenDoc._id });
          }
          return { success: false };
        }
      }));

      return { success: true, count: results.filter(r => r.success).length };
    } catch (error) {
      console.error('[PushService] Broadcast error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PushService();
