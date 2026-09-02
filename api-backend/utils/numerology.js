/**
 * Deterministic Numerology Calculation Engine
 * Uses Pythagorean Numerology system with full ISO / Multi-format date support
 */

const PYTHAGOREAN_CHART = {
  'A': 1, 'J': 1, 'S': 1,
  'B': 2, 'K': 2, 'T': 2,
  'C': 3, 'L': 3, 'U': 3,
  'D': 4, 'M': 4, 'V': 4,
  'E': 5, 'N': 5, 'W': 5,
  'F': 6, 'O': 6, 'X': 6,
  'G': 7, 'P': 7, 'Y': 7,
  'H': 8, 'Q': 8, 'Z': 8,
  'I': 9, 'R': 9
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MASTER_NUMBERS = [11, 22, 33];

/**
 * Reduce number to single digit unless it's a master number (11, 22, 33)
 */
function reduceNumber(num) {
  let sum = Number(num);
  if (isNaN(sum) || sum <= 0) return 1;
  while (sum > 9 && !MASTER_NUMBERS.includes(sum)) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
}

/**
 * Force reduce number to single digit (1-9) even for master numbers
 */
function reduceToSingleDigit(num) {
  let sum = Number(num);
  if (isNaN(sum) || sum <= 0) return 1;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
}

/**
 * Robust date parser supporting YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, DD/MM/YYYY, ISO-8601
 */
function parseBirthDate(dob) {
  if (!dob) return null;
  const str = String(dob).trim();
  const dateOnly = str.split('T')[0];

  // Try matching YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = dateOnly.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    return {
      year,
      month,
      day,
      rawDigits: `${ymdMatch[1]}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
    };
  }

  // Try matching DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = dateOnly.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    return {
      year,
      month,
      day,
      rawDigits: `${dmyMatch[3]}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
    };
  }

  // Fallback: extract all digits
  const allDigits = str.replace(/\D/g, '');
  if (allDigits.length >= 8) {
    if (allDigits.startsWith('19') || allDigits.startsWith('20')) {
      const year = parseInt(allDigits.slice(0, 4), 10);
      const month = parseInt(allDigits.slice(4, 6), 10);
      const day = parseInt(allDigits.slice(6, 8), 10);
      return { year, month, day, rawDigits: allDigits.slice(0, 8) };
    } else {
      const day = parseInt(allDigits.slice(0, 2), 10);
      const month = parseInt(allDigits.slice(2, 4), 10);
      const year = parseInt(allDigits.slice(4, 8), 10);
      return { year, month, day, rawDigits: allDigits.slice(0, 8) };
    }
  }

  return null;
}

/**
 * Calculate Life Path Number from date of birth
 */
function calculateLifePath(dateOfBirth) {
  const parsed = parseBirthDate(dateOfBirth);
  const digits = parsed ? parsed.rawDigits.split('') : String(dateOfBirth || '20000101').replace(/\D/g, '').split('');
  const sum = digits.length > 0 ? digits.reduce((acc, digit) => acc + parseInt(digit, 10), 0) : 1;

  const lifePath = reduceNumber(sum);
  const lifePathReduced = reduceToSingleDigit(sum);

  return {
    lifePath,
    lifePathReduced
  };
}

/**
 * Convert letter to numerology number
 */
function letterToNumber(letter) {
  return PYTHAGOREAN_CHART[letter.toUpperCase()] || 0;
}

/**
 * Calculate Destiny (Expression) Number from full name
 */
function calculateDestinyNumber(fullName) {
  const cleanName = String(fullName || 'Seeker').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const letters = (cleanName.length > 0 ? cleanName : 'SEEKER').split('');
  const sum = letters.reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Soul Urge Number (only vowels)
 */
function calculateSoulUrge(fullName) {
  const cleanName = String(fullName || 'Seeker').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const letters = cleanName.split('');
  const vowels = letters.filter(letter => VOWELS.includes(letter));
  const sum = vowels.length > 0 ? vowels.reduce((acc, letter) => acc + letterToNumber(letter), 0) : 1;
  return reduceNumber(sum);
}

/**
 * Calculate Personality Number (only consonants)
 */
function calculatePersonality(fullName) {
  const cleanName = String(fullName || 'Seeker').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const letters = cleanName.split('');
  const consonants = letters.filter(letter => !VOWELS.includes(letter));
  const sum = consonants.length > 0 ? consonants.reduce((acc, letter) => acc + letterToNumber(letter), 0) : 1;
  return reduceNumber(sum);
}

/**
 * Calculate Personal Year Number
 */
function calculatePersonalYear(dateOfBirth) {
  const parsed = parseBirthDate(dateOfBirth);
  const currentYear = new Date().getFullYear();
  const currentYearReduced = reduceNumber(currentYear);

  if (!parsed || isNaN(parsed.month) || isNaN(parsed.day)) {
    return reduceNumber(currentYear);
  }

  const birthDayReduced = reduceNumber(parsed.day);
  const birthMonth = parsed.month;
  const sum = birthDayReduced + birthMonth + currentYearReduced;
  return reduceNumber(sum);
}

/**
 * Main numerology calculation function
 * @param {Object} profile - User profile with full_name and date_of_birth
 * @returns {Object} Numerology calculations
 */
function calculateNumerology(profile) {
  const full_name = profile?.full_name || profile?.name || 'Seeker';
  const date_of_birth = profile?.date_of_birth || profile?.dob || '2000-01-01';

  const { lifePath, lifePathReduced } = calculateLifePath(date_of_birth);
  const destinyNumber = calculateDestinyNumber(full_name);
  const soulUrge = calculateSoulUrge(full_name);
  const personality = calculatePersonality(full_name);
  const personalYear = calculatePersonalYear(date_of_birth);

  return {
    life_path: lifePath,
    life_path_reduced: lifePathReduced,
    destiny: destinyNumber,
    destiny_number: destinyNumber,
    soul_urge: soulUrge,
    personality: personality,
    personal_year: personalYear
  };
}

module.exports = {
  calculateNumerology,
  calculateLifePath,
  calculateDestinyNumber,
  calculateSoulUrge,
  calculatePersonality,
  calculatePersonalYear,
  reduceNumber,
  reduceToSingleDigit,
  letterToNumber,
  parseBirthDate
};
