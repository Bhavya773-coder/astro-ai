const PushToken = require('../models/PushToken');

class PushController {
  /**
   * Save or update a push token for the user
   */
  saveToken = async (req, res) => {
    try {
      const { token, device_type } = req.body;
      const userId = req.user.userId;

      if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
      }

      // Upsert token
      await PushToken.findOneAndUpdate(
        { token },
        { 
          user_id: userId,
          device_type: device_type || 'web',
          is_active: true,
          last_used_at: new Date()
        },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Token saved successfully' });
    } catch (error) {
      console.error('[PushController] Error saving token:', error);
      res.status(500).json({ success: false, message: 'Failed to save token' });
    }
  }

  /**
   * Unsubscribe / Deactivate token
   */
  unsubscribe = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ success: false, message: 'Token required' });

      await PushToken.deleteOne({ token });
      res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Unsubscribe failed' });
    }
  }
}

module.exports = new PushController();
