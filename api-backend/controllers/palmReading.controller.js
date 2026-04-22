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
        return res.json({
          success: true,
          data: existingReading.result,
          source: 'cache'
        });
      }
    }

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

    // Deduct 1 credit and get updated count
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -1 } },
      { new: true }
    );

    console.log(`[PalmReading] Credit deducted. Remaining: ${updatedUser.credits}`);

    return res.json({
      success: true,
      data: result,
      source: 'generated',
      credits_used: 1,
      remaining_credits: updatedUser.credits
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPalmReading };
