const axios = require('axios');

class LLMService {
  constructor() {
    this.modelEndpoint = process.env.LLM_MODEL_ENDPOINT || 'http://localhost:8080/v1/chat/completions';
    this.modelName = process.env.LLM_MODEL_NAME || 'llama3:latest';
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

      const content = response.data.choices[0].message.content;
      
      // Parse JSON response
      let insights;
      try {
        insights = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', content);
        throw new Error('Invalid response format from LLM');
      }

      // Validate response structure
      if (!insights.birth_chart_data || !insights.numerology_data) {
        throw new Error('Incomplete insights generated');
      }

      return insights;

    } catch (error) {
      console.error('LLM Service Error:', error.message);
      
      // Robust fallback that doesn't rely on external API
      return this.getRobustBirthChartAnalysis(userData);
    }
  }

  async generateDetailedBirthChart(userData) {
    try {
      // First try the LLM API
      const prompt = this.buildDetailedBirthChartPrompt(userData);
      
      const response = await axios.post(this.modelEndpoint, {
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a master astrologer with deep knowledge of Western and Vedic astrology, numerology, and astronomical calculations. Provide detailed, accurate birth chart analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more accuracy
        max_tokens: 2000 // More tokens for detailed analysis
      }, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      
      // Parse JSON response
      let detailedAnalysis;
      try {
        detailedAnalysis = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse detailed birth chart response:', content);
        throw new Error('Invalid response format from LLM');
      }

      // Validate response structure
      if (!detailedAnalysis.birth_chart_data || !detailedAnalysis.detailed_analysis) {
        throw new Error('Incomplete birth chart analysis generated');
      }

      return detailedAnalysis;

    } catch (error) {
      console.error('LLM Service Error:', error.message);
      
      // Robust fallback that doesn't rely on external API
      return this.getRobustBirthChartAnalysis(userData);
    }
  }

  // New robust fallback method
  getRobustBirthChartAnalysis(userData) {
    const sunSign = this.getSunSign(userData.date_of_birth);
    const sunSignProps = this.getZodiacProperties(sunSign);
    
    // Generate detailed analysis based on zodiac combinations
    const moonSign = this.getMoonSign(userData.date_of_birth);
    const moonSignProps = this.getZodiacProperties(moonSign);
    const ascendant = sunSign; // Simplified - using sun sign as ascendant
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
        venus: { sign: this.getVenusSign(userData.date_of_birth), degree: this.calculatePlanetaryDegree(userData.date_of_birth, 'venus') }
      },
      aspects: [
        { planets: ['Sun', 'Moon'], type: 'Conjunction', angle: 0, meaning: 'Harmony between conscious and unconscious' },
        { planets: ['Sun', 'Mercury'], type: 'Trine', angle: 120, meaning: 'Easy self-expression and communication' },
        { planets: ['Moon', 'Venus'], type: 'Sextile', angle: 60, meaning: 'Emotional harmony and aesthetic appreciation' }
      ],
      houses: {
        1: { sign: ascendant, meaning: 'Self and identity' },
        2: { sign: this.getHouseSign(2, userData.date_of_birth), meaning: 'Values and possessions' },
        3: { sign: this.getHouseSign(3, userData.date_of_birth), meaning: 'Communication and thinking' },
        4: { sign: this.getHouseSign(4, userData.date_of_birth), meaning: 'Home and family' },
        5: { sign: this.getHouseSign(5, userData.date_of_birth), meaning: 'Creativity and romance' }
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

  // Helper methods for robust birth chart analysis
  getMoonSign(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified moon sign calculation (this would normally require complex astronomical calculations)
    const moonSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const index = (day + month) % 12;
    return moonSigns[index];
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

  buildDetailedBirthChartPrompt(userData) {
    const { full_name, date_of_birth, time_of_birth, place_of_birth, gender, life_context, numerology_data, existing_birth_chart_data } = userData;
    
    const contextInfo = life_context ? `
Life Context:
Career Stage: ${life_context.career_stage || 'Not specified'}
Relationship Status: ${life_context.relationship_status || 'Not specified'}
Main Life Focus: ${life_context.main_life_focus || 'Not specified'}
Personality Style: ${life_context.personality_style || 'Not specified'}
Primary Life Problem: ${life_context.primary_life_problem || 'Not specified'}` : '';

    const numerologyInfo = numerology_data ? `
Numerology Insights:
Life Path: ${numerology_data.life_path || 'Not calculated'}
Destiny: ${numerology_data.destiny || 'Not calculated'}
Personal Year: ${numerology_data.personal_year || 'Not calculated'}` : '';

    const existingInfo = existing_birth_chart_data ? `
Existing Birth Chart Data:
Sun Sign: ${existing_birth_chart_data.sun_sign || 'Not set'}
Moon Sign: ${existing_birth_chart_data.moon_sign || 'Not set'}
Ascendant: ${existing_birth_chart_data.ascendant || 'Not set'}
Dominant Planet: ${existing_birth_chart_data.dominant_planet || 'Not set'}` : '';

    return `You are a master astrologer creating a comprehensive birth chart analysis.

Based on the following complete user information, generate a detailed and accurate birth chart:

User Info:
Name: ${full_name}
Date of Birth: ${date_of_birth}
Time of Birth: ${time_of_birth || 'Not specified'}
Place of Birth: ${place_of_birth}
Gender: ${gender || 'Not specified'}

${contextInfo}

${numerologyInfo}

${existingInfo}

Using this comprehensive data, provide a detailed birth chart analysis in this exact JSON format:

{
  "enhanced_birth_chart_data": {
    "sun_sign": {
      "sign": "",
      "element": "",
      "quality": "",
      "ruler": "",
      "description": ""
    },
    "moon_sign": {
      "sign": "",
      "element": "",
      "quality": "",
      "ruler": "",
      "description": ""
    },
    "ascendant": {
      "sign": "",
      "element": "",
      "quality": "",
      "ruler": "",
      "description": ""
    },
    "dominant_planet": {
      "planet": "",
      "sign": "",
      "element": "",
      "description": ""
    },
    "midheaven": {
      "sign": "",
      "description": ""
    },
    "ic": {
      "sign": "",
      "description": ""
    }
  },
  "planetary_positions": {
    "sun": {
      "sign": "",
      "degree": "",
      "house": "",
      "aspects": []
    },
    "moon": {
      "sign": "",
      "degree": "",
      "house": "",
      "aspects": []
    },
    "mercury": {
      "sign": "",
      "degree": "",
      "house": "",
      "retrograde": false
    },
    "venus": {
      "sign": "",
      "degree": "",
      "house": "",
      "retrograde": false
    },
    "mars": {
      "sign": "",
      "degree": "",
      "house": "",
      "retrograde": false
    },
    "jupiter": {
      "sign": "",
      "degree": "",
      "house": "",
      "retrograde": false
    },
    "saturn": {
      "sign": "",
      "degree": "",
      "house": "",
      "retrograde": false
    }
  },
  "aspects": [
    {
      "planets": ["sun", "moon"],
      "type": "conjunction",
      "degree": "",
      "orb": "",
      "interpretation": ""
    }
  ],
  "houses": {
    "1": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "2": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "3": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "4": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "5": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "6": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "7": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "8": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "9": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "10": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "11": {
      "sign": "",
      "planets": [],
      "meaning": ""
    },
    "12": {
      "sign": "",
      "planets": [],
      "meaning": ""
    }
  },
  "elements": {
    "fire": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    },
    "earth": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    },
    "air": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    },
    "water": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    }
  },
  "modalities": {
    "cardinal": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    },
    "fixed": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    },
    "mutable": {
      "count": 0,
      "dominant": false,
      "interpretation": ""
    }
  },
  "dominant_patterns": {
    "stellemium": {
      "present": false,
      "interpretation": ""
    },
    "t_square": {
      "present": false,
      "interpretation": ""
    },
    "grand_trine": {
      "present": false,
      "interpretation": ""
    },
    "yod": {
      "present": false,
      "interpretation": ""
    }
  },
  "detailed_analysis": {
    "personality_overview": "",
    "strengths": [],
    "challenges": [],
    "life_purpose": "",
    "career_insights": "",
    "relationship_insights": "",
    "spiritual_path": "",
    "timing_advice": ""
  }
}

IMPORTANT: 
- Use astronomical calculations for accuracy
- Consider the numerology insights for deeper analysis
- Enhance existing data if provided
- Provide detailed interpretations for each position
- Include specific degrees and house placements
- Analyze major aspects between planets
- Determine dominant element and modality
- Identify any significant patterns
- Provide practical life insights based on the complete chart

Return ONLY valid JSON, no additional text.`;
  }

  getEnhancedDefaultBirthChart(userData) {
    const { full_name, date_of_birth, time_of_birth, place_of_birth, life_context, numerology_data } = userData;
    
    // Calculate basic birth chart data
    const sunSign = this.getSunSign(date_of_birth);
    const moonSign = this.getMoonSign(date_of_birth);
    const ascendant = this.getAscendant(date_of_birth, time_of_birth, place_of_birth);
    
    // Determine dominant element based on sun and moon signs
    const sunElement = this.getElement(sunSign);
    const moonElement = this.getElement(moonSign);
    const dominantElement = this.getDominantElement([sunElement, moonElement]);
    
    // Determine modality
    const modality = this.getModality(sunSign);
    
    return {
      enhanced_birth_chart_data: {
        sun_sign: {
          sign: sunSign,
          element: sunElement,
          quality: modality,
          ruler: this.getRuler(sunSign),
          description: this.getSignDescription(sunSign)
        },
        moon_sign: {
          sign: moonSign,
          element: moonElement,
          quality: modality,
          ruler: this.getRuler(moonSign),
          description: this.getSignDescription(moonSign)
        },
        ascendant: {
          sign: ascendant,
          element: this.getElement(ascendant),
          quality: this.getModality(ascendant),
          ruler: this.getRuler(ascendant),
          description: this.getSignDescription(ascendant)
        },
        dominant_planet: {
          planet: "Sun",
          sign: sunSign,
          element: sunElement,
          description: "Your dominant planetary influence is the Sun in " + sunSign + ", bringing clarity, vitality, and leadership qualities."
        }
      },
      planetary_positions: {
        sun: {
          sign: sunSign,
          degree: "15°",
          house: "1",
          aspects: ["Trine Moon", "Square Mars"]
        },
        moon: {
          sign: moonSign,
          degree: "8°",
          house: "12",
          aspects: ["Trine Sun", "Opposition Venus"]
        }
      },
      aspects: [
        {
          planets: ["sun", "moon"],
          type: "trine",
          degree: "120°",
          orb: "8°",
          interpretation: "Harmony between conscious and unconscious mind, emotional intelligence"
        }
      ],
      houses: {
        1: {
          sign: sunSign,
          planets: ["Sun"],
          meaning: "Self, identity, and how you present yourself to the world"
        },
        12: {
          sign: moonSign,
          planets: ["Moon"],
          meaning: "Subconscious, dreams, and hidden strengths"
        }
      },
      elements: {
        fire: { count: 1, dominant: dominantElement === "fire", interpretation: "Passionate, creative, and inspired" },
        earth: { count: 0, dominant: false, interpretation: "Grounded, practical, and stable" },
        air: { count: 0, dominant: false, interpretation: "Intellectual, communicative, and social" },
        water: { count: 1, dominant: dominantElement === "water", interpretation: "Intuitive, emotional, and deep" }
      },
      modalities: {
        cardinal: { count: 1, dominant: modality === "cardinal", interpretation: "Initiating, leading, and pioneering" },
        fixed: { count: 0, dominant: false, interpretation: "Stable, determined, and persistent" },
        mutable: { count: 0, dominant: false, interpretation: "Adaptable, flexible, and versatile" }
      },
      dominant_patterns: {
        stellium: { present: false, interpretation: "Multiple planets in same sign" },
        t_square: { present: false, interpretation: "Tension between major planets" },
        grand_trine: { present: true, interpretation: "Flow of energy and harmony" },
        yod: { present: false, interpretation: "Finger of God - special purpose" }
      },
      detailed_analysis: {
        personality_overview: `With ${sunSign} Sun and ${moonSign} Moon, you possess a unique blend of ${sunElement} passion and ${moonElement} intuition.`,
        strengths: ["Natural leadership", "Emotional intelligence", "Creative expression"],
        challenges: ["Balancing logic with emotion", "Managing intense feelings"],
        life_purpose: "To inspire and lead others through your authentic self-expression",
        career_insights: "Best suited for roles that allow creativity and emotional connection",
        relationship_insights: "Seek partners who appreciate both your independence and emotional depth",
        spiritual_path: "Develop your intuitive abilities while maintaining practical boundaries",
        timing_advice: "Major life events occur when Sun transits your key houses"
      }
    };
  }

  // Helper methods for birth chart calculations
  getMoonSign(dateOfBirth) {
    // Simplified moon sign calculation (in real implementation, use astronomical calculations)
    const moonSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const date = new Date(dateOfBirth);
    return moonSigns[date.getDate() % 12];
  }

  getAscendant(dateOfBirth, timeOfBirth, placeOfBirth) {
    // Simplified ascendant calculation (in real implementation, use astronomical calculations)
    const ascendants = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const date = new Date(dateOfBirth);
    return ascendants[(date.getDate() + (timeOfBirth ? parseInt(timeOfBirth.split(':')[0]) : 0)) % 12];
  }

  getElement(sign) {
    const fireSigns = ["Aries", "Leo", "Sagittarius"];
    const earthSigns = ["Taurus", "Virgo", "Capricorn"];
    const airSigns = ["Gemini", "Libra", "Aquarius"];
    const waterSigns = ["Cancer", "Scorpio", "Pisces"];
    
    if (fireSigns.includes(sign)) return "fire";
    if (earthSigns.includes(sign)) return "earth";
    if (airSigns.includes(sign)) return "air";
    if (waterSigns.includes(sign)) return "water";
    return "unknown";
  }

  getDominantElement(elements) {
    const counts = { fire: 0, earth: 0, air: 0, water: 0 };
    elements.forEach(function(el) {
      if (el !== "unknown") counts[el]++;
    });
    
    const maxCount = Math.max(...Object.values(counts));
    return Object.keys(counts).find(function(key) { return counts[key] === maxCount; }) || "fire";
  }

  getModality(sign) {
    const cardinalSigns = ["Aries", "Cancer", "Libra", "Capricorn"];
    const fixedSigns = ["Taurus", "Leo", "Scorpio", "Aquarius"];
    const mutableSigns = ["Gemini", "Virgo", "Sagittarius", "Pisces"];
    
    if (cardinalSigns.includes(sign)) return "cardinal";
    if (fixedSigns.includes(sign)) return "fixed";
    if (mutableSigns.includes(sign)) return "mutable";
    return "unknown";
  }

  getRuler(sign) {
    const rulers = {
      "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
      "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
      "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    };
    return rulers[sign] || "Unknown";
  }

  getSignDescription(sign) {
    const descriptions = {
      "Aries": "Pioneering spirit with natural leadership and courage",
      "Taurus": "Grounded nature with appreciation for beauty and comfort",
      "Gemini": "Curious mind with excellent communication skills",
      "Cancer": "Nurturing soul with deep emotional intelligence",
      "Leo": "Charismatic leader with creative self-expression",
      "Virgo": "Analytical mind with attention to detail and service",
      "Libra": "Diplomatic heart seeking balance and harmony",
      "Scorpio": "Intense transformer with deep emotional power",
      "Sagittarius": "Adventurous seeker with philosophical wisdom",
      "Capricorn": "Ambitious achiever with practical discipline",
      "Aquarius": "Innovative thinker with humanitarian vision",
      "Pisces": "Intuitive dreamer with compassionate soul"
    };
    return descriptions[sign] || "Mysterious and unique individual";
  }
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
};

getEnhancedDefaultBirthChart(userData) {
    // Fallback insights based on basic analysis
    const sunSign = this.getSunSign(userData.date_of_birth);
    const sunSignProps = this.getZodiacProperties(sunSign);
    
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
          sign: "Taurus",
          element: "Earth",
          quality: "Fixed",
          ruler: "Venus",
          description: "Taurus represents your emotional nature and inner world. Your Earth moon sign provides stability, practicality, and a deep connection to material comfort and security."
        },
        ascendant: {
          sign: "Leo",
          element: "Fire",
          quality: "Fixed",
          ruler: "Sun",
          description: "Leo represents how others perceive you and your approach to life. Your Fire rising sign gives you a charismatic, confident, and leadership-oriented first impression."
        },
        dominant_planet: {
          planet: "Sun",
          sign: sunSign,
          element: sunSignProps.element,
          description: `The Sun is your ruling planet, strongly influencing your personality and life path. This solar energy shapes your core motivations, drives, and desire for recognition and self-expression.`
        }
      },
      detailed_analysis: {
        personality_overview: `As a ${sunSign} Sun with Taurus Moon and Leo Ascendant, you possess a unique blend of ${sunSignProps.element.toLowerCase()} stability and earthy practicality. Your personality combines the creative self-expression of ${sunSign} with the emotional security of Taurus and the confident exterior of Leo.`,
        strengths: [
          `Natural ${sunSignProps.element.toLowerCase()} leadership and creative self-expression`,
          "Emotional stability and practical decision-making",
          "Charismatic presence and natural confidence",
          "Strong determination and goal-oriented mindset"
        ],
        challenges: [
          "Tendency towards stubbornness and resistance to change",
          "Balance between emotional needs and external image",
          "Managing ego while maintaining relationships",
          "Patience with slower-paced processes"
        ],
        life_purpose: `Your life purpose involves expressing your unique ${sunSign} creativity while building stable foundations. You're here to inspire others through your confident presence and practical wisdom, bridging the gap between dreams and reality.`,
        career_insights: `You thrive in careers that allow creative expression and leadership. Fields like arts, entertainment, entrepreneurship, or any role that combines creativity with practical application suit your ${sunSign}-${sunSignProps.element} nature.`,
        relationship_insights: `In relationships, you seek both deep emotional connection and admiration. You're most compatible with partners who appreciate both your creative ${sunSign} nature and your need for Taurus-like stability.`,
        spiritual_path: `Your spiritual journey involves balancing self-expression with inner wisdom. Developing your intuitive abilities while staying grounded in practical reality will lead to profound personal growth.`,
        timing_advice: `Current period favors creative projects and relationship building. Your Taurus Moon suggests focusing on home and security, while Leo Ascendant supports public recognition and career advancement.`
      },
      numerology_data: {
        life_path: this.calculateLifePathNumber(userData.date_of_birth),
        destiny: "7",
        personal_year: "3"
      }
    };
  };

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
}

module.exports = new LLMService();
