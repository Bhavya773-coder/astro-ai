const SharedInsight = require('../models/SharedInsight');
const mongoose = require('mongoose');

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};

class SharedInsightController {
  /**
   * Share horoscope - create shareable link
   */
  shareHoroscope = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { user_name, zodiac, horoscope_data } = req.body;

      if (!zodiac || !horoscope_data) {
        return res.status(400).json({
          success: false,
          message: 'Horoscope data is required'
        });
      }

      // Create shared insight
      const sharedInsight = new SharedInsight({
        user_id: userObjectId,
        user_name: user_name || 'Anonymous',
        type: 'horoscope',
        zodiac,
        horoscope_data,
        is_public: true
      });

      await sharedInsight.save();

      // Generate share URL
      const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || 'https://astroai4u.com';
      const shareUrl = `${frontendUrl}/shared-horoscope/${sharedInsight.share_id}`;

      res.json({
        success: true,
        data: {
          shareId: sharedInsight.share_id,
          shareUrl: shareUrl,
          isPublic: true
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error sharing horoscope:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share horoscope'
      });
    }
  }

  /**
   * Share numerology - create shareable link
   */
  shareNumerology = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { user_name, numerology_data } = req.body;

      if (!numerology_data) {
        return res.status(400).json({
          success: false,
          message: 'Numerology data is required'
        });
      }

      // Create shared insight
      const sharedInsight = new SharedInsight({
        user_id: userObjectId,
        user_name: user_name || 'Anonymous',
        type: 'numerology',
        numerology_data,
        is_public: true
      });

      await sharedInsight.save();

      // Generate share URL
      const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || 'https://astroai4u.com';
      const shareUrl = `${frontendUrl}/shared-numerology/${sharedInsight.share_id}`;

      res.json({
        success: true,
        data: {
          shareId: sharedInsight.share_id,
          shareUrl: shareUrl,
          isPublic: true
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error sharing numerology:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share numerology'
      });
    }
  }

  /**
   * Share face reading - create shareable link
   */
  shareFaceReading = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { user_name, face_reading_data, image_url } = req.body;

      if (!face_reading_data) {
        return res.status(400).json({
          success: false,
          message: 'Face reading data is required'
        });
      }

      // Create shared insight
      const sharedInsight = new SharedInsight({
        user_id: userObjectId,
        user_name: user_name || 'Anonymous',
        type: 'face',
        face_reading_data,
        image_url,
        is_public: true
      });

      await sharedInsight.save();

      // Generate share URL
      const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || 'https://astroai4u.com';
      const shareUrl = `${frontendUrl}/shared-face-reading/${sharedInsight.share_id}`;

      res.json({
        success: true,
        data: {
          shareId: sharedInsight.share_id,
          shareUrl: shareUrl,
          isPublic: true
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error sharing face reading:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share face reading'
      });
    }
  }

  /**
   * Share style - create shareable link
   */
  shareStyle = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { user_name, style_data } = req.body;

      if (!style_data) {
        return res.status(400).json({
          success: false,
          message: 'Style data is required'
        });
      }

      // Create shared insight
      const sharedInsight = new SharedInsight({
        user_id: userObjectId,
        user_name: user_name || 'Anonymous',
        type: 'style',
        style_data,
        is_public: true
      });

      await sharedInsight.save();

      // Generate share URL
      const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || 'https://astroai4u.com';
      const shareUrl = `${frontendUrl}/shared-style/${sharedInsight.share_id}`;

      res.json({
        success: true,
        data: {
          shareId: sharedInsight.share_id,
          shareUrl: shareUrl,
          isPublic: true
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error sharing style:', error);
      
      // Handle specific MongoDB errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid style data provided',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: `Failed to share style: ${error.message}`
      });
    }
  }

  /**
   * Get shared horoscope (public access - no auth required)
   */
  getSharedHoroscope = async (req, res) => {
    try {
      const { shareId } = req.params;

      const sharedInsight = await SharedInsight.findOne({
        share_id: shareId,
        type: 'horoscope',
        is_public: true
      }).lean();

      if (!sharedInsight) {
        return res.status(404).json({
          success: false,
          message: 'Shared horoscope not found or is private'
        });
      }

      res.json({
        success: true,
        data: {
          user_name: sharedInsight.user_name,
          zodiac: sharedInsight.zodiac,
          horoscope_data: sharedInsight.horoscope_data,
          created_at: sharedInsight.created_at
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error getting shared horoscope:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared horoscope'
      });
    }
  }

  /**
   * Get shared numerology (public access - no auth required)
   */
  getSharedNumerology = async (req, res) => {
    try {
      const { shareId } = req.params;

      const sharedInsight = await SharedInsight.findOne({
        share_id: shareId,
        type: 'numerology',
        is_public: true
      }).lean();

      if (!sharedInsight) {
        return res.status(404).json({
          success: false,
          message: 'Shared numerology not found or is private'
        });
      }

      res.json({
        success: true,
        data: {
          user_name: sharedInsight.user_name,
          numerology_data: sharedInsight.numerology_data,
          created_at: sharedInsight.created_at
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error getting shared numerology:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared numerology'
      });
    }
  }

  /**
   * Get shared face reading (public access - no auth required)
   */
  getSharedFaceReading = async (req, res) => {
    try {
      const { shareId } = req.params;

      const sharedInsight = await SharedInsight.findOne({
        share_id: shareId,
        type: 'face',
        is_public: true
      }).lean();

      if (!sharedInsight) {
        return res.status(404).json({
          success: false,
          message: 'Shared face reading not found or is private'
        });
      }

      // Increment view count
      await SharedInsight.updateOne(
        { share_id: shareId },
        { $inc: { view_count: 1 } }
      );

      res.json({
        success: true,
        data: {
          user_name: sharedInsight.user_name,
          face_reading_data: sharedInsight.face_reading_data,
          image_url: sharedInsight.image_url,
          created_at: sharedInsight.created_at
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error getting shared face reading:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared face reading'
      });
    }
  }

  /**
   * Get shared style (public access - no auth required)
   */
  getSharedStyle = async (req, res) => {
    try {
      const { shareId } = req.params;

      const sharedInsight = await SharedInsight.findOne({
        share_id: shareId,
        type: 'style',
        is_public: true
      }).lean();

      if (!sharedInsight) {
        return res.status(404).json({
          success: false,
          message: 'Shared style not found or is private'
        });
      }

      // Increment view count
      await SharedInsight.updateOne(
        { share_id: shareId },
        { $inc: { view_count: 1 } }
      );

      res.json({
        success: true,
        data: {
          user_name: sharedInsight.user_name,
          style_data: sharedInsight.style_data,
          created_at: sharedInsight.created_at
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error getting shared style:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared style'
      });
    }
  }

  /**
   * Share coffee reading - create shareable link
   */
  shareCoffeeReading = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { user_name, coffee_reading_data, image_url } = req.body;

      if (!coffee_reading_data) {
        return res.status(400).json({
          success: false,
          message: 'Coffee reading data is required'
        });
      }

      // Create shared insight
      const sharedInsight = new SharedInsight({
        user_id: userObjectId,
        user_name: user_name || 'Anonymous',
        type: 'coffee',
        coffee_reading_data,
        image_url,
        is_public: true
      });

      await sharedInsight.save();

      res.json({
        success: true,
        data: {
          shareId: sharedInsight.share_id,
          isPublic: true
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error sharing coffee reading:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share coffee reading'
      });
    }
  }

  /**
   * Get shared coffee reading (public access - no auth required)
   */
  getSharedCoffeeReading = async (req, res) => {
    try {
      const { shareId } = req.params;

      const sharedInsight = await SharedInsight.findOne({
        share_id: shareId,
        type: 'coffee',
        is_public: true
      }).lean();

      if (!sharedInsight) {
        return res.status(404).json({
          success: false,
          message: 'Shared coffee reading not found or is private'
        });
      }

      // Increment view count
      await SharedInsight.updateOne(
        { share_id: shareId },
        { $inc: { view_count: 1 } }
      );

      res.json({
        success: true,
        data: {
          user_name: sharedInsight.user_name,
          coffee_reading_data: sharedInsight.coffee_reading_data,
          image_url: sharedInsight.image_url,
          created_at: sharedInsight.created_at
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error getting shared coffee reading:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared coffee reading'
      });
    }
  }

  /**
   * Share palm reading - create shareable link
   */
  sharePalmReading = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { user_name, palm_reading_data, image_url } = req.body;

      if (!palm_reading_data) {
        return res.status(400).json({
          success: false,
          message: 'Palm reading data is required'
        });
      }

      // Create shared insight
      const sharedInsight = new SharedInsight({
        user_id: userObjectId,
        user_name: user_name || 'Anonymous',
        type: 'palm',
        palm_reading_data,
        image_url,
        is_public: true
      });

      await sharedInsight.save();

      res.json({
        success: true,
        data: {
          shareId: sharedInsight.share_id,
          isPublic: true
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error sharing palm reading:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share palm reading'
      });
    }
  }

  /**
   * Get shared palm reading (public access - no auth required)
   */
  getSharedPalmReading = async (req, res) => {
    try {
      const { shareId } = req.params;

      const sharedInsight = await SharedInsight.findOne({
        share_id: shareId,
        type: 'palm',
        is_public: true
      }).lean();

      if (!sharedInsight) {
        return res.status(404).json({
          success: false,
          message: 'Shared palm reading not found or is private'
        });
      }

      // Increment view count
      await SharedInsight.updateOne(
        { share_id: shareId },
        { $inc: { view_count: 1 } }
      );

      res.json({
        success: true,
        data: {
          user_name: sharedInsight.user_name,
          palm_reading_data: sharedInsight.palm_reading_data,
          image_url: sharedInsight.image_url,
          created_at: sharedInsight.created_at
        }
      });

    } catch (error) {
      console.error('[SharedInsightController] Error getting shared palm reading:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared palm reading'
      });
    }
  }

  /**
   * Delete shared insight (owner only)
   */
  deleteSharedInsight = async (req, res) => {
    try {
      const userId = req.user.userId;
      const userObjectId = toObjectId(userId);
      const { shareId } = req.params;

      const result = await SharedInsight.findOneAndDelete({
        share_id: shareId,
        user_id: userObjectId
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Shared insight not found or you do not have permission'
        });
      }

      res.json({
        success: true,
        message: 'Shared insight deleted successfully'
      });

    } catch (error) {
      console.error('[SharedInsightController] Error deleting shared insight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shared insight'
      });
    }
  }
}

module.exports = new SharedInsightController();
