const ImageReading = require('../models/ImageReading');
const Profile = require('../models/Profile');
const User = require('../models/User');
const geminiVisionService = require('../services/geminiVisionService');

const VASTU_COST = 50;

const getVastuConsultation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: '2D house plan image is required' });
    }

    const profile = await Profile.findOne({ user_id: userId });
    const result = await geminiVisionService.generateReading({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      readingType: 'vastu',
      userProfile: profile || {}
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, credits: { $gte: VASTU_COST } },
      { $inc: { credits: -VASTU_COST } },
      { new: true }
    ).select('credits');

    if (!updatedUser) {
      return res.status(402).json({
        success: false,
        message: `Insufficient credits. This feature requires ${VASTU_COST} Cosmic Credits.`,
        code: 'INSUFFICIENT_CREDITS',
        required_credits: VASTU_COST
      });
    }

    await ImageReading.create({
      user_id: userId,
      reading_type: 'vastu',
      image_data: imageBase64,
      mime_type: mimeType || 'image/jpeg',
      result
    });

    return res.json({
      success: true,
      data: result,
      source: 'generated',
      credits_used: VASTU_COST,
      remaining_credits: updatedUser.credits
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getVastuConsultation };
