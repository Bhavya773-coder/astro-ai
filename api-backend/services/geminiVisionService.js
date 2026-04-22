const axios = require('axios');

class GeminiVisionService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-flash-latest';
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    
    console.log(`[GeminiVisionService] Initialized with model: ${this.model}`);
    console.log(`[GeminiVisionService] API Key present: ${this.apiKey ? 'Yes (first 10 chars: ' + this.apiKey.substring(0, 10) + '...)' : 'NO - MISSING!'}`);
  }

  buildPrompt(readingType, userProfile) {
    const sunSign = userProfile?.sun_sign || userProfile?.birth_chart_data?.sun_sign || 'Unknown';
    const moonSign = userProfile?.moon_sign || userProfile?.birth_chart_data?.moon_sign || 'Unknown';
    const ascendant = userProfile?.ascendant || userProfile?.birth_chart_data?.ascendant || 'Unknown';
    const lifePath = userProfile?.life_path || userProfile?.numerology_data?.life_path || 'Unknown';
    const dateOfBirth = userProfile?.date_of_birth || 'Unknown';

    switch (readingType) {
      case 'palm':
        return `You are an expert palmist and Vedic astrologer with 30 years of experience. Analyze this palm image. User profile: Sun Sign: ${sunSign}, Moon Sign: ${moonSign}, Life Path: ${lifePath}, DOB: ${dateOfBirth}. Respond ONLY with valid JSON: { hand_type, overall_summary, life_line, heart_line, head_line, fate_line, sun_line, mount_of_venus, vitality_score (1-5 int), love_score (1-5 int), career_score (1-5 int), lucky_color, lucky_number (int), key_prediction }`;

      case 'coffee':
        return `You are a master tasseographer with expertise in Turkish and Greek coffee reading. Examine this coffee cup image. User: Sun Sign: ${sunSign}, Moon Sign: ${moonSign}. Respond ONLY with valid JSON: { cup_overview, symbols_identified (array of { symbol, position, meaning }), love_fortune, career_fortune, health_fortune, travel_fortune, warning (string or null), overall_fortune, lucky_number (int), time_frame, special_message }`;

      case 'face':
        return `You are a master physiognomist with expertise in Chinese Mian Xiang and Western physiognomy. Analyze this face image. User: Sun Sign: ${sunSign}, Ascendant: ${ascendant}, DOB: ${dateOfBirth}. Respond ONLY with valid JSON: { face_shape, element_type, overall_aura, forehead_reading, eyes_reading, nose_reading, mouth_reading, chin_reading, dominant_strength, hidden_trait, life_purpose_hint, compatible_with, personality_scores: { leadership (int), creativity (int), empathy (int), ambition (int), spirituality (int) }, special_marking (string or null) }`;

      default:
        throw new Error(`Unknown reading type: ${readingType}`);
    }
  }

  async generateReading({ imageBase64, mimeType, readingType, userProfile }) {
    try {
      const prompt = this.buildPrompt(readingType, userProfile);

      const requestBody = {
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      };

      console.log(`[GeminiVisionService] Sending request to ${this.baseUrl}`);
      console.log(`[GeminiVisionService] Image data length: ${imageBase64?.length || 0} chars`);

      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        requestBody,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 seconds timeout for large images
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error('[GeminiVisionService] No text in response:', JSON.stringify(response.data, null, 2));
        throw new Error('No content received from Gemini API');
      }

      console.log(`[GeminiVisionService] Raw response length: ${text.length} chars`);
      console.log(`[GeminiVisionService] First 200 chars: ${text.substring(0, 200)}...`);

      // Strip markdown code fences and parse JSON
      let cleanedText = text
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      // Try to fix truncated JSON by finding the last complete object
      try {
        return JSON.parse(cleanedText);
      } catch (parseErr) {
        console.log('[GeminiVisionService] JSON parse failed, attempting to fix truncated response...');
        
        // Try to find a complete JSON object by matching braces
        let braceCount = 0;
        let lastValidIndex = 0;
        for (let i = 0; i < cleanedText.length; i++) {
          if (cleanedText[i] === '{') braceCount++;
          else if (cleanedText[i] === '}') {
            braceCount--;
            if (braceCount === 0) lastValidIndex = i + 1;
          }
        }
        
        if (lastValidIndex > 0) {
          const truncatedText = cleanedText.substring(0, lastValidIndex);
          console.log(`[GeminiVisionService] Trying truncated JSON (length: ${truncatedText.length})...`);
          return JSON.parse(truncatedText);
        }
        
        throw parseErr;
      }
    } catch (err) {
      console.error(`[GeminiVisionService] Error generating ${readingType} reading:`);
      console.error('  Message:', err.message);
      
      if (err.response) {
        console.error('  Status:', err.response.status);
        console.error('  Data:', JSON.stringify(err.response.data, null, 2));
      }
      
      throw new Error(`Failed to generate ${readingType} reading: ${err.message}`);
    }
  }
}

// Export singleton instance
module.exports = new GeminiVisionService();
