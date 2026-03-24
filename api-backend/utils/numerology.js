/**
 * Deterministic Numerology Calculation Engine
 * Uses Pythagorean Numerology system
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
 * Reduce number to single digit unless it's a master number
 */
function reduceNumber(num) {
  if (MASTER_NUMBERS.includes(num)) {
    return num;
  }

  let sum = num;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
}

/**
 * Calculate Life Path Number from date of birth
 */
function calculateLifePath(dateOfBirth) {
  // Remove hyphens and sum all digits
  const digits = dateOfBirth.replace(/-/g, '').split('');
  const sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);

  const lifePath = reduceNumber(sum);
  const lifePathReduced = MASTER_NUMBERS.includes(lifePath) ? reduceNumber(lifePath) : lifePath;

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
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().split('');
  const sum = letters.reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Soul Urge Number (only vowels)
 */
function calculateSoulUrge(fullName) {
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().split('');
  const vowels = letters.filter(letter => VOWELS.includes(letter));
  const sum = vowels.reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Personality Number (only consonants)
 */
function calculatePersonality(fullName) {
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().split('');
  const consonants = letters.filter(letter => !VOWELS.includes(letter));
  const sum = consonants.reduce((acc, letter) => acc + letterToNumber(letter), 0);
  return reduceNumber(sum);
}

/**
 * Calculate Personal Year Number
 */
function calculatePersonalYear(dateOfBirth) {
  const [year, month, day] = dateOfBirth.split('-').map(Number);

  // Get current year
  const currentYear = new Date().getFullYear();

  // Reduce birth day to single digit
  const birthDayReduced = reduceNumber(day);

  // Month is already 1-12, no need to reduce
  const birthMonth = month;

  // Reduce current year to single digit
  const currentYearReduced = reduceNumber(currentYear);

  // Sum and reduce
  const sum = birthDayReduced + birthMonth + currentYearReduced;
  return reduceNumber(sum);
}

/**
 * Main numerology calculation function
 * @param {Object} profile - User profile with full_name and date_of_birth
 * @returns {Object} Numerology calculations
 */
function calculateNumerology(profile) {
  const { full_name, date_of_birth } = profile;

  const { lifePath, lifePathReduced } = calculateLifePath(date_of_birth);
  const destinyNumber = calculateDestinyNumber(full_name);
  const soulUrge = calculateSoulUrge(full_name);
  const personality = calculatePersonality(full_name);
  const personalYear = calculatePersonalYear(date_of_birth);

  return {
    life_path: lifePath,
    life_path_reduced: lifePathReduced,
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
  letterToNumber
};
