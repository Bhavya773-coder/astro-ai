const mongoose = require('mongoose');
const axios = require('axios');
const Profile = require('../models/Profile');
const DressingSuggestion = require('../models/DressingSuggestion');
const User = require('../models/User');
const ImageReading = require('../models/ImageReading');

/**
 * Dressing Styler Controller
 * Generates personalized daily clothing suggestions using AI with image generation
 */
class DressingStylerController {

  /**
   * Generate a personalized dressing suggestion for the day with image
   * POST /api/dressing-styler/generate
   */
  generateSuggestion = async (req, res) => {
    try {
      const userId = req.user.userId;
      const today = new Date().toISOString().split('T')[0];

      console.log('[DressingStylerController] Generating suggestion for user:', userId);

      const userObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      // Check if already has a suggestion for today (for response flag)
      const existingSuggestion = await DressingSuggestion.findOne({
        user_id: userObjectId,
        date: today
      });
      const isRegeneration = !!(existingSuggestion?.generated_image_base64 || existingSuggestion?.generated_image_url);

      // 1. CHECK + DEDUCT CREDITS (5 credits for this premium feature)
      const user = await User.findById(userId);
      const CREDIT_COST = 5;
      
      const isForceRegenerate = req.body.force === true;

      // If not force-regenerate, check if already generated today
      if (!isForceRegenerate && existingSuggestion?.generated_image_base64) {
        return res.json({
          success: true,
          data: {
            headline: existingSuggestion.headline,
            outfit_description: existingSuggestion.overview,
            colors: existingSuggestion.colors || [],
            color_names: existingSuggestion.color_names || [],
            image_base64: existingSuggestion.generated_image_base64 || null,
            astrological_reason: existingSuggestion.astrological_reason,
            mood_energy: existingSuggestion.mood_energy,
            date: today,
            interactive_state: {
              selected_context: existingSuggestion.selected_context,
              selected_modifier: existingSuggestion.selected_modifier,
              vibe_selection: existingSuggestion.vibe_selection,
              outfit_score: existingSuggestion.outfit_score
            }
          },
          credits_remaining: user.credits,
          is_regeneration: false
        });
      }

      console.log(`[DressingStyler] Checking credits for ${user?.email || userId}. Balance: ${user?.credits}`);

      if (!user || user.credits < CREDIT_COST) {
        console.warn(`[DressingStyler] Insufficient credits for ${user?.email || userId}. Required: ${CREDIT_COST}, Balance: ${user?.credits || 0}`);
        return res.status(402).json({
          success: false,
          message: `Not enough credits. This feature requires ${CREDIT_COST} credits.`,
          code: 'INSUFFICIENT_CREDITS',
          credits: user?.credits || 0
        });
      }

      // Deduct credits and get updated count
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: -CREDIT_COST } },
        { new: true }
      );
      const remainingCredits = updatedUser.credits;
      console.log(`[DressingStylerController] ${CREDIT_COST} credits deducted. Remaining: ${remainingCredits}`);

      // 3. GET USER PROFILE
      const profile = await Profile.findOne({ user_id: userId });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found. Please complete your profile first.'
        });
      }

      // 4. GET USER STYLE PREFERENCES AND FACE READING DATA
      let faceReadingData = null;
      let stylePreferences = null;
      
      try {
        // Fetch Style Preferences from Profile
        const userProfile = await Profile.findOne({ user_id: userObjectId });
        if (userProfile && userProfile.style_preferences) {
          stylePreferences = userProfile.style_preferences;
          console.log('[DressingStylerController] Found style preferences for user:', userId);
        }

        // Fetch Face Reading Record (including raw image)
        const latestFaceReading = await ImageReading.findOne({ 
          user_id: userObjectId, 
          reading_type: 'face' 
        }).sort({ created_at: -1 });

        if (latestFaceReading && latestFaceReading.result) {
          faceReadingData = {
            ...latestFaceReading.result,
            imageBase64: latestFaceReading.image_data,
            mimeType: latestFaceReading.mime_type
          };
          console.log('[DressingStylerController] Found face reading and raw image for likeness matching.');
        }
      } catch (prefErr) {
        console.warn('[DressingStylerController] Could not fetch profile or face reading:', prefErr.message);
      }

      // 4. BUILD STYLE CONTEXT
      // Calculate age from date_of_birth
      let age = null;
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      const userContext = {
        full_name: profile.full_name,
        gender: profile.gender || 'unspecified',
        age: age || 'adult',
        sun_sign: profile.birth_chart_data?.sun_sign || 'Unknown',
        moon_sign: profile.birth_chart_data?.moon_sign || 'Unknown',
        ascendant: profile.birth_chart_data?.ascendant || 'Unknown',
        life_path: profile.numerology_data?.life_path || 'Unknown',
        work_setting: existingSuggestion?.selected_context || profile.style_preferences?.work_setting || 'Daily Wear',
        style_vibe: existingSuggestion?.selected_modifier || profile.style_preferences?.style_vibe || 'Authentic Self',
        fit_preference: existingSuggestion?.vibe_selection || profile.style_preferences?.fit_preference || 'Standard',
        avoid_colors: profile.style_preferences?.avoid_colors || 'None'
      };

      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                     currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                     currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

      // 5. STEP A - Generate style analysis text using Gemini
      const faceContext = faceReadingData 
        ? `- Physical Traits: Has a ${faceReadingData.face_shape} face shape with ${faceReadingData.eyes}. Their nose is ${faceReadingData.nose} and mouth is ${faceReadingData.mouth}. They have a ${faceReadingData.overall_aura} aura.`
        : '';

      const styleAnalysisPrompt = `You are a professional fashion stylist with deep knowledge of Vedic astrology and physiognomy.
Generate a detailed outfit description for this person:
- Name: ${userContext.full_name}
- Gender: ${userContext.gender}
- Age: ${userContext.age} years old
${faceContext}
- Sun Sign: ${userContext.sun_sign}, Moon Sign: ${userContext.moon_sign}, Ascendant: ${userContext.ascendant}
- Life Path Number: ${userContext.life_path}
- Today's Setting: ${userContext.work_setting}
- Style Vibe: ${userContext.style_vibe}
- Fit Preference: ${userContext.fit_preference}
- User Vibe: ${stylePreferences?.style_vibe || 'Modern & Balanced'}
- Preferred Fit: ${stylePreferences?.fit_preference || 'Standard'}
- Work Setting: ${stylePreferences?.work_setting || 'General'}
- Accessory Level: ${stylePreferences?.accessory_level || 'Moderate'}
- Avoid: ${stylePreferences?.avoid_colors || userContext.avoid_colors}
- Season: ${season}

Based on today's astrological forecast and their physical/astrological persona, create a personalized style recommendation that strictly aligns with their preferences.

Respond ONLY with valid JSON:
{
  "headline": "5-8 word creative headline",
  "outfit_description": "Detailed 3-4 sentence description of garments, fabrics, and cuts.",
  "colors": ["#hexcode1", "#hexcode2", "#hexcode3", "#hexcode4"],
  "color_names": ["Color 1", "Color 2", "Color 3", "Color 4"],
  "astrological_reason": "2 sentences explanation.",
  "mood_energy": "3-5 word vibe",
  "image_prompt": "Prompt for image generator"
}`;

      console.log('[DressingStylerController] Calling Gemini for style analysis...');

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({
          success: false,
          message: 'AI service not configured.'
        });
      }

      const geminiModel = 'gemini-flash-latest';
      let styleData;
      try {
        const textResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
          {
            contents: [{ parts: [{ text: styleAnalysisPrompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
        );

        const textPart = textResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = textPart.match(/```json\s*([\s\S]*?)\s*```/) || textPart.match(/{[\s\S]*}/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : textPart;
        styleData = JSON.parse(jsonStr);
      } catch (apiError) {
        console.error('[DressingStylerController] Gemini API error:', apiError.message);
        styleData = {
          headline: `Cosmic Style for ${userContext.sun_sign}`,
          outfit_description: `A sophisticated ensemble featuring colors aligned with your ${userContext.sun_sign} energy.`,
          colors: ['#4B0082', '#FFD700', '#FF6B6B', '#4ECDC4'],
          color_names: ['Cosmic Indigo', 'Solar Gold', 'Mars Red', 'Aquarian Teal'],
          astrological_reason: `As a ${userContext.sun_sign}, these colors align with your energy.`,
          mood_energy: 'Strong Cosmic Balance'
        };
      }

      const { headline, outfit_description, colors, color_names, astrological_reason, mood_energy, image_prompt } = styleData;

      let base64ImageData = null;
      let finalImagePrompt = image_prompt || headline;
      let facialBlueprint = "balanced features";

      // NEW: Deep Vision Likeness Decoding
      if (faceReadingData?.imageBase64) {
        try {
          console.log('[DressingStylerController] Decoding facial features for likeness...');
          const visionResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
              contents: [{
                parts: [
                  { inline_data: { mime_type: faceReadingData.mimeType || 'image/jpeg', data: faceReadingData.imageBase64 } },
                  { text: "Act as a forensic facial artist. Describe this person's face in extreme, technical detail for a high-end AI image generator. Focus on: facial structure, eye shape and color, nose bridge, lip fullness, hair texture, and skin undertones. Provide the description in 3-4 dense sentences." }
                ]
              }]
            }
          );
          facialBlueprint = visionResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "natural features";
        } catch (visionErr) {
          console.warn('[DressingStylerController] Facial decoding failed, falling back to reading results:', visionErr.message);
          facialBlueprint = `${faceReadingData.face_shape} face with ${faceReadingData.eyes_reading} eyes and ${faceReadingData.nose_reading} nose.`;
        }
      }

      const enhancedImagePrompt = `A high-end 2x2 fashion collage showing the same person in 4 distinct full-body poses.
MODEL BLUEPRINT: Strictly replicate this person - ${facialBlueprint}. They are a ${userContext.gender} age ${userContext.age}.
QUADRANT COLOR ASSIGNMENTS:
- Panel 1 (Top-Left): Full-body outfit strictly dominant in ${color_names[0]} (${colors[0]}).
- Panel 2 (Top-Right): Full-body outfit strictly dominant in ${color_names[1]} (${colors[1]}).
- Panel 3 (Bottom-Left): Full-body outfit strictly dominant in ${color_names[2]} (${colors[2]}).
- Panel 4 (Bottom-Right): Full-body outfit strictly dominant in ${color_names[3]} (${colors[3]}).
STYLE: ${outfit_description}. ALL panels are Head-to-Toe Full Body shots.
LAYOUT: Single image, symmetrical 4-panel grid. [Seed: ${Date.now()}]`;

      finalImagePrompt = enhancedImagePrompt;

        try {
          console.log('[DressingStylerController] Calling Imagen 4.0 Fast (Production)...');
          const imageModel = 'imagen-4.0-fast-generate-001';

          const imageResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${geminiApiKey}`,
            {
              instances: [{ prompt: enhancedImagePrompt }],
              parameters: { 
                sampleCount: 1
              }
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
          );

        const prediction = imageResponse.data?.predictions?.[0];
        base64ImageData = prediction?.bytesBase64Encoded || prediction?.image?.bytesBase64Encoded;

        if (base64ImageData) {
          console.log('[DressingStylerController] Imagen 3.0 image generated successfully.');
        } else {
          console.warn('[DressingStylerController] No image data in prediction response');
        }
      } catch (imageError) {
        console.error('[DressingStylerController] Image generation failed:');
        console.error(' - Status:', imageError.response?.status);
        console.error(' - Data:', JSON.stringify(imageError.response?.data, null, 2));
        console.error(' - Message:', imageError.message);
      }

      // 7. SAVE TO DATABASE
      const savedSuggestion = await DressingSuggestion.findOneAndUpdate(
        { user_id: userObjectId, date: today },
        {
          headline,
          overview: outfit_description,
          color_palette: color_names.join(', '),
          lucky_item: '',
          astrological_reason,
          mood_energy,
          colors,
          color_names,
          generated_image_base64: base64ImageData,
          image_prompt_used: finalImagePrompt,
          created_at: new Date()
        },
        { upsert: true, new: true }
      );

      console.log('[DressingStylerController] Suggestion saved for user:', userId);

      // 8. RETURN RESPONSE
      res.json({
        success: true,
        data: {
          headline,
          outfit_description,
          colors,
          color_names,
          image_base64: base64ImageData,
          astrological_reason,
          mood_energy,
          date: today,
          interactive_state: {
            selected_context: savedSuggestion.selected_context,
            selected_modifier: savedSuggestion.selected_modifier,
            vibe_selection: savedSuggestion.vibe_selection,
            outfit_score: savedSuggestion.outfit_score
          }
        },
        credits_remaining: remainingCredits,
        is_regeneration: isRegeneration
      });

    } catch (error) {
      console.error('[DressingStylerController] Error generating suggestion:', error);

      if (error.response?.status === 503 || error.message?.includes('UNAVAILABLE')) {
        return res.status(503).json({
          success: false,
          message: 'AI service is temporarily busy. Please try again in a moment.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to generate dressing suggestion',
        error: error.message
      });
    }
  }

  /**
   * Get today's dressing suggestion (if exists)
   * GET /api/dressing-styler/today
   */
  getTodaySuggestion = async (req, res) => {
    try {
      const userId = req.user.userId;
      const today = new Date().toISOString().split('T')[0];

      const suggestion = await DressingSuggestion.findOne({
        user_id: userId,
        date: today
      });

      if (!suggestion) {
        return res.json({
          success: true,
          data: null,
          message: 'No suggestion generated yet today'
        });
      }

      // Return new response shape with image and colors
      res.json({
        success: true,
        data: {
          headline: suggestion.headline,
          outfit_description: suggestion.overview,
          colors: suggestion.colors || [],
          color_names: suggestion.color_names || [],
          image_base64: suggestion.generated_image_base64 || null,
          astrological_reason: suggestion.astrological_reason,
          mood_energy: suggestion.mood_energy,
          date: suggestion.date,
          interactive_state: {
            selected_context: suggestion.selected_context,
            selected_modifier: suggestion.selected_modifier,
            vibe_selection: suggestion.vibe_selection,
            outfit_score: suggestion.outfit_score
          }
        }
      });

    } catch (error) {
      console.error('[DressingStylerController] Error getting today suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get today suggestion'
      });
    }
  }

  /**
   * Get suggestion history
   * GET /api/dressing-styler/history
   */
  getHistory = async (req, res) => {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 7;

      const history = await DressingSuggestion.find({
        user_id: userId
      })
        .sort({ date: -1 })
        .limit(limit);

      res.json({
        success: true,
        data: history,
        count: history.length
      });

    } catch (error) {
      console.error('[DressingStylerController] Error getting history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestion history'
      });
    }
  }

  /**
   * Update interaction state for today's suggestion
   * POST /api/dressing-styler/interact
   */
  updateInteraction = async (req, res) => {
    try {
      const userId = req.user.userId;
      const today = new Date().toISOString().split('T')[0];
      const { selected_context, selected_modifier, vibe_selection, outfit_score } = req.body;

      const update = {};
      if (selected_context) update.selected_context = selected_context;
      if (selected_modifier) update.selected_modifier = selected_modifier;
      if (vibe_selection) update.vibe_selection = vibe_selection;
      if (outfit_score) update.outfit_score = outfit_score;

      const suggestion = await DressingSuggestion.findOneAndUpdate(
        { user_id: userId, date: today },
        { $set: update },
        { new: true }
      );

      if (!suggestion) {
        return res.status(404).json({
          success: false,
          message: 'No suggestion found for today'
        });
      }

      res.json({
        success: true,
        data: {
          interactive_state: {
            selected_context: suggestion.selected_context,
            selected_modifier: suggestion.selected_modifier,
            vibe_selection: suggestion.vibe_selection,
            outfit_score: suggestion.outfit_score
          }
        }
      });

    } catch (error) {
      console.error('[DressingStylerController] Interaction update error:', error);
      res.status(500).json({ success: false, message: 'Failed to update interaction' });
    }
  }
}

module.exports = new DressingStylerController();
