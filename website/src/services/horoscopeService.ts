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

const HOROSCOPE_API_BASE = 'https://freehoroscopeapi.com/api/v1/get-horoscope';

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

export class HoroscopeService {
  /**
   * Get daily horoscope for a specific zodiac sign
   */
  static async getDailyHoroscope(zodiacSign: string): Promise<HoroscopeResponse> {
    try {
      // Normalize the zodiac sign
      const normalizedSign = zodiacSign.toLowerCase().trim();
      const apiSign = zodiacSignMap[normalizedSign];

      if (!apiSign) {
        return {
          success: false,
          error: `Invalid zodiac sign: ${zodiacSign}. Valid signs are: ${Object.keys(zodiacSignMap).join(', ')}`
        };
      }

      const response = await fetch(`${HOROSCOPE_API_BASE}/daily?sign=${apiSign}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          sign: apiSign,
          date: new Date().toISOString().split('T')[0], // Today's date
          horoscope: data.horoscope || data.description || data.result || 'No horoscope available today.'
        }
      };
    } catch (error) {
      console.error('Error fetching daily horoscope:', error);
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
    try {
      const normalizedSign = zodiacSign.toLowerCase().trim();
      const apiSign = zodiacSignMap[normalizedSign];

      if (!apiSign) {
        return {
          success: false,
          error: `Invalid zodiac sign: ${zodiacSign}. Valid signs are: ${Object.keys(zodiacSignMap).join(', ')}`
        };
      }

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
          horoscope: data.horoscope || data.description || data.result || 'No weekly horoscope available.'
        }
      };
    } catch (error) {
      console.error('Error fetching weekly horoscope:', error);
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
    try {
      const normalizedSign = zodiacSign.toLowerCase().trim();
      const apiSign = zodiacSignMap[normalizedSign];

      if (!apiSign) {
        return {
          success: false,
          error: `Invalid zodiac sign: ${zodiacSign}. Valid signs are: ${Object.keys(zodiacSignMap).join(', ')}`
        };
      }

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
          horoscope: data.horoscope || data.description || data.result || 'No monthly horoscope available.'
        }
      };
    } catch (error) {
      console.error('Error fetching monthly horoscope:', error);
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
