const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};

class FeedbackController {
  /**
   * Submit new feedback
   */
  submitFeedback = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const {
        overall_rating,
        feature_ratings,
        ease_of_use,
        design_rating,
        would_recommend,
        favorite_feature,
        what_you_loved,
        what_to_improve,
        additional_comments
      } = req.body;

      // Validate required fields
      if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Overall rating is required (1-5 stars)'
        });
      }

      // Check if user has already submitted feedback recently (within 24 hours)
      const existingFeedback = await Feedback.findOne({
        user_id: userObjectId,
        submitted_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (existingFeedback) {
        // Update existing feedback instead of creating new
        existingFeedback.overall_rating = overall_rating;
        if (feature_ratings) existingFeedback.feature_ratings = feature_ratings;
        if (ease_of_use) existingFeedback.ease_of_use = ease_of_use;
        if (design_rating) existingFeedback.design_rating = design_rating;
        if (would_recommend !== undefined) existingFeedback.would_recommend = would_recommend;
        if (favorite_feature) existingFeedback.favorite_feature = favorite_feature;
        if (what_you_loved) existingFeedback.what_you_loved = what_you_loved;
        if (what_to_improve) existingFeedback.what_to_improve = what_to_improve;
        if (additional_comments) existingFeedback.additional_comments = additional_comments;

        await existingFeedback.save();

        return res.json({
          success: true,
          message: 'Feedback updated successfully',
          data: {
            feedbackId: existingFeedback.feedback_id,
            submittedAt: existingFeedback.submitted_at
          }
        });
      }

      // Create new feedback
      const user = req.user;
      const feedback = new Feedback({
        user_id: userObjectId,
        user_email: user.email || 'unknown',
        user_name: user.name || user.email?.split('@')[0] || 'Anonymous',
        overall_rating,
        feature_ratings: feature_ratings || {},
        ease_of_use,
        design_rating,
        would_recommend,
        favorite_feature,
        what_you_loved,
        what_to_improve,
        additional_comments
      });

      await feedback.save();

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          feedbackId: feedback.feedback_id,
          submittedAt: feedback.submitted_at
        }
      });

    } catch (error) {
      console.error('[FeedbackController] Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback'
      });
    }
  };

  /**
   * Get user's own feedback (for checking if already submitted)
   */
  getMyFeedback = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);

      const feedback = await Feedback.findOne({
        user_id: userObjectId
      }).sort({ submitted_at: -1 }).lean();

      res.json({
        success: true,
        data: feedback || null
      });

    } catch (error) {
      console.error('[FeedbackController] Error getting user feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback'
      });
    }
  };

  /**
   * Get all feedback (admin only)
   */
  getAllFeedback = async (req, res) => {
    try {
      const { page = 1, limit = 20, sortBy = 'submitted_at', order = 'desc' } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      const feedback = await Feedback.find()
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Feedback.countDocuments();

      // Calculate average ratings
      const stats = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            avgOverall: { $avg: '$overall_rating' },
            avgEaseOfUse: { $avg: '$ease_of_use' },
            avgDesign: { $avg: '$design_rating' },
            totalCount: { $sum: 1 },
            recommendCount: {
              $sum: { $cond: [{ $eq: ['$would_recommend', true] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          feedback,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          },
          stats: stats[0] || null
        }
      });

    } catch (error) {
      console.error('[FeedbackController] Error getting all feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback'
      });
    }
  };

  /**
   * Get feedback for a specific user (admin only)
   */
  getUserFeedback = async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      let userObjectId;
      try {
        userObjectId = toObjectId(userId);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const feedback = await Feedback.find({
        user_id: userObjectId
      }).sort({ submitted_at: -1 }).lean();

      res.json({
        success: true,
        data: feedback
      });

    } catch (error) {
      console.error('[FeedbackController] Error getting user feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user feedback'
      });
    }
  };

  /**
   * Delete feedback (admin only)
   */
  deleteFeedback = async (req, res) => {
    try {
      const { feedbackId } = req.params;

      const result = await Feedback.findOneAndDelete({ feedback_id: feedbackId });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
      }

      res.json({
        success: true,
        message: 'Feedback deleted successfully'
      });

    } catch (error) {
      console.error('[FeedbackController] Error deleting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete feedback'
      });
    }
  };

  /**
   * Get feedback statistics (admin only)
   */
  getFeedbackStats = async (req, res) => {
    try {
      const stats = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            avgOverall: { $avg: '$overall_rating' },
            avgEaseOfUse: { $avg: '$ease_of_use' },
            avgDesign: { $avg: '$design_rating' },
            totalCount: { $sum: 1 },
            recommendCount: {
              $sum: { $cond: [{ $eq: ['$would_recommend', true] }, 1, 0] }
            },
            ratingDistribution: {
              $push: '$overall_rating'
            }
          }
        }
      ]);

      // Get feature ratings breakdown
      const featureStats = await Feedback.aggregate([
        {
          $project: {
            horoscope: '$feature_ratings.horoscope',
            numerology: '$feature_ratings.numerology',
            chat: '$feature_ratings.chat',
            style_forecaster: '$feature_ratings.style_forecaster',
            birth_chart: '$feature_ratings.birth_chart'
          }
        },
        {
          $group: {
            _id: null,
            avgHoroscope: { $avg: '$horoscope' },
            avgNumerology: { $avg: '$numerology' },
            avgChat: { $avg: '$chat' },
            avgStyleForecaster: { $avg: '$style_forecaster' },
            avgBirthChart: { $avg: '$birth_chart' }
          }
        }
      ]);

      // Get favorite feature distribution
      const favoriteFeatures = await Feedback.aggregate([
        {
          $match: { favorite_feature: { $ne: null } }
        },
        {
          $group: {
            _id: '$favorite_feature',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overall: stats[0] || null,
          features: featureStats[0] || null,
          favoriteFeatures: favoriteFeatures || []
        }
      });

    } catch (error) {
      console.error('[FeedbackController] Error getting feedback stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback statistics'
      });
    }
  };
}

module.exports = new FeedbackController();
