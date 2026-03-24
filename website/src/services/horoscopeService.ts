/**
 * Horoscope Service
 * Fetches horoscopes from free horoscope API
 */

export interface HoroscopeData {
  sign: string;
  date: string;
  horoscope: string;
}

export interface HoroscopeResponse {
  success: boolean;
  data?: HoroscopeData;
  error?: string;
}

const HOROSCOPE_API_BASE = 'https://horoscope-app-api.vercel.app/api/v1/get-horoscope';

// Map common zodiac sign names to API format
const zodiacSignMap: { [key: string]: string } = {
  'aries': 'aries',
  'taurus': 'taurus', 
  'gemini': 'gemini',
  'cancer': 'cancer',
  'leo': 'leo',
  'virgo': 'virgo',
  'libra': 'libra',
  'scorpio': 'scorpio',
  'sagittarius': 'sagittarius',
  'capricorn': 'capricorn',
  'aquarius': 'aquarius',
  'pisces': 'pisces'
};

// Fallback mock horoscopes for when API fails
const mockHoroscopes: { [key: string]: { daily: string; weekly: string; monthly: string } } = {
  aries: {
    daily: "Today is a day for bold action and new beginnings. Your natural leadership qualities will shine through, helping you inspire others and take charge of situations that require direction.",
    weekly: "This week brings opportunities for personal growth and professional advancement. Your competitive spirit will serve you well, but remember to balance ambition with patience.",
    monthly: "This month focuses on new projects and relationships. Your energy levels are high, making it an excellent time to pursue goals that have been on your mind."
  },
  taurus: {
    daily: "Patience and persistence will be your greatest assets today. Financial matters look promising, but avoid impulsive decisions. Trust your practical instincts.",
    weekly: "This week emphasizes stability and security. You may find yourself focusing on home improvements or financial planning. Your reliable nature will be appreciated by others.",
    monthly: "This month brings opportunities to build lasting foundations in both personal and professional areas. Your determination will help you overcome any obstacles."
  },
  gemini: {
    daily: "Communication flows easily today, making it perfect for important conversations and social interactions. Your curious mind will lead you to interesting discoveries.",
    weekly: "This week is ideal for learning, networking, and sharing ideas. Your versatility will be tested as you juggle multiple responsibilities successfully.",
    monthly: "This month brings mental stimulation and social opportunities. Your adaptability will help you navigate changing circumstances with grace."
  },
  cancer: {
    daily: "Your emotional intelligence is heightened today. Trust your intuition when making decisions, especially regarding family and close relationships.",
    weekly: "This week focuses on home, family, and emotional well-being. Your nurturing nature will create harmony in your personal environment.",
    monthly: "This month emphasizes emotional growth and domestic matters. Your sensitivity will be a strength in helping others and creating comfortable spaces."
  },
  leo: {
    daily: "Your natural charisma draws positive attention today. Creative self-expression brings joy and recognition. Share your warmth and generosity with others.",
    weekly: "This week highlights your leadership abilities and creative talents. Your confidence will inspire others, but remember to listen as well as lead.",
    monthly: "This month is about self-expression and recognition. Your dramatic flair and enthusiasm will open doors to new opportunities."
  },
  virgo: {
    daily: "Your analytical skills are sharp today, making it perfect for problem-solving and planning. Attention to detail will prevent future complications.",
    weekly: "This week favors organization, health, and service to others. Your practical approach will help you tackle complex tasks efficiently.",
    monthly: "This month focuses on improvement and efficiency. Your methodical nature will help you achieve goals through careful planning."
  },
  libra: {
    daily: "Harmony and balance are key themes today. Your diplomatic skills will be valuable in resolving conflicts and creating beauty in your environment.",
    weekly: "This week emphasizes relationships and partnerships. Your ability to see multiple perspectives will help you find fair solutions.",
    monthly: "This month brings opportunities for collaboration and artistic expression. Your sense of justice and aesthetics will guide important decisions."
  },
  scorpio: {
    daily: "Your intensity and intuition are powerful today. Trust your instincts when uncovering hidden truths or navigating complex situations.",
    weekly: "This week favors transformation and deep connections. Your ability to see beneath the surface will reveal important insights.",
    monthly: "This month is about empowerment and regeneration. Your passionate approach will help you overcome challenges and emerge stronger."
  },
  sagittarius: {
    daily: "Adventure and learning call to you today. Your optimistic outlook will attract opportunities for growth and expansion.",
    weekly: "This week is ideal for exploration, travel, and philosophical pursuits. Your open mind will lead to valuable new perspectives.",
    monthly: "This month brings opportunities for personal freedom and intellectual growth. Your enthusiasm will inspire others to join your adventures."
  },
  capricorn: {
    daily: "Your disciplined approach will yield results today. Focus on long-term goals and practical steps toward achievement.",
    weekly: "This week emphasizes career advancement and responsibility. Your reliability and ambition will be recognized by authority figures.",
    monthly: "This month is about building structures and achieving ambitions. Your perseverance will help you overcome obstacles on your path to success."
  },
  aquarius: {
    daily: "Your innovative thinking brings fresh perspectives to old problems. Your humanitarian spirit may inspire you to help others in unique ways.",
    weekly: "This week favors social connections and progressive ideas. Your originality will be appreciated in group settings and collaborative efforts.",
    monthly: "This month brings opportunities for innovation and community involvement. Your forward-thinking approach will lead to breakthrough solutions."
  },
  pisces: {
    daily: "Your intuition and creativity are heightened today. Artistic expression and spiritual pursuits bring deep satisfaction and insight.",
    weekly: "This week emphasizes compassion and imagination. Your empathetic nature will help you support others and find creative solutions.",
    monthly: "This month is about spiritual growth and artistic expression. Your sensitivity will be a gift in understanding others and creating beauty."
  }
};

export class HoroscopeService {
  /**
   * Get daily horoscope for a specific zodiac sign
   */
  static async getDailyHoroscope(zodiacSign: string): Promise<HoroscopeResponse> {
    // Normalize the zodiac sign
    const normalizedSign = zodiacSign.toLowerCase().trim();
    const apiSign = zodiacSignMap[normalizedSign];

    console.log('[HoroscopeService] Fetching horoscope for:', apiSign);

    if (!apiSign) {
      return {
        success: false,
        error: `Invalid zodiac sign: ${zodiacSign}. Valid signs are: ${Object.keys(zodiacSignMap).join(', ')}`
      };
    }

    try {
      const response = await fetch(`${HOROSCOPE_API_BASE}/daily?sign=${apiSign}`);
      
      console.log('[HoroscopeService] Response status:', response.status);
      console.log('[HoroscopeService] Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[HoroscopeService] API Response:', data);

      // Try different possible response formats
      const horoscopeText = data.horoscope || data.description || data.result || data.text || data.message || data.content || JSON.stringify(data);

      return {
        success: true,
        data: {
          sign: apiSign,
          date: new Date().toISOString().split('T')[0], // Today's date
          horoscope: horoscopeText
        }
      };
    } catch (error) {
      console.error('[HoroscopeService] Error fetching daily horoscope:', error);
      console.log('[HoroscopeService] Using fallback mock horoscope for:', apiSign);
      
      // Fallback to mock horoscope
      const mockData = mockHoroscopes[apiSign];
      if (mockData) {
        return {
          success: true,
          data: {
            sign: apiSign,
            date: new Date().toISOString().split('T')[0],
            horoscope: mockData.daily
          }
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch horoscope'
      };
    }
  }

  /**
   * Get weekly horoscope for a specific zodiac sign
   */
  static async getWeeklyHoroscope(zodiacSign: string): Promise<HoroscopeResponse> {
    // Normalize the zodiac sign
    const normalizedSign = zodiacSign.toLowerCase().trim();
    const apiSign = zodiacSignMap[normalizedSign];

    if (!apiSign) {
      return {
        success: false,
        error: `Invalid zodiac sign: ${zodiacSign}. Valid signs are: ${Object.keys(zodiacSignMap).join(', ')}`
      };
    }

    try {
      const response = await fetch(`${HOROSCOPE_API_BASE}/weekly?sign=${apiSign}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          sign: apiSign,
          date: new Date().toISOString().split('T')[0], // Current week
          horoscope: data.horoscope || data.description || data.result || data.text || data.message || data.content || 'No weekly horoscope available.'
        }
      };
    } catch (error) {
      console.error('[HoroscopeService] Error fetching weekly horoscope:', error);
      
      // Fallback to mock horoscope
      const mockData = mockHoroscopes[apiSign];
      if (mockData) {
        return {
          success: true,
          data: {
            sign: apiSign,
            date: new Date().toISOString().split('T')[0],
            horoscope: mockData.weekly
          }
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch weekly horoscope'
      };
    }
  }

  /**
   * Get monthly horoscope for a specific zodiac sign
   */
  static async getMonthlyHoroscope(zodiacSign: string): Promise<HoroscopeResponse> {
    // Normalize the zodiac sign
    const normalizedSign = zodiacSign.toLowerCase().trim();
    const apiSign = zodiacSignMap[normalizedSign];

    if (!apiSign) {
      return {
        success: false,
        error: `Invalid zodiac sign: ${zodiacSign}. Valid signs are: ${Object.keys(zodiacSignMap).join(', ')}`
      };
    }

    try {
      const response = await fetch(`${HOROSCOPE_API_BASE}/monthly?sign=${apiSign}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          sign: apiSign,
          date: new Date().toISOString().split('T')[0], // Current month
          horoscope: data.horoscope || data.description || data.result || data.text || data.message || data.content || 'No monthly horoscope available.'
        }
      };
    } catch (error) {
      console.error('[HoroscopeService] Error fetching monthly horoscope:', error);
      
      // Fallback to mock horoscope
      const mockData = mockHoroscopes[apiSign];
      if (mockData) {
        return {
          success: true,
          data: {
            sign: apiSign,
            date: new Date().toISOString().split('T')[0],
            horoscope: mockData.monthly
          }
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch monthly horoscope'
      };
    }
  }

  /**
   * Get user's zodiac sign from their birth date (Western astrology)
   */
  static getZodiacSignFromDate(birthDate: string): string {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';

    return 'unknown';
  }

  /**
   * Get zodiac sign display name (capitalized)
   */
  static getZodiacDisplayName(sign: string): string {
    return sign.charAt(0).toUpperCase() + sign.slice(1);
  }

  /**
   * Get zodiac symbol emoji
   */
  static getZodiacSymbol(sign: string): string {
    const symbols: { [key: string]: string } = {
      'aries': '♈',
      'taurus': '♉',
      'gemini': '♊',
      'cancer': '♋',
      'leo': '♌',
      'virgo': '♍',
      'libra': '♎',
      'scorpio': '♏',
      'sagittarius': '♐',
      'capricorn': '♑',
      'aquarius': '♒',
      'pisces': '♓'
    };
    return symbols[sign.toLowerCase()] || '⭐';
  }
}
