const ImageReading = require('../models/ImageReading');
const Profile = require('../models/Profile');
const User = require('../models/User');
const geminiVisionService = require('../services/geminiVisionService');

const getPalmReading = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { imageBase64, mimeType, forceRegenerate } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Check for cached reading (within 7 days) only if not forcing regeneration
    if (!forceRegenerate) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const existingReading = await ImageReading.findOne({
        user_id: userId,
        reading_type: 'palm',
        created_at: { $gte: sevenDaysAgo }
      });

      if (existingReading) {
        const user = await User.findById(userId).select('credits');
        return res.json({
          success: true,
          data: existingReading.result,
          source: 'cache',
          remaining_credits: user ? user.credits : 0
        });
      }
    }

    // Deduct 10 credits BEFORE the AI call (prevents free usage if AI errors)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -10 } },
      { new: true }
    );

    if (!updatedUser || updatedUser.credits < -9) {
      // Refund if balance went negative (shouldn't happen with middleware, but safety net)
      if (updatedUser) await User.findByIdAndUpdate(userId, { $inc: { credits: 10 } });
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits. This feature requires 10 Cosmic Credits.',
        code: 'INSUFFICIENT_CREDITS',
        credits: updatedUser ? updatedUser.credits + 10 : 0
      });
    }

    console.log(`[PalmReading] 10 credits deducted. Remaining: ${updatedUser.credits}`);

    // Fetch user profile for context
    const profile = await Profile.findOne({ user_id: userId });

    // Generate reading via Gemini
    const result = await geminiVisionService.generateReading({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      readingType: 'palm',
      userProfile: profile || {}
    });

    // Save new reading with image
    await ImageReading.create({
      user_id: userId,
      reading_type: 'palm',
      image_data: imageBase64,
      mime_type: mimeType || 'image/jpeg',
      result
    });

    return res.json({
      success: true,
      data: result,
      source: 'generated',
      credits_used: 10,
      remaining_credits: updatedUser.credits
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPalmReading };
