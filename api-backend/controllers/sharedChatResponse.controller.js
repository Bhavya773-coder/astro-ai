const SharedChatResponse = require('../models/SharedChatResponse');
const mongoose = require('mongoose');

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};

class SharedChatResponseController {
  /**
   * Share a chat response (question + answer pair)
   */
  shareChatResponse = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { question, response, context } = req.body;

      // Validate required fields
      if (!question || !response) {
        return res.status(400).json({
          success: false,
          message: 'Question and response are required'
        });
      }

      // Create shared response
      const user = req.user;
      const sharedResponse = new SharedChatResponse({
        user_id: userObjectId,
        user_name: user.name || user.email?.split('@')[0] || 'Anonymous',
        question: question.trim(),
        response: response.trim(),
        context: context || null
      });

      await sharedResponse.save();

      // Generate share URL - using production domain
      const frontendUrl = process.env.FRONTEND_BASE_URL || 'https://astroai4u.com';
      const shareUrl = `${frontendUrl}/shared-response/${sharedResponse.share_id}`;

      res.json({
        success: true,
        message: 'Response shared successfully',
        data: {
          shareId: sharedResponse.share_id,
          shareUrl: shareUrl,
          createdAt: sharedResponse.created_at
        }
      });

    } catch (error) {
      console.error('[SharedChatResponseController] Error sharing response:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share response'
      });
    }
  };

  /**
   * Get a shared response by share ID (public access)
   */
  getSharedResponse = async (req, res) => {
    try {
      const { shareId } = req.params;

      if (!shareId) {
        return res.status(400).json({
          success: false,
          message: 'Share ID is required'
        });
      }

      const sharedResponse = await SharedChatResponse.findOne({
        share_id: shareId
      }).lean();

      if (!sharedResponse) {
        return res.status(404).json({
          success: false,
          message: 'Shared response not found or has expired'
        });
      }

      res.json({
        success: true,
        data: {
          shareId: sharedResponse.share_id,
          userName: sharedResponse.user_name,
          question: sharedResponse.question,
          response: sharedResponse.response,
          context: sharedResponse.context,
          createdAt: sharedResponse.created_at
        }
      });

    } catch (error) {
      console.error('[SharedChatResponseController] Error getting shared response:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared response'
      });
    }
  };

  /**
   * Delete a shared response (owner only)
   */
  deleteSharedResponse = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { shareId } = req.params;

      const result = await SharedChatResponse.findOneAndDelete({
        share_id: shareId,
        user_id: userObjectId
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Shared response not found or you do not have permission to delete it'
        });
      }

      res.json({
        success: true,
        message: 'Shared response deleted successfully'
      });

    } catch (error) {
      console.error('[SharedChatResponseController] Error deleting shared response:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shared response'
      });
    }
  };

  /**
   * Get user's shared responses
   */
  getMySharedResponses = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);

      const responses = await SharedChatResponse.find({
        user_id: userObjectId
      }).sort({ created_at: -1 }).lean();

      res.json({
        success: true,
        data: responses.map(r => ({
          shareId: r.share_id,
          question: r.question.substring(0, 100) + (r.question.length > 100 ? '...' : ''),
          createdAt: r.created_at
        }))
      });

    } catch (error) {
      console.error('[SharedChatResponseController] Error getting user shared responses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared responses'
      });
    }
  };
}

module.exports = new SharedChatResponseController();
