import { Globe, Wind, Droplet, Flame } from 'lucide-react-native';

export const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
export const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];
export const YEARS = Array.from({ length: 100 }, (_, i) => 2026 - i); // 2026 down to 1927

export const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
export const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// 12 Zodiac icons mapping
export const ZODIAC_ICONS: Record<number, any> = {
  1: require('../assets/icons/astro_icon_1.png'), // Aries
  2: require('../assets/icons/astro_icon_2.png'), // Taurus
  3: require('../assets/icons/astro_icon_3.png'), // Gemini
  4: require('../assets/icons/astro_icon_4.png'), // Cancer
  5: require('../assets/icons/astro_icon_5.png'), // Leo
  6: require('../assets/icons/astro_icon_6.png'), // Virgo
  7: require('../assets/icons/astro_icon_7.png'), // Libra
  8: require('../assets/icons/astro_icon_8.png'), // Scorpio
  9: require('../assets/icons/astro_icon_9.png'), // Sagittarius
  10: require('../assets/icons/astro_icon_10.png'), // Capricorn
  11: require('../assets/icons/astro_icon_11.png'), // Aquarius
  12: require('../assets/icons/astro_icon_12.png'), // Pisces
};

export function parseDayAndMonth(dob: string): { day: number; month: number } | null {
  if (!dob || typeof dob !== 'string') return null;
  const trimmed = dob.trim();
  if (!trimmed) return null;

  // 1. Check ISO / YYYY-MM-DD / YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, month };
    }
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY or MM/DD/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    if (day > 12 && month <= 12) {
      return { day, month };
    }
    if (month > 12 && day <= 12) {
      return { day: month, month: day };
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, month };
    }
  }

  // 3. Fallback to standard Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return { day: parsed.getUTCDate(), month: parsed.getUTCMonth() + 1 };
  }

  return null;
}

export function getZodiacInfo(day: number, month: number): { name: string; index: number; element: string; elementIcon: any; planet: string } {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: "Aries", index: 1, element: "Fire", elementIcon: Flame, planet: "Mars" };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: "Taurus", index: 2, element: "Earth", elementIcon: Globe, planet: "Venus" };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: "Gemini", index: 3, element: "Air", elementIcon: Wind, planet: "Mercury" };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: "Cancer", index: 4, element: "Water", elementIcon: Droplet, planet: "Moon" };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: "Leo", index: 5, element: "Fire", elementIcon: Flame, planet: "Sun" };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: "Virgo", index: 6, element: "Earth", elementIcon: Globe, planet: "Mercury" };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: "Libra", index: 7, element: "Air", elementIcon: Wind, planet: "Venus" };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: "Scorpio", index: 8, element: "Water", elementIcon: Droplet, planet: "Pluto" };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: "Sagittarius", index: 9, element: "Fire", elementIcon: Flame, planet: "Jupiter" };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { name: "Capricorn", index: 10, element: "Earth", elementIcon: Globe, planet: "Saturn" };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: "Aquarius", index: 11, element: "Air", elementIcon: Wind, planet: "Uranus" };
  } else {
    return { name: "Pisces", index: 12, element: "Water", elementIcon: Droplet, planet: "Neptune" };
  }
}

export const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const RASHI_GLYPHS = ['♈\uFE0E', '♉\uFE0E', '♊\uFE0E', '♋\uFE0E', '♌\uFE0E', '♍\uFE0E', '♎\uFE0E', '♏\uFE0E', '♐\uFE0E', '♑\uFE0E', '♒\uFE0E', '♓\uFE0E'];
export const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
export const SIGN_ELEMENT = ['Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water'];
export const HOUSE_THEMES = ['', 'Self & Personality', 'Wealth & Speech', 'Courage & Siblings', 'Home & Mother', 'Creativity & Children', 'Health & Service', 'Partnership & Marriage', 'Transformation & Depth', 'Fortune & Dharma', 'Career & Status', 'Gains & Aspirations', 'Release & Spirituality'];
export const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export interface PlanetMeta {
  key: string; name: string; san: string; glyph: string; abbr: string; color: string; theme: string;
  house: number; degree: number; retro: boolean;
}

export const PLANET_BASE: Omit<PlanetMeta, 'house' | 'degree' | 'retro'>[] = [
  { key: 'sun', name: 'Sun', san: 'Surya', glyph: '☉', abbr: 'Su', color: '#E8A200', theme: 'soul, vitality & ego' },
  { key: 'moon', name: 'Moon', san: 'Chandra', glyph: '☽', abbr: 'Mo', color: '#5B8DEF', theme: 'mind, emotions & instincts' },
  { key: 'mars', name: 'Mars', san: 'Mangal', glyph: '♂', abbr: 'Ma', color: '#E5484D', theme: 'energy, drive & courage' },
  { key: 'mercury', name: 'Mercury', san: 'Budh', glyph: '☿', abbr: 'Me', color: '#12A594', theme: 'intellect & communication' },
  { key: 'jupiter', name: 'Jupiter', san: 'Guru', glyph: '♃', abbr: 'Ju', color: '#D9730D', theme: 'wisdom, growth & fortune' },
  { key: 'venus', name: 'Venus', san: 'Shukra', glyph: '♀', abbr: 'Ve', color: '#E5439E', theme: 'love, beauty & comfort' },
  { key: 'saturn', name: 'Saturn', san: 'Shani', glyph: '♄', abbr: 'Sa', color: '#6E56CF', theme: 'discipline, karma & patience' },
  { key: 'rahu', name: 'Rahu', san: 'Rahu', glyph: '☊', abbr: 'Ra', color: '#8B8B8B', theme: 'ambition & worldly desire' },
  { key: 'ketu', name: 'Ketu', san: 'Ketu', glyph: '☋', abbr: 'Ke', color: '#8B8B8B', theme: 'detachment & liberation' },
];

export function signForHouse(ascIndex0: number, house: number): number {
  return (ascIndex0 + house - 1) % 12;
}

export const VEDIC_BHAVAS: Record<number, { sanskrit: string; title: string; domain: string; icon: string }> = {
  1: { sanskrit: 'Tanu Bhava', title: 'Self & Vitality', domain: 'Aura, physical constitution, character & life direction', icon: 'account-outline' },
  2: { sanskrit: 'Dhana Bhava', title: 'Wealth & Speech', domain: 'Financial reserves, family lineage, values & voice', icon: 'wallet-outline' },
  3: { sanskrit: 'Sahaja Bhava', title: 'Courage & Siblings', domain: 'Initiative, willpower, skills, communication & short travels', icon: 'sword-cross' },
  4: { sanskrit: 'Sukha Bhava', title: 'Home & Inner Peace', domain: 'Mother, ancestral roots, property, vehicles & emotional sanctuary', icon: 'home-outline' },
  5: { sanskrit: 'Putra Bhava', title: 'Intellect & Creativity', domain: 'Past-life merit (Purva Punya), romance, speculation & intuition', icon: 'palette-outline' },
  6: { sanskrit: 'Ari Bhava', title: 'Health & Resilience', domain: 'Daily routine, service, overcoming adversaries & overcoming debt', icon: 'shield-check-outline' },
  7: { sanskrit: 'Yuvati Bhava', title: 'Partnership & Love', domain: 'Spouse, marriage, business alliances & social reflection', icon: 'heart-outline' },
  8: { sanskrit: 'Randhra Bhava', title: 'Transformation & Occult', domain: 'Longevity, hidden secrets, joint assets & psychological rebirth', icon: 'eye-outline' },
  9: { sanskrit: 'Dharma Bhava', title: 'Fortune & Higher Wisdom', domain: 'Father, spiritual guides, philosophy, dharma & divine grace', icon: 'book-open-outline' },
  10: { sanskrit: 'Karma Bhava', title: 'Career & Legacy', domain: 'Vocation, public authority, achievements & social contribution', icon: 'crown-outline' },
  11: { sanskrit: 'Labha Bhava', title: 'Gains & Aspirations', domain: 'Fulfillment of desires, elder siblings, network circles & prosperity', icon: 'star-outline' },
  12: { sanskrit: 'Vyaya Bhava', title: 'Liberation & Moksha', domain: 'Spiritual transcendence, dreams, subconscious insights & retreat', icon: 'weather-night' }
};

export const PLANET_VEDIC_META: Record<string, { san: string; deity: string; nature: string; color: string; glyph: string }> = {
  sun: { san: 'Surya', deity: 'Agni / Solar Soul', nature: 'Kingly, Vital, Authoritative', color: '#E8A200', glyph: '☉' },
  moon: { san: 'Chandra', deity: 'Soma / Mind & Emotion', nature: 'Receptive, Intuitive, Nurturing', color: '#5B8DEF', glyph: '☽' },
  mars: { san: 'Mangal', deity: 'Kartikeya / Dynamic Drive', nature: 'Courageous, Protective, Passionate', color: '#E5484D', glyph: '♂' },
  mercury: { san: 'Budha', deity: 'Vishnu / Intellect & Speech', nature: 'Analytical, Adaptable, Quick-witted', color: '#12A594', glyph: '☿' },
  jupiter: { san: 'Guru', deity: 'Brihaspati / Supreme Wisdom', nature: 'Expansive, Dharmic, Auspicious', color: '#D9730D', glyph: '♃' },
  venus: { san: 'Shukra', deity: 'Lakshmi / Harmony & Beauty', nature: 'Artistic, Devotional, Magnetic', color: '#F72585', glyph: '♀' },
  saturn: { san: 'Shani', deity: 'Yama / Lord of Karma & Time', nature: 'Disciplined, Enduring, Grounded', color: '#6E56CF', glyph: '♄' },
  rahu: { san: 'Rahu', deity: 'Cosmic North Node', nature: 'Visionary, Ambitious, Unconventional', color: '#8B8B8B', glyph: '☊' },
  ketu: { san: 'Ketu', deity: 'Cosmic South Node', nature: 'Mystical, Liberating, Transcendental', color: '#8B8B8B', glyph: '☋' }
};

export const getPlanetDignityBadge = (planet: string, sign: string) => {
  const p = planet.toLowerCase();
  const s = sign.toLowerCase();
  if ((p === 'sun' && s === 'aries') || (p === 'moon' && s === 'taurus') || (p === 'jupiter' && s === 'cancer') || (p === 'mercury' && s === 'virgo') || (p === 'venus' && s === 'pisces') || (p === 'mars' && s === 'capricorn') || (p === 'saturn' && s === 'libra')) {
    return { label: 'Exalted', color: '#03B07A', bg: 'rgba(3, 176, 122, 0.12)' };
  }
  if ((p === 'sun' && s === 'leo') || (p === 'moon' && s === 'cancer') || (p === 'mars' && (s === 'aries' || s === 'scorpio')) || (p === 'mercury' && (s === 'gemini' || s === 'virgo')) || (p === 'jupiter' && (s === 'sagittarius' || s === 'pisces')) || (p === 'venus' && (s === 'taurus' || s === 'libra')) || (p === 'saturn' && (s === 'capricorn' || s === 'aquarius'))) {
    return { label: 'Own Sign', color: '#7209B7', bg: 'rgba(114, 9, 183, 0.12)' };
  }
  if ((p === 'sun' && s === 'libra') || (p === 'moon' && s === 'scorpio') || (p === 'jupiter' && s === 'capricorn') || (p === 'mercury' && s === 'pisces') || (p === 'venus' && s === 'virgo') || (p === 'mars' && s === 'cancer') || (p === 'saturn' && s === 'aries')) {
    return { label: 'Debilitated', color: '#E63946', bg: 'rgba(230, 57, 70, 0.12)' };
  }
  return { label: 'Harmonic', color: '#5B8DEF', bg: 'rgba(91, 141, 239, 0.12)' };
};

export const getPlanetHouseInsight = (planet: string, houseNum: number, sign: string) => {
  const p = planet.toLowerCase();
  if (p === 'sun') {
    if (houseNum === 1) return 'Strong executive radiance, prominent vitality & natural personal sovereignty.';
    if (houseNum === 10) return 'Digbala (Directional Strength) — high career elevation, leadership & public acclaim.';
    if (houseNum === 9 || houseNum === 5) return 'Dharmic visionary brilliance, creative confidence & philosophical authority.';
    return `Illuminates the ${ORD[houseNum] || houseNum + 'th'} house with solar clarity, self-reliance, and purposeful drive in ${sign}.`;
  }
  if (p === 'moon') {
    if (houseNum === 4) return 'Digbala — deep psychological peace, maternal harmony & rooted emotional nourishment.';
    if (houseNum === 1 || houseNum === 7) return 'Heightened empathic charm, magnetic social presence & emotional perceptiveness.';
    return `Anchors your inner feeling world and intuitive instincts inside the ${ORD[houseNum] || houseNum + 'th'} house.`;
  }
  if (p === 'mars') {
    if (houseNum === 10) return 'Digbala — decisive strategic action, competitive mastery & indomitable work ethic.';
    if (houseNum === 1 || houseNum === 3) return 'Pioneering bravery, quick reflexes & vigorous initiative in all pursuits.';
    return `Directs courageous vitality and protective fire into the ${ORD[houseNum] || houseNum + 'th'} house themes.`;
  }
  if (p === 'mercury') {
    if (houseNum === 1) return 'Digbala — brilliant articulation, sharp intellect & persuasive conversational gift.';
    if (houseNum === 2 || houseNum === 11) return 'Commercial intelligence, strategic financial acumen & prosperous network gains.';
    return `Brings analytical clarity, versatile trade skills, and rapid processing to the ${ORD[houseNum] || houseNum + 'th'} house.`;
  }
  if (p === 'jupiter') {
    if (houseNum === 1) return 'Digbala — profound wisdom, protective aura, natural benevolence & auspicious life blessings.';
    if (houseNum === 9 || houseNum === 5) return 'Superb spiritual fortune, higher academic triumphs & philosophical depth.';
    return `Expands growth, prosperity, and moral integrity within the ${ORD[houseNum] || houseNum + 'th'} house realm.`;
  }
  if (p === 'venus') {
    if (houseNum === 4) return 'Digbala — aesthetic elegance, refined domestic comfort & joyful artistic lifestyle.';
    if (houseNum === 7 || houseNum === 2) return 'Magnetic romantic devotion, eloquent grace & harmonious wealth creation.';
    return `Infuses the ${ORD[houseNum] || houseNum + 'th'} house with beauty, creative diplomacy, and relational sweet blessings.`;
  }
  if (p === 'saturn') {
    if (houseNum === 7) return 'Digbala — enduring contractual loyalty, mature enduring partnerships & structured justice.';
    if (houseNum === 10 || houseNum === 11) return 'Unshakeable patience, long-term mastery & steady monumental rise in life.';
    return `Imparts grounded patience, karmic maturity, and disciplined endurance in the ${ORD[houseNum] || houseNum + 'th'} house.`;
  }
  if (p === 'rahu') {
    return `Catalyzes innovative breakthroughs, unconventional mastery, and intense worldly drive in the ${ORD[houseNum] || houseNum + 'th'} house.`;
  }
  if (p === 'ketu') {
    return `Bestows deep intuitive detachment, spiritual mastery, and occult perception within the ${ORD[houseNum] || houseNum + 'th'} house.`;
  }
  return `Influences the ${ORD[houseNum] || houseNum + 'th'} house (${sign}) with distinct celestial vibration.`;
};

export const DAILY_ARCHETYPES = [
  { name: 'The Solar King', arcana: 'Solar Radiance', mantra: 'My presence radiates clarity, courage, and warm illumination.', color: '#E8A200', icon: '👑' },
  { name: 'The Mystic Seer', arcana: 'Intuitive Vision', mantra: 'I trust the subtle cosmic cues and my unwavering inner compass.', color: '#7209B7', icon: '🔮' },
  { name: 'The Alchemist', arcana: 'Transformation', mantra: 'Every circumstance is raw gold for my conscious growth.', color: '#F72585', icon: '✨' },
  { name: 'The Sovereign', arcana: 'Quiet Mastery', mantra: 'I command my actions with calm authority and grounded grace.', color: '#3A0CA3', icon: '🏛️' },
  { name: 'The Cosmic Weaver', arcana: 'Harmonic Sync', mantra: 'Synchronicity and abundant pathways open naturally today.', color: '#03B07A', icon: '🌌' },
  { name: 'The Wayfinder', arcana: 'Bravery & Direction', mantra: 'I step boldly into new horizons with clarity and conviction.', color: '#E5484D', icon: '🧭' },
  { name: 'The Serene Sage', arcana: 'Deep Equanimity', mantra: 'I remain anchored in deep serenity regardless of external noise.', color: '#5B8DEF', icon: '🕊️' },
];

export const DAILY_LUCKY_MATRIX: Record<string, { color: string; colorCode: string; num: string; dir: string; crystal: string; element: string }> = {
  Aries: { color: 'Crimson Red', colorCode: '#E5484D', num: '9 & 1', dir: 'East', crystal: 'Red Jasper', element: 'Fire ✦' },
  Taurus: { color: 'Emerald Green', colorCode: '#03B07A', num: '6 & 2', dir: 'South-East', crystal: 'Rose Quartz', element: 'Earth ✦' },
  Gemini: { color: 'Bright Saffron', colorCode: '#E8A200', num: '5 & 3', dir: 'North', crystal: 'Citrine', element: 'Air ✦' },
  Cancer: { color: 'Silver Pearl', colorCode: '#B3A2E7', num: '2 & 7', dir: 'North-West', crystal: 'Moonstone', element: 'Water ✦' },
  Leo: { color: 'Royal Gold', colorCode: '#D9730D', num: '1 & 4', dir: 'East', crystal: 'Sunstone', element: 'Fire ✦' },
  Virgo: { color: 'Forest Olive', colorCode: '#12A594', num: '5 & 8', dir: 'North', crystal: 'Amazonite', element: 'Earth ✦' },
  Libra: { color: 'Rose Petal', colorCode: '#F72585', num: '6 & 9', dir: 'West', crystal: 'Lapis Lazuli', element: 'Air ✦' },
  Scorpio: { color: 'Deep Maroon', colorCode: '#7209B7', num: '9 & 4', dir: 'South', crystal: 'Obsidian', element: 'Water ✦' },
  Sagittarius: { color: 'Amber Gold', colorCode: '#E8A200', num: '3 & 7', dir: 'North-East', crystal: 'Topaz', element: 'Fire ✦' },
  Capricorn: { color: 'Royal Navy', colorCode: '#3A0CA3', num: '8 & 5', dir: 'South', crystal: 'Black Onyx', element: 'Earth ✦' },
  Aquarius: { color: 'Electric Cyan', colorCode: '#5B8DEF', num: '8 & 11', dir: 'West', crystal: 'Aquamarine', element: 'Air ✦' },
  Pisces: { color: 'Ocean Lavender', colorCode: '#7209B7', num: '3 & 12', dir: 'North-East', crystal: 'Amethyst', element: 'Water ✦' }
};
