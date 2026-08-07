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

      // 1. CHECK + DEDUCT CREDITS (1 credit for StyleForecaster reading)
      const user = await User.findById(userId);
      const CREDIT_COST = 1;
      
      const isForceRegenerate = req.body.force === true;
      const hasUserUploadedPhoto = !!req.body.image_base64;

      console.log(`[DressingStylerController] Request payload: force=${isForceRegenerate}, hasPhoto=${hasUserUploadedPhoto}, occasion=${req.body.occasion || 'none'}`);

      // If not force-regenerate AND no new photo uploaded, return existing cached suggestion if available
      if (!isForceRegenerate && !hasUserUploadedPhoto && existingSuggestion?.generated_image_base64) {
        console.log('[DressingStylerController] Returning cached suggestion for today (no photo uploaded)');
        return res.json({
          success: true,
          data: {
            headline: existingSuggestion.headline,
            outfit_description: existingSuggestion.alternative_outfit_description || existingSuggestion.overview,
            alternative_outfit_description: existingSuggestion.alternative_outfit_description || existingSuggestion.overview,
            colors: existingSuggestion.colors || [],
            color_names: existingSuggestion.color_names || [],
            image_base64: existingSuggestion.generated_image_base64 || null,
            astrological_reason: existingSuggestion.astrological_reason,
            mood_energy: existingSuggestion.mood_energy,
            date: today,
            user_photo_base64: existingSuggestion.user_photo_base64 || null,
            current_outfit_rating: existingSuggestion.current_outfit_rating || null,
            plus_points: existingSuggestion.plus_points || [],
            current_outfit_summary: existingSuggestion.current_outfit_summary || '',
            occasion: existingSuggestion.occasion || existingSuggestion.selected_context || 'Date Night',
            interactive_state: {
              selected_context: existingSuggestion.selected_context,
              selected_modifier: existingSuggestion.selected_modifier,
              vibe_selection: existingSuggestion.vibe_selection,
              outfit_score: existingSuggestion.outfit_score
            }
          },
          credits_remaining: user?.credits || 0,
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
        work_setting: req.body.context || existingSuggestion?.selected_context || profile.style_preferences?.work_setting || 'Daily Wear',
        style_vibe: req.body.modifier || existingSuggestion?.selected_modifier || profile.style_preferences?.style_vibe || 'Authentic Self',
        fit_preference: req.body.vibe || existingSuggestion?.vibe_selection || profile.style_preferences?.fit_preference || 'Standard',
        avoid_colors: profile.style_preferences?.avoid_colors || 'None'
      };

      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                     currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                     currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

      const geminiApiKey = process.env.GEMINI_STYLE_API_KEY || process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({
          success: false,
          message: 'AI service not configured.'
        });
      }
      if (process.env.GEMINI_STYLE_API_KEY) {
        console.log('[DressingStylerController] Using dedicated GEMINI_STYLE_API_KEY for Style Forecaster');
      }

      const userUploadedPhoto = req.body.image_base64 || null;
      const targetOccasion = req.body.occasion || req.body.context || 'Date Night';

      let styleData = null;
      let facialBlueprint = "balanced natural features";

      if (userUploadedPhoto) {
        console.log('[DressingStylerController] Analyzing uploaded user outfit & face photo...');
        const cleanBase64 = userUploadedPhoto.replace(/^data:image\/\w+;base64,/, '');

        const photoPrompt = `You are an expert celebrity fashion stylist and Vedic astrology charm forecaster.
The user has provided a photo showing their face and current outfit.
Target Occasion: ${targetOccasion}
User Info: Name: ${userContext.full_name}, Gender: ${userContext.gender}, Age: ${userContext.age}
Astrology: Sun Sign: ${userContext.sun_sign}, Moon Sign: ${userContext.moon_sign}, Ascendant: ${userContext.ascendant}, Life Path: ${userContext.life_path}
Season: ${season}

Analyze the photo and perform:
1. RATE CURRENT OUTFIT: Give a score (1-100) on how well their current outfit aligns with today's astrological charm & vibe for ${targetOccasion}.
2. PLUS POINTS: Provide 2-4 key positive highlights (e.g. "+15 Sky Blue Jeans align with Venus transit today", "+10 Black shirt absorbs chaotic Rahu energy").
3. CONCISE SUMMARY: Provide a VERY CONCISE 1-2 sentence note evaluating the current look. DO NOT over-explain or write long details about their current clothes.
4. ALTERNATIVE OUTFIT SUGGESTION: Suggest an alternative outfit recommendation they can wear for ${targetOccasion} that maximizes their astrological charm today.
5. FORENSIC FACIAL BLUEPRINT: Describe the person's face structure, hair style/color, skin tone, eyes, facial features, and body posture in 2-3 dense sentences so an AI image generator can reproduce this exact person.

Respond ONLY with valid JSON:
{
  "current_outfit_rating": 88,
  "plus_points": ["+15 Sky Blue Jeans align with Venus transit today", "+10 Black top balances Mars energy"],
  "current_outfit_summary": "Solid casual look with strong Venusian color harmony.",
  "headline": "Cosmic Date Night Ensemble",
  "outfit_description": "A tailored dark navy velvet blazer with sky blue dress shirt, charcoal trousers, and subtle silver wrist accents.",
  "colors": ["#1D2A44", "#87CEEB", "#36454F", "#C0C0C0"],
  "color_names": ["Midnight Velvet Navy", "Cosmic Sky Blue", "Charcoal Slate", "Lunar Silver"],
  "astrological_reason": "Venus in Taurus activates your house of attraction, making sky blue and royal navy your prime magnetic frequencies today.",
  "mood_energy": "Magnetic Date Night Charm",
  "facial_blueprint": "Exact facial structure, skin tone, hair style, and features extracted from the photo"
}`;

        const visionCandidateModels = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.6-flash'];
        for (const modelName of visionCandidateModels) {
          try {
            console.log(`[DressingStylerController] Trying Vision analysis with model ${modelName}...`);
            const visionResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
              {
                contents: [{
                  parts: [
                    { inline_data: { mime_type: req.body.mime_type || 'image/jpeg', data: cleanBase64 } },
                    { text: photoPrompt }
                  ]
                }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
              },
              { headers: { 'Content-Type': 'application/json' }, timeout: 40000 }
            );

            const textPart = visionResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = textPart.match(/```json\s*([\s\S]*?)\s*```/) || textPart.match(/{[\s\S]*}/);
            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : textPart;
            styleData = JSON.parse(jsonStr);
            if (styleData?.facial_blueprint) {
              facialBlueprint = styleData.facial_blueprint;
            }
            console.log(`[DressingStylerController] Vision analysis SUCCESS with model ${modelName}`);
            break;
          } catch (visionErr) {
            console.warn(`[DressingStylerController] Vision model ${modelName} failed (${visionErr.response?.status || visionErr.message}). Trying next fallback...`);
          }
        }
      }

      // Fallback if no photo or vision call failed
      if (!styleData) {
        const styleAnalysisPrompt = `You are a professional fashion stylist with deep knowledge of Vedic astrology.
Generate a detailed outfit description for this person:
- Name: ${userContext.full_name}, Gender: ${userContext.gender}, Age: ${userContext.age}
- Sun Sign: ${userContext.sun_sign}, Moon Sign: ${userContext.moon_sign}, Ascendant: ${userContext.ascendant}
- Life Path Number: ${userContext.life_path}
- Target Occasion: ${targetOccasion}
- Style Vibe: ${userContext.style_vibe}
- Season: ${season}

Respond ONLY with valid JSON:
{
  "current_outfit_rating": 85,
  "plus_points": ["+15 Color alignment with planetary transit", "+10 Natural elemental balance"],
  "current_outfit_summary": "Harmonious daily ensemble aligned with cosmic transits.",
  "headline": "5-8 word creative headline",
  "outfit_description": "Detailed 3-4 sentence description of alternative garments, fabrics, and cuts for ${targetOccasion}.",
  "colors": ["#4B0082", "#FFD700", "#FF6B6B", "#4ECDC4"],
  "color_names": ["Cosmic Indigo", "Solar Gold", "Mars Red", "Aquarian Teal"],
  "astrological_reason": "2 sentences explanation.",
  "mood_energy": "Strong Cosmic Balance"
}`;

        const textCandidateModels = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.5-flash'];
        for (const modelName of textCandidateModels) {
          try {
            console.log(`[DressingStylerController] Trying text analysis with model ${modelName}...`);
            const textResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
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
            console.log(`[DressingStylerController] Text analysis SUCCESS with model ${modelName}`);
            break;
          } catch (apiError) {
            console.warn(`[DressingStylerController] Text model ${modelName} failed (${apiError.response?.status || apiError.message}).`);
          }
        }

        if (!styleData) {
          console.error('[DressingStylerController] All text/vision analysis models failed.');
          return res.status(500).json({
            success: false,
            message: 'Unable to analyze photo or generate style forecast at this time. Gemini API model error.'
          });
        }
      }

      const {
        headline,
        outfit_description,
        colors,
        color_names,
        astrological_reason,
        mood_energy,
        current_outfit_rating,
        plus_points,
        current_outfit_summary
      } = styleData;

      let base64ImageData = null;
      const enhancedImagePrompt = userUploadedPhoto
        ? `High resolution full-body fashion photography of the EXACT SAME PERSON from this facial blueprint: ${facialBlueprint}.
CRITICAL IDENTITY DIRECTIVE: Strictly maintain this person's exact face, facial structure, skin tone, hair style, and body shape without changing their face or identity.
OUTFIT: Wearing ${outfit_description}.
SETTING: Styled background appropriate for ${targetOccasion}.
STYLE: Photorealistic 8k fashion magazine style photo of the user wearing their alternative outfit.`
        : `A high-end 2x2 fashion collage showing the same person in 4 distinct full-body poses.
MODEL BLUEPRINT: Strictly replicate this person - ${facialBlueprint}. They are a ${userContext.gender} age ${userContext.age}.
STYLE: ${outfit_description}. ALL panels are Head-to-Toe Full Body shots. [Seed: ${Date.now()}]`;

      const finalImagePrompt = enhancedImagePrompt;

      const imageCandidateModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image', 'gemini-3-pro-image'];
      for (const imageModel of imageCandidateModels) {
        try {
          console.log(`[DressingStylerController] Generating image with model ${imageModel}...`);
          const imageParts = [];
          if (userUploadedPhoto) {
            const cleanUserBase64 = userUploadedPhoto.replace(/^data:image\/\w+;base64,/, '');
            imageParts.push({
              inline_data: {
                mime_type: req.body.mime_type || 'image/jpeg',
                data: cleanUserBase64
              }
            });
          }
          imageParts.push({
            text: `VIRTUAL TRY-ON MANDATE:
1. PRESERVE EVERYTHING IN THE INPUT PHOTO: Keep the exact same person, exact face, facial features, facial expression, eye color, hair style and hair color, skin tone, body pose, posture, background environment, camera angle, and lighting.
2. REPLACE ONLY THE CLOTHING: Replace the clothes currently worn in the photo with this new recommended outfit: ${outfit_description}.
3. The generated photo MUST look like the EXACT same person in the EXACT same photo, wearing the updated outfit.`
          });

          const imageResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`,
            { contents: [{ parts: imageParts }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 65000 }
          );

          const parts = imageResponse.data?.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(p => p.inlineData || p.inline_data);
          if (imagePart) {
            const dataObj = imagePart.inlineData || imagePart.inline_data;
            base64ImageData = dataObj.data || null;
            if (base64ImageData) {
              console.log(`[DressingStylerController] Image generation SUCCESS with model ${imageModel}! Data length: ${base64ImageData.length}`);
              break;
            }
          }
        } catch (imageError) {
          console.warn(`[DressingStylerController] Image model ${imageModel} failed (${imageError.response?.status || imageError.message}). Trying next fallback...`);
        }
      }

      // 7. SAVE TO DATABASE
      const savedSuggestion = await DressingSuggestion.findOneAndUpdate(
        { user_id: userObjectId, date: today },
        {
          headline,
          overview: outfit_description,
          alternative_outfit_description: outfit_description,
          color_palette: (color_names || []).join(', '),
          astrological_reason,
          mood_energy,
          colors: colors || [],
          color_names: color_names || [],
          generated_image_base64: base64ImageData,
          image_prompt_used: finalImagePrompt,
          user_photo_base64: userUploadedPhoto || null,
          current_outfit_rating: current_outfit_rating || 85,
          plus_points: plus_points || [],
          current_outfit_summary: current_outfit_summary || '',
          occasion: targetOccasion,
          selected_context: targetOccasion,
          selected_modifier: req.body.modifier || 'Standard',
          vibe_selection: req.body.vibe || 'Standard',
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
          alternative_outfit_description: outfit_description,
          colors: colors || [],
          color_names: color_names || [],
          image_base64: base64ImageData,
          astrological_reason,
          mood_energy,
          date: today,
          user_photo_base64: userUploadedPhoto || null,
          current_outfit_rating: current_outfit_rating || 85,
          plus_points: plus_points || [],
          current_outfit_summary: current_outfit_summary || '',
          occasion: targetOccasion,
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

      res.json({
        success: true,
        data: {
          headline: suggestion.headline,
          outfit_description: suggestion.alternative_outfit_description || suggestion.overview,
          alternative_outfit_description: suggestion.alternative_outfit_description || suggestion.overview,
          colors: suggestion.colors || [],
          color_names: suggestion.color_names || [],
          image_base64: suggestion.generated_image_base64 || null,
          astrological_reason: suggestion.astrological_reason,
          mood_energy: suggestion.mood_energy,
          date: suggestion.date,
          user_photo_base64: suggestion.user_photo_base64 || null,
          current_outfit_rating: suggestion.current_outfit_rating || null,
          plus_points: suggestion.plus_points || [],
          current_outfit_summary: suggestion.current_outfit_summary || '',
          occasion: suggestion.occasion || suggestion.selected_context || 'Date Night',
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
