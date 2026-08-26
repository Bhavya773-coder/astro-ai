const ImageReading = require('../models/ImageReading');

const getReadingHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type } = req.params; // 'palm', 'coffee', 'face', or 'vastu'

    if (!['palm', 'coffee', 'face', 'vastu'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reading type. Must be palm, coffee, face, or vastu.'
      });
    }

    const readings = await ImageReading.find({
      user_id: userId,
      reading_type: type
    })
    .sort({ created_at: -1 }) // Newest first
    .limit(50);

    return res.json({
      success: true,
      data: readings,
      count: readings.length
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReadingHistory };
