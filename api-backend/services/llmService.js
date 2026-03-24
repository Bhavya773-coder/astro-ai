const axios = require('axios');

class LLMService {
  constructor() {
    // Update to use Ollama's chat endpoint for OpenAI compatibility
    this.modelEndpoint = process.env.LLM_MODEL_ENDPOINT || 'http://localhost:11434/api/chat';
    this.modelName = process.env.LLM_MODEL_NAME || 'llama3:latest';
  }

  async callLLM(prompt, streamCallback = null) {
    try {
      console.log('Calling Ollama with model:', this.modelName);
      console.log('Endpoint:', this.modelEndpoint);
      console.log('Prompt length:', prompt.length, 'characters');
      console.log('Streaming enabled:', !!streamCallback);
      
      if (streamCallback) {
        // Try chat endpoint first, fallback to generate if needed
        console.log('🌊 Starting streaming request to Ollama...');
        
        try {
          const response = await axios.post(this.modelEndpoint, {
            model: this.modelName,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: true
          }, {
            timeout: 300000, // 5 minutes
            headers: {
              'Content-Type': 'application/json'
            },
            responseType: 'stream'
          });

          let fullResponse = '';
          let buffer = '';
          
          response.data.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                    const token = data.choices[0].delta.content;
                    fullResponse += token;
                    
                    // Send token to frontend immediately
                    streamCallback({
                      token,
                      fullResponse,
                      done: data.choices[0].finish_reason === 'stop'
                    });
                    
                    if (data.choices[0].finish_reason === 'stop') {
                      console.log('🌊 Streaming completed, total length:', fullResponse.length);
                    }
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming data:', parseError, 'Line:', line);
                }
              }
            }
          });

          return new Promise((resolve, reject) => {
            response.data.on('end', () => {
              // Convert to OpenAI-like format for compatibility
              resolve({
                choices: [{
                  message: {
                    content: fullResponse
                  }
                }]
              });
            });
            
            response.data.on('error', (error) => {
              console.error('Stream error:', error);
              reject(error);
            });
          });
          
        } catch (chatError) {
          console.log('⚠️ Chat endpoint failed, falling back to generate endpoint:', chatError.message);
          return this.callGenerateEndpoint(prompt, streamCallback);
        }
        
      } else {
        // Try chat endpoint first, fallback to generate if needed
        try {
          const response = await axios.post(this.modelEndpoint, {
            model: this.modelName,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: false
          }, {
            timeout: 300000, // 5 minutes
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('Ollama Response Status:', response.status);

          // Ollama chat endpoint returns response in OpenAI format
          if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
            return response.data;
          }

          throw new Error('Invalid response from Ollama chat endpoint');
          
        } catch (chatError) {
          console.log('⚠️ Chat endpoint failed, falling back to generate endpoint:', chatError.message);
          return this.callGenerateEndpoint(prompt, streamCallback);
        }
      }
      
    } catch (error) {
      console.error('LLM API Error:', error.message);
      
      // Log more details for debugging
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      }
      
      // If it's a connection error, provide a helpful message
      if (error.code === 'ECONNREFUSED') {
        console.error('LLM service is not running at', this.modelEndpoint);
        console.error('Please start Ollama service: ollama serve');
      }
      throw error;
    }
  }

  // Fallback method for /api/generate endpoint
  async callGenerateEndpoint(prompt, streamCallback = null) {
    console.log('🔄 Using fallback /api/generate endpoint');
    const generateEndpoint = this.modelEndpoint.replace('/api/chat', '/api/generate');
    
    if (streamCallback) {
      // Streaming mode with generate endpoint
      const response = await axios.post(generateEndpoint, {
        model: this.modelName,
        prompt: prompt,
        stream: true
      }, {
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });

      let fullResponse = '';
      let buffer = '';
      
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                const token = data.response;
                fullResponse += token;
                
                streamCallback({
                  token,
                  fullResponse,
                  done: data.done
                });
                
                if (data.done) {
                  console.log('🌊 Streaming completed (generate endpoint), total length:', fullResponse.length);
                }
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError, 'Line:', line);
            }
          }
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          resolve({
            choices: [{
              message: {
                content: fullResponse
              }
            }]
          });
        });
        
        response.data.on('error', (error) => {
          console.error('Stream error:', error);
          reject(error);
        });
      });
      
    } else {
      // Non-streaming mode with generate endpoint
      const response = await axios.post(generateEndpoint, {
        model: this.modelName,
        prompt: prompt,
        stream: false
      }, {
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Ollama Generate Response Status:', response.status);

      if (response.data && response.data.response) {
        return {
          choices: [{
            message: {
              content: response.data.response
            }
          }]
        };
      }

      console.log('Response structure:', Object.keys(response.data || {}));
      throw new Error('Invalid response from Ollama generate endpoint');
    }
  }

  async generateAstrologyInsights(userData) {
    try {
      const prompt = this.buildPrompt(userData);
      
      const response = await axios.post(this.modelEndpoint, {
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are an astrology and numerology expert. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices?.[0]?.message?.content;
      
      if (!content) {
        console.error('No content in LLM response:', response.data);
        throw new Error('No content received from LLM');
      }
      
      // Parse JSON response
      let insights;
      try {
        insights = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', content);
        console.error('Parse error:', parseError.message);
        throw new Error('Invalid response format from LLM');
      }

      // Validate response structure
      if (!insights.birth_chart_data || !insights.numerology_data) {
        throw new Error('Incomplete insights generated');
      }

      return insights;

    } catch (error) {
      console.error('LLM Service Error:', error.message);
      console.error('Full error details:', error);
      
      // Robust fallback that doesn't rely on external API
      console.log('Using fallback method for birth chart analysis');
      return this.getRobustBirthChartAnalysis(userData);
    }
  }

  // Robust fallback method
  getRobustBirthChartAnalysis(userData) {
    try {
      const sunSign = this.getSunSign(userData.date_of_birth);
      const sunSignProps = this.getZodiacProperties(sunSign);
      
      // Generate detailed analysis based on zodiac combinations
      const moonSign = this.getMoonSign(userData.date_of_birth);
      const moonSignProps = this.getZodiacProperties(moonSign);
      const ascendant = sunSign; // Simplified - using sun sign as ascendant
      const ascendantProps = this.getZodiacProperties(ascendant);
      
      console.log('Fallback analysis generated:', { sunSign, moonSign, ascendant });
      
      return {
        birth_chart_data: {
          sun_sign: sunSign,
          moon_sign: moonSign,
          ascendant: ascendant,
          dominant_planet: sunSignProps.ruler
        },
        numerology_data: {
          life_path: this.calculateLifePathNumber(userData.date_of_birth),
          destiny: "7",
          personal_year: "3"
        }
      };
    } catch (error) {
      console.error('Error in fallback method:', error);
      // Return minimal valid structure
      return {
        birth_chart_data: {
          sun_sign: 'Leo',
          moon_sign: 'Taurus',
          ascendant: 'Leo',
          dominant_planet: 'Sun'
        },
        numerology_data: {
          life_path: "7",
          destiny: "7",
          personal_year: "3"
        }
      };
    }
  }

  // Helper methods for robust birth chart analysis
  getMoonSign(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified moon sign calculation
    const moonSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const index = (day + month) % 12;
    return moonSigns[index];
  }

  getZodiacProperties(sign) {
    const zodiacData = {
      'Aries': { element: 'Fire', quality: 'Cardinal', ruler: 'Mars' },
      'Taurus': { element: 'Earth', quality: 'Fixed', ruler: 'Venus' },
      'Gemini': { element: 'Air', quality: 'Mutable', ruler: 'Mercury' },
      'Cancer': { element: 'Water', quality: 'Cardinal', ruler: 'Moon' },
      'Leo': { element: 'Fire', quality: 'Fixed', ruler: 'Sun' },
      'Virgo': { element: 'Earth', quality: 'Mutable', ruler: 'Mercury' },
      'Libra': { element: 'Air', quality: 'Cardinal', ruler: 'Venus' },
      'Scorpio': { element: 'Water', quality: 'Fixed', ruler: 'Pluto' },
      'Sagittarius': { element: 'Fire', quality: 'Mutable', ruler: 'Jupiter' },
      'Capricorn': { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn' },
      'Aquarius': { element: 'Air', quality: 'Fixed', ruler: 'Uranus' },
      'Pisces': { element: 'Water', quality: 'Mutable', ruler: 'Neptune' }
    };
    
    return zodiacData[sign] || { element: 'Unknown', quality: 'Unknown', ruler: 'Unknown' };
  }

  getSunSign(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    return "Pisces";
  }

  calculateLifePathNumber(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const sum = day + month + year;
    
    // Reduce to single digit
    let lifePath = sum;
    while (lifePath > 9 && lifePath !== 11 && lifePath !== 22 && lifePath !== 33) {
      lifePath = lifePath.toString().split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
    }

    return lifePath.toString();
  }

  buildPrompt(userData) {
    const { full_name, date_of_birth, time_of_birth, place_of_birth, gender, life_context, numerology_data } = userData;
    
    const contextInfo = life_context ? `
Life Context:
Career Stage: ${life_context.career_stage || 'Not specified'}
Relationship Status: ${life_context.relationship_status || 'Not specified'}
Main Life Focus: ${life_context.main_life_focus || 'Not specified'}
Personality Style: ${life_context.personality_style || 'Not specified'}
Primary Life Problem: ${life_context.primary_life_problem || 'Not specified'}` : '';

    return `Generate comprehensive astrology and numerology insights for:

Name: ${full_name}
Date of Birth: ${date_of_birth}
Time of Birth: ${time_of_birth || 'Not specified'}
Place of Birth: ${place_of_birth}
Gender: ${gender || 'Not specified'}

${contextInfo}

Numerology Data:
${numerology_data ? JSON.stringify(numerology_data, null, 2) : 'Not available'}

Please provide insights in JSON format with the following structure:
{
  "birth_chart_data": {
    "sun_sign": "Sign",
    "moon_sign": "Sign", 
    "ascendant": "Sign",
    "dominant_planet": "Planet"
  },
  "numerology_data": {
    "life_path": "Number",
    "destiny": "Number",
    "personal_year": "Number"
  }
}

Ensure all calculations are accurate and interpretations are personalized.`;
  }

  // Get detailed zodiac sign information
  async getZodiacSignInfo(userSign) {
    try {
      const prompt = `Please provide comprehensive information about zodiac sign ${userSign}. Include the following details in JSON format:
{
  "sign": "${userSign}",
  "element": "Fire/Earth/Air/Water",
  "quality": "Cardinal/Fixed/Mutable", 
  "ruler": "Ruling planet",
  "description": "Detailed description of sign's characteristics and traits",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2", "challenge3"],
  "compatibility": ["most_compatible1", "mostCompatible2", "mostCompatible3"],
  "career_suitability": ["career1", "career2", "career3"],
  "love_compatibility": ["compatible1", "compatible2", "compatible3"],
  "lucky_numbers": [number1, number2, number3],
  "lucky_colors": ["color1", "color2", "color3"],
  "mantra": "Personal mantra or affirmation",
  "elemental_traits": "How the element influences the sign",
  "symbol": "The zodiac symbol"
}

Focus on providing accurate, detailed, and insightful astrological information that would be valuable for someone with this zodiac sign.`;

      const response = await this.callLLM(prompt);
      
      if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
        try {
          const content = response.choices[0].message.content.trim();
          
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          
          // If JSON parsing fails, create a structured response
          return this.getZodiacFallbackInfo(userSign);
        } catch (parseError) {
          console.error('Error parsing zodiac info response:', parseError);
          return this.getZodiacFallbackInfo(userSign);
        }
      }
      
      return this.getZodiacFallbackInfo(userSign);
    } catch (error) {
      console.error('Error getting zodiac sign info:', error);
      return this.getZodiacFallbackInfo(userSign);
    }
  }

  // Generate detailed birth chart analysis
  async generateDetailedBirthChart(userData) {
    try {
      const prompt = this.buildDetailedBirthChartPrompt(userData);
      
      const response = await this.callLLM(prompt);
      
      if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
        try {
          const content = response.choices[0].message.content.trim();
          
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;
          }
          
          // If JSON parsing fails, return fallback data
          return this.getEnhancedDefaultBirthChart(userData);
        } catch (parseError) {
          console.error('Error parsing birth chart response:', parseError);
          return this.getEnhancedDefaultBirthChart(userData);
        }
      }
      
      return this.getEnhancedDefaultBirthChart(userData);
    } catch (error) {
      console.error('Error generating detailed birth chart:', error);
      return this.getEnhancedDefaultBirthChart(userData);
    }
  }

  // Enhanced default birth chart with more details
  getEnhancedDefaultBirthChart(userData) {
    const sunSign = this.getSunSign(userData.date_of_birth);
    const sunSignProps = this.getZodiacProperties(sunSign);
    
    // Generate detailed analysis based on zodiac combinations
    const moonSign = this.getMoonSign(userData.date_of_birth);
    const moonSignProps = this.getZodiacProperties(moonSign);
    const ascendant = this.getAscendant(userData.date_of_birth, userData.time_of_birth, userData.place_of_birth);
    const ascendantProps = this.getZodiacProperties(ascendant);
    
    return {
      enhanced_birth_chart_data: {
        sun_sign: {
          sign: sunSign,
          element: sunSignProps.element,
          quality: sunSignProps.quality,
          ruler: sunSignProps.ruler,
          description: `${sunSign} represents your core identity and life purpose. As a ${sunSignProps.element} sign, you embody ${sunSignProps.element.toLowerCase()} energy and ${sunSignProps.quality.toLowerCase()} characteristics.`
        },
        moon_sign: {
          sign: moonSign,
          element: moonSignProps.element,
          quality: moonSignProps.quality,
          ruler: moonSignProps.ruler,
          description: `${moonSign} represents your emotional nature and inner world. Your ${moonSignProps.element} moon sign provides emotional depth and intuitive wisdom.`
        },
        ascendant: {
          sign: ascendant,
          element: ascendantProps.element,
          quality: ascendantProps.quality,
          ruler: ascendantProps.ruler,
          description: `${ascendant} represents how others perceive you and your approach to life. Your ${ascendantProps.element} rising sign shapes your first impressions and social presence.`
        },
        dominant_planet: {
          planet: sunSignProps.ruler,
          sign: sunSign,
          element: sunSignProps.element,
          description: `Your dominant planet ${sunSignProps.ruler} strongly influences your personality and life path, providing ${sunSignProps.element.toLowerCase()} energy and ${sunSignProps.quality.toLowerCase()} characteristics.`
        }
      },
      detailed_analysis: {
        personality_overview: `As a ${sunSign} Sun with ${moonSign} Moon and ${ascendant} Ascendant, you possess a unique blend of ${sunSignProps.element.toLowerCase()} passion and ${moonSignProps.element.toLowerCase()} intuition. Your personality combines the creative self-expression of ${sunSign} with the emotional depth of ${moonSign} and the confident exterior of ${ascendant}.`,
        strengths: [
          `Natural ${sunSignProps.element.toLowerCase()} leadership and creative self-expression`,
          `Deep ${moonSignProps.element.toLowerCase()} intuition and emotional intelligence`,
          `Strong ${ascendantProps.element.toLowerCase()} presence and social confidence`,
          "Adaptability and versatility in different situations",
          "Natural charisma and ability to inspire others"
        ],
        challenges: [
          "Balancing emotional needs with external expectations",
          "Managing ego while maintaining harmonious relationships",
          "Avoiding impulsiveness in decision-making",
          "Developing patience with slower-paced processes"
        ],
        life_purpose: `Your life purpose involves expressing your unique ${sunSign} creativity while maintaining emotional authenticity. You're here to inspire others through your ${sunSignProps.element.toLowerCase()} passion and ${moonSignProps.element.toLowerCase()} wisdom, creating a bridge between dreams and reality.`,
        career_insights: `You thrive in careers that allow creative expression and leadership. Fields like arts, entertainment, entrepreneurship, or any role that combines ${sunSignProps.element.toLowerCase()} energy with practical application suit your ${sunSign}-${sunSignProps.quality} nature.`,
        relationship_insights: `In relationships, you seek both deep emotional connection and admiration. You're most compatible with partners who appreciate both your creative ${sunSign} nature and your need for ${moonSignProps.element.toLowerCase()} emotional security.`,
        spiritual_path: `Your spiritual journey involves balancing self-expression with inner wisdom. Developing your intuitive abilities while staying grounded in practical reality will lead to profound personal growth and spiritual enlightenment.`,
        timing_advice: `Current period favors creative projects and relationship building. Your ${moonSign} Moon suggests focusing on emotional security, while ${ascendant} Ascendant supports public recognition and career advancement.`
      },
      planetary_positions: {
        sun: { sign: sunSign, degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'sun') },
        moon: { sign: moonSign, degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'moon') },
        mercury: { sign: this.getMercurySign(userData.date_of_birth), degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'mercury') },
        venus: { sign: this.getVenusSign(userData.date_of_birth), degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'venus') },
        mars: { sign: this.getMarsSign(userData.date_of_birth), degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'mars') },
        jupiter: { sign: this.getJupiterSign(userData.date_of_birth), degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'jupiter') },
        saturn: { sign: this.getSaturnSign(userData.date_of_birth), degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'saturn') }
      },
      aspects: [
        { planets: ['Sun', 'Moon'], type: 'Conjunction', angle: 0, meaning: 'Harmony between conscious and unconscious' },
        { planets: ['Sun', 'Mercury'], type: 'Trine', angle: 120, meaning: 'Easy self-expression and communication' },
        { planets: ['Moon', 'Venus'], type: 'Sextile', angle: 60, meaning: 'Emotional harmony and aesthetic appreciation' },
        { planets: ['Mars', 'Jupiter'], type: 'Square', angle: 90, meaning: 'Tension between action and expansion' }
      ],
      houses: {
        1: { sign: ascendant, meaning: 'Self and identity' },
        2: { sign: this.getHouseSign(2, userData.date_of_birth), meaning: 'Values and possessions' },
        3: { sign: this.getHouseSign(3, userData.date_of_birth), meaning: 'Communication and thinking' },
        4: { sign: this.getHouseSign(4, userData.date_of_birth), meaning: 'Home and family' },
        5: { sign: this.getHouseSign(5, userData.date_of_birth), meaning: 'Creativity and romance' },
        6: { sign: this.getHouseSign(6, userData.date_of_birth), meaning: 'Work and service' },
        7: { sign: this.getHouseSign(7, userData.date_of_birth), meaning: 'Partnerships and relationships' },
        8: { sign: this.getHouseSign(8, userData.date_of_birth), meaning: 'Transformation and intimacy' },
        9: { sign: this.getHouseSign(9, userData.date_of_birth), meaning: 'Higher learning and philosophy' },
        10: { sign: this.getHouseSign(10, userData.date_of_birth), meaning: 'Career and public life' },
        11: { sign: this.getHouseSign(11, userData.date_of_birth), meaning: 'Friends and aspirations' },
        12: { sign: this.getHouseSign(12, userData.date_of_birth), meaning: 'Spirituality and unconscious' }
      },
      elements: {
        fire: { count: this.countElements(userData, 'fire'), meaning: 'Passion and inspiration' },
        earth: { count: this.countElements(userData, 'earth'), meaning: 'Stability and practicality' },
        air: { count: this.countElements(userData, 'air'), meaning: 'Intellect and communication' },
        water: { count: this.countElements(userData, 'water'), meaning: 'Emotion and intuition' }
      },
      modalities: {
        cardinal: { count: this.countModalities(userData, 'cardinal'), meaning: 'Initiation and leadership' },
        fixed: { count: this.countModalities(userData, 'fixed'), meaning: 'Stability and determination' },
        mutable: { count: this.countModalities(userData, 'mutable'), meaning: 'Adaptability and flexibility' }
      },
      dominant_patterns: {
        element: sunSignProps.element,
        modality: sunSignProps.quality,
        ruling_planet: sunSignProps.ruler
      }
    };
  }

  // Helper methods for enhanced birth chart
  getZodiacProperties(sign) {
    const zodiacData = {
      'Aries': { element: 'Fire', quality: 'Cardinal', ruler: 'Mars' },
      'Taurus': { element: 'Earth', quality: 'Fixed', ruler: 'Venus' },
      'Gemini': { element: 'Air', quality: 'Mutable', ruler: 'Mercury' },
      'Cancer': { element: 'Water', quality: 'Cardinal', ruler: 'Moon' },
      'Leo': { element: 'Fire', quality: 'Fixed', ruler: 'Sun' },
      'Virgo': { element: 'Earth', quality: 'Mutable', ruler: 'Mercury' },
      'Libra': { element: 'Air', quality: 'Cardinal', ruler: 'Venus' },
      'Scorpio': { element: 'Water', quality: 'Fixed', ruler: 'Pluto' },
      'Sagittarius': { element: 'Fire', quality: 'Mutable', ruler: 'Jupiter' },
      'Capricorn': { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn' },
      'Aquarius': { element: 'Air', quality: 'Fixed', ruler: 'Uranus' },
      'Pisces': { element: 'Water', quality: 'Mutable', ruler: 'Neptune' }
    };
    
    return zodiacData[sign] || { element: 'Unknown', quality: 'Unknown', ruler: 'Unknown' };
  }

  getSunSign(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    return "Pisces";
  }

  getMoonSign(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified moon sign calculation
    const moonSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const index = (day + month) % 12;
    return moonSigns[index];
  }

  getAscendant(dateOfBirth, timeOfBirth, placeOfBirth) {
    // Simplified ascendant calculation - in real astrology this would require complex calculations
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = (date.getDate() + (date.getMonth() + 1)) % 12;
    return signs[index];
  }

  calculatePlanetaryDegree(dateOfBirth, planet) {
    // Simplified degree calculation
    const date = new Date(dateOfBirth);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return (dayOfYear * 360 / 365) % 360;
  }

  getMercurySign(dateOfBirth) {
    const mercurySigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = date.getDate() % 12;
    return mercurySigns[index];
  }

  getVenusSign(dateOfBirth) {
    const venusSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = (date.getDate() + 6) % 12;
    return venusSigns[index];
  }

  getMarsSign(dateOfBirth) {
    const marsSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = (date.getDate() + 12) % 12;
    return marsSigns[index];
  }

  getJupiterSign(dateOfBirth) {
    const jupiterSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = (date.getDate() + 18) % 12;
    return jupiterSigns[index];
  }

  getSaturnSign(dateOfBirth) {
    const saturnSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = (date.getDate() + 24) % 12;
    return saturnSigns[index];
  }

  getHouseSign(houseNumber, dateOfBirth) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const date = new Date(dateOfBirth);
    const index = (date.getDate() + houseNumber) % 12;
    return signs[index];
  }

  countElements(userData, element) {
    // Simplified element counting based on sun sign
    const sunSign = this.getSunSign(userData.date_of_birth);
    const sunSignProps = this.getZodiacProperties(sunSign);
    return sunSignProps.element === element ? 2 : 1;
  }

  countModalities(userData, modality) {
    // Simplified modality counting based on sun sign
    const sunSign = this.getSunSign(userData.date_of_birth);
    const sunSignProps = this.getZodiacProperties(sunSign);
    return sunSignProps.quality === modality ? 2 : 1;
  }

  // Fallback method for zodiac info
  getZodiacFallbackInfo(userSign) {
    const fallbackData = {
      Aries: {
        sign: "Aries", element: "Fire", quality: "Cardinal", ruler: "Mars",
        description: "The first sign of the zodiac, representing new beginnings, courage, and pioneering spirit.",
        traits: ["Courageous", "Energetic", "Independent", "Impulsive", "Competitive"],
        strengths: ["Leadership", "Courage", "Determination", "Confidence"],
        challenges: ["Impatience", "Aggression", "Selfishness", "Impulsiveness"],
        compatibility: ["Leo", "Sagittarius", "Gemini"],
        career_suitability: ["Entrepreneur", "Athlete", "Military", "Sales"],
        love_compatibility: ["Leo", "Sagittarius", "Aquarius"],
        lucky_numbers: [1, 9, 17], lucky_colors: ["Red", "Orange"], symbol: "♈",
        mantra: "I am the pioneer of new beginnings", elemental_traits: "Fiery, passionate, initiating energy"
      },
      Taurus: {
        sign: "Taurus", element: "Earth", quality: "Fixed", ruler: "Venus",
        description: "The sign of stability, patience, and material comfort, representing earthly pleasures and security.",
        traits: ["Reliable", "Patient", "Practical", "Loyal", "Stubborn"],
        strengths: ["Reliability", "Patience", "Practicality", "Loyalty"],
        challenges: ["Stubbornness", "Possessiveness", "Resistance to change", "Materialism"],
        compatibility: ["Virgo", "Capricorn", "Cancer"],
        career_suitability: ["Banking", "Real Estate", "Agriculture", "Art"],
        love_compatibility: ["Virgo", "Capricorn", "Pisces"],
        lucky_numbers: [2, 6, 14], lucky_colors: ["Green", "Pink"], symbol: "♉",
        mantra: "I build lasting foundations of security and comfort", elemental_traits: "Grounded, sensual, stabilizing energy"
      },
      Gemini: {
        sign: "Gemini", element: "Air", quality: "Mutable", ruler: "Mercury",
        description: "The sign of communication, adaptability, and intellectual curiosity, representing duality and versatility.",
        traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Inconsistent"],
        strengths: ["Versatility", "Communication", "Intelligence", "Adaptability"],
        challenges: ["Inconsistency", "Nervousness", "Superficiality", "Indecisiveness"],
        compatibility: ["Libra", "Aquarius", "Aries"],
        career_suitability: ["Journalism", "Teaching", "Sales", "Public Relations"],
        love_compatibility: ["Libra", "Aquarius", "Leo"],
        lucky_numbers: [5, 14, 23], lucky_colors: ["Yellow", "Light Blue"], symbol: "♊",
        mantra: "I communicate ideas and connect with diverse perspectives", elemental_traits: "Mental, social, adaptable energy"
      },
      Cancer: {
        sign: "Cancer", element: "Water", quality: "Cardinal", ruler: "Moon",
        description: "The sign of emotion, nurturing, and intuition, representing home, family, and deep feelings.",
        traits: ["Emotional", "Intuitive", "Protective", "Moody", "Sympathetic"],
        strengths: ["Intuition", "Loyalty", "Empathy", "Protectiveness"],
        challenges: ["Moodiness", "Over-sensitivity", "Clinginess", "Defensiveness"],
        compatibility: ["Scorpio", "Pisces", "Taurus"],
        career_suitability: ["Healthcare", "Hospitality", "Real Estate", "Counseling"],
        love_compatibility: ["Scorpio", "Pisces", "Virgo"],
        lucky_numbers: [2, 7, 11], lucky_colors: ["White", "Silver"], symbol: "♋",
        mantra: "I create emotional security and nurture those I love", elemental_traits: "Nurturing, intuitive, protective energy"
      },
      Leo: {
        sign: "Leo", element: "Fire", quality: "Fixed", ruler: "Sun",
        description: "The sign of creativity, leadership, and self-expression, representing royalty and dramatic flair.",
        traits: ["Creative", "Passionate", "Generous", "Arrogant", "Fixed"],
        strengths: ["Leadership", "Creativity", "Generosity", "Confidence"],
        challenges: ["Arrogance", "Stubbornness", "Egotism", "Drama"],
        compatibility: ["Aries", "Sagittarius", "Gemini"],
        career_suitability: ["Entertainment", "Management", "Politics", "Creative Arts"],
        love_compatibility: ["Aries", "Sagittarius", "Libra"],
        lucky_numbers: [1, 4, 10], lucky_colors: ["Gold", "Orange"], symbol: "♌",
        mantra: "I shine my light and inspire others through creative self-expression", elemental_traits: "Creative, confident, generous energy"
      },
      Virgo: {
        sign: "Virgo", element: "Earth", quality: "Mutable", ruler: "Mercury",
        description: "The sign of perfection, service, and analytical thinking, representing purity and practical wisdom.",
        traits: ["Analytical", "Helpful", "Reliable", "Precise", "Critical"],
        strengths: ["Analytical", "Reliability", "Practicality", "Helpfulness"],
        challenges: ["Criticalness", "Perfectionism", "Worry", "Overthinking"],
        compatibility: ["Taurus", "Capricorn", "Cancer"],
        career_suitability: ["Healthcare", "Research", "Accounting", "Editing"],
        love_compatibility: ["Taurus", "Capricorn", "Scorpio"],
        lucky_numbers: [5, 14, 23], lucky_colors: ["Navy", "Gray"], symbol: "♍",
        mantra: "I analyze, organize, and perfect to serve with practical wisdom", elemental_traits: "Earthy, analytical, service-oriented energy"
      },
      Libra: {
        sign: "Libra", element: "Air", quality: "Cardinal", ruler: "Venus",
        description: "The sign of balance, harmony, and relationships, representing justice and aesthetic appreciation.",
        traits: ["Diplomatic", "Fair-minded", "Social", "Indecisive", "Cooperative"],
        strengths: ["Diplomacy", "Fairness", "Social grace", "Cooperation"],
        challenges: ["Indecisiveness", "People-pleasing", "Avoidance of conflict", "Superficiality"],
        compatibility: ["Gemini", "Aquarius", "Leo"],
        career_suitability: ["Law", "Diplomacy", "Art", "Human Resources"],
        love_compatibility: ["Gemini", "Aquarius", "Sagittarius"],
        lucky_numbers: [6, 15, 24], lucky_colors: ["Pink", "Light Blue"], symbol: "♎",
        mantra: "I create balance and harmony in all my relationships", elemental_traits: "Social, harmonious, justice-oriented energy"
      },
      Scorpio: {
        sign: "Scorpio", element: "Water", quality: "Fixed", ruler: "Pluto",
        description: "The sign of transformation, intensity, and mystery, representing depth and psychological insight.",
        traits: ["Passionate", "Stubborn", "Resourceful", "Brave", "Jealous"],
        strengths: ["Passion", "Resourcefulness", "Bravery", "Determination"],
        challenges: ["Jealousy", "Stubbornness", "Secrecy", "Intensity"],
        compatibility: ["Cancer", "Pisces", "Virgo"],
        career_suitability: ["Psychology", "Research", "Detective", "Surgery"],
        love_compatibility: ["Cancer", "Pisces", "Capricorn"],
        lucky_numbers: [8, 11, 18], lucky_colors: ["Dark Red", "Black"], symbol: "♏",
        mantra: "I transform through depth and embrace profound change", elemental_traits: "Intense, transformative, mysterious energy"
      },
      Sagittarius: {
        sign: "Sagittarius", element: "Fire", quality: "Mutable", ruler: "Jupiter",
        description: "The sign of exploration, philosophy, and optimism, representing freedom and higher learning.",
        traits: ["Generous", "Idealistic", "Humorous", "Adventurous", "Impatient"],
        strengths: ["Optimism", "Generosity", "Philosophical mind", "Adventure"],
        challenges: ["Impatience", "Restlessness", "Bluntness", "Irresponsibility"],
        compatibility: ["Aries", "Leo", "Libra"],
        career_suitability: ["Travel", "Publishing", "Education", "Philosophy"],
        love_compatibility: ["Aries", "Leo", "Aquarius"],
        lucky_numbers: [3, 9, 21], lucky_colors: ["Purple", "Turquoise"], symbol: "♐",
        mantra: "I explore horizons and seek higher wisdom through experience", elemental_traits: "Expansive, optimistic, freedom-loving energy"
      },
      Capricorn: {
        sign: "Capricorn", element: "Earth", quality: "Cardinal", ruler: "Saturn",
        description: "The sign of ambition, discipline, and structure, representing achievement and worldly success.",
        traits: ["Responsible", "Disciplined", "Self-control", "Know-it-all", "Unforgiving"],
        strengths: ["Discipline", "Ambition", "Reliability", "Practicality"],
        challenges: ["Pessimism", "Rigidity", "Workaholism", "Emotional distance"],
        compatibility: ["Taurus", "Virgo", "Scorpio"],
        career_suitability: ["Business", "Finance", "Management", "Engineering"],
        love_compatibility: ["Taurus", "Virgo", "Pisces"],
        lucky_numbers: [8, 10, 22], lucky_colors: ["Brown", "Dark Green"], symbol: "♑",
        mantra: "I build lasting structures through discipline and persistence", elemental_traits: "Ambitious, practical, structural energy"
      },
      Aquarius: {
        sign: "Aquarius", element: "Air", quality: "Fixed", ruler: "Uranus",
        description: "The sign of innovation, humanitarianism, and rebellion, representing progress and social consciousness.",
        traits: ["Progressive", "Original", "Independent", "Humanitarian", "Unemotional"],
        strengths: ["Innovation", "Independence", "Humanitarianism", "Originality"],
        challenges: ["Emotional detachment", "Rebellion", "Unpredictability", "Stubbornness"],
        compatibility: ["Gemini", "Libra", "Sagittarius"],
        career_suitability: ["Technology", "Science", "Social Work", "Innovation"],
        love_compatibility: ["Gemini", "Libra", "Aries"],
        lucky_numbers: [4, 11, 22], lucky_colors: ["Electric Blue", "Silver"], symbol: "♒",
        mantra: "I innovate for humanity and embrace progressive change", elemental_traits: "Intellectual, unconventional, progressive energy"
      },
      Pisces: {
        sign: "Pisces", element: "Water", quality: "Mutable", ruler: "Neptune",
        description: "The sign of spirituality, compassion, and imagination, representing dreams and artistic sensitivity.",
        traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Fearful"],
        strengths: ["Compassion", "Intuition", "Artistic sensitivity", "Empathy"],
        challenges: ["Fearfulness", "Escapism", "Over-sensitivity", "Victim mentality"],
        compatibility: ["Cancer", "Scorpio", "Capricorn"],
        career_suitability: ["Arts", "Music", "Spiritual work", "Healing"],
        love_compatibility: ["Cancer", "Scorpio", "Taurus"],
        lucky_numbers: [7, 12, 16], lucky_colors: ["Sea Green", "Lavender"], symbol: "♓",
        mantra: "I flow with cosmic intuition and express divine compassion", elemental_traits: "Spiritual, compassionate, imaginative energy"
      }
    };
    
    return fallbackData[userSign] || fallbackData.Aries;
  }

  // Add the missing buildDetailedBirthChartPrompt method
  buildDetailedBirthChartPrompt(userData) {
    const { full_name, date_of_birth, time_of_birth, place_of_birth, gender, life_context, numerology_data, existing_birth_chart_data } = userData;
    
    const contextInfo = life_context ? `
Life Context:
Career Stage: ${life_context.career_stage || 'Not specified'}
Relationship Status: ${life_context.relationship_status || 'Not specified'}
Main Life Focus: ${life_context.main_life_focus || 'Not specified'}
Personality Style: ${life_context.personality_style || 'Not specified'}
Primary Life Problem: ${life_context.primary_life_problem || 'Not specified'}` : '';

    return `Generate a detailed birth chart analysis for:

Name: ${full_name}
Date of Birth: ${date_of_birth}
Time of Birth: ${time_of_birth || 'Not specified'}
Place of Birth: ${place_of_birth}
Gender: ${gender || 'Not specified'}

${contextInfo}

Numerology Data:
${numerology_data ? JSON.stringify(numerology_data, null, 2) : 'Not available'}

Existing Birth Chart Data:
${existing_birth_chart_data ? JSON.stringify(existing_birth_chart_data, null, 2) : 'Not available'}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "enhanced_birth_chart_data": {
    "sun_sign": { "sign": "Sign", "element": "Element", "quality": "Quality", "ruler": "Ruler", "description": "Description" },
    "moon_sign": { "sign": "Sign", "element": "Element", "quality": "Quality", "ruler": "Ruler", "description": "Description" },
    "ascendant": { "sign": "Sign", "element": "Element", "quality": "Quality", "ruler": "Ruler", "description": "Description" },
    "dominant_planet": { "planet": "Planet", "sign": "Sign", "element": "Element", "description": "Description" }
  },
  "detailed_analysis": {
    "personality_overview": "Detailed personality overview",
    "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3", "Challenge 4"],
    "life_purpose": "Life purpose description",
    "career_insights": "Career guidance",
    "relationship_insights": "Relationship compatibility and patterns",
    "spiritual_path": "Spiritual development path",
    "timing_advice": "Current timing and future guidance"
  }
}

Ensure all interpretations are personalized, insightful, and based on the actual birth data provided.`;
  }

  async generateDailyHoroscope(zodiacSign, currentDate) {
    try {
      const prompt = `Generate a daily horoscope for ${zodiacSign} for ${currentDate}. 
      
Provide only these essential fields in JSON format:
{
  "zodiac_sign": "${zodiacSign}",
  "date": "${currentDate}",
  "overall_theme": "2-3 words describing today's cosmic energy",
  "mood": "1-2 words for emotional state",
  "energy_level": "High/Medium/Low",
  "lucky_number": "1-9",
  "lucky_color": "one color",
  "key_areas": {
    "love": "brief love guidance (15 words max)",
    "career": "brief career guidance (15 words max)",
    "health": "brief health guidance (15 words max)",
    "finance": "brief finance guidance (15 words max)"
  },
  "advice": "one key advice (20 words max)",
  "warning": "one gentle warning (15 words max)",
  "opportunity": "one opportunity (15 words max)",
  "lucky_time": "best time of day"
}

Keep responses very brief and concise. Focus on practical guidance.
Respond with valid JSON only.`;

      console.log('Calling Ollama for simplified daily horoscope generation...');
      const response = await axios.post(this.modelEndpoint, {
        model: this.modelName,
        prompt: prompt,
        stream: false
      }, {
        timeout: 60000, // 1 minute for simplified horoscope
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Ollama Horoscope Response Status:', response.status);
      
      if (response.data && response.data.response) {
        // Parse the JSON response from Ollama
        try {
          const horoscopeData = JSON.parse(response.data.response);
          console.log('Successfully parsed simplified AI horoscope for', zodiacSign);
          return horoscopeData;
        } catch (parseError) {
          console.error('Failed to parse AI horoscope response:', parseError);
          console.log('Raw response:', response.data.response);
          throw new Error('Invalid JSON format in AI response');
        }
      }

      throw new Error('Invalid response from Ollama for horoscope generation');
      
    } catch (error) {
      console.error('Error generating AI horoscope:', error.message);
      throw error;
    }
  }
}

module.exports = new LLMService();
