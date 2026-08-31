/**
 * Deterministic Vedic Astrological Rules Engine (Parashari / Jyotish)
 * Implements mathematical algorithms for:
 * 1. 27 Nakshatras & 108 Padas (3°20' each)
 * 2. Planetary Dignities (Exaltation, Debilitation, Moolatrikona, Own Sign, Friend/Enemy/Neutral)
 * 3. Combustion (Asta) with retrograde adjustments
 * 4. Functional Benefics and Malefics based on Lagna (Ascendant)
 * 5. Vimshottari Dasha 120-year timeline calculation
 * 6. Traditional Vedic Yoga Database & Rule Validator
 */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_LORDS = {
  Aries: 'mars', Taurus: 'venus', Gemini: 'mercury', Cancer: 'moon',
  Leo: 'sun', Virgo: 'mercury', Libra: 'venus', Scorpio: 'mars',
  Sagittarius: 'jupiter', Capricorn: 'saturn', Aquarius: 'saturn', Pisces: 'jupiter'
};

const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'ketu', startDeg: 0.0 },
  { name: 'Bharani', lord: 'venus', startDeg: 13.3333 },
  { name: 'Krittika', lord: 'sun', startDeg: 26.6667 },
  { name: 'Rohini', lord: 'moon', startDeg: 40.0 },
  { name: 'Mrigashira', lord: 'mars', startDeg: 53.3333 },
  { name: 'Ardra', lord: 'rahu', startDeg: 66.6667 },
  { name: 'Punarvasu', lord: 'jupiter', startDeg: 80.0 },
  { name: 'Pushya', lord: 'saturn', startDeg: 93.3333 },
  { name: 'Ashlesha', lord: 'mercury', startDeg: 106.6667 },
  { name: 'Magha', lord: 'ketu', startDeg: 120.0 },
  { name: 'Purva Phalguni', lord: 'venus', startDeg: 133.3333 },
  { name: 'Uttara Phalguni', lord: 'sun', startDeg: 146.6667 },
  { name: 'Hasta', lord: 'moon', startDeg: 160.0 },
  { name: 'Chitra', lord: 'mars', startDeg: 173.3333 },
  { name: 'Swati', lord: 'rahu', startDeg: 186.6667 },
  { name: 'Vishakha', lord: 'jupiter', startDeg: 200.0 },
  { name: 'Anuradha', lord: 'saturn', startDeg: 213.3333 },
  { name: 'Jyeshtha', lord: 'mercury', startDeg: 226.6667 },
  { name: 'Mula', lord: 'ketu', startDeg: 240.0 },
  { name: 'Purva Ashadha', lord: 'venus', startDeg: 253.3333 },
  { name: 'Uttara Ashadha', lord: 'sun', startDeg: 266.6667 },
  { name: 'Shravana', lord: 'moon', startDeg: 280.0 },
  { name: 'Dhanishta', lord: 'mars', startDeg: 293.3333 },
  { name: 'Shatabhisha', lord: 'rahu', startDeg: 306.6667 },
  { name: 'Purva Bhadrapada', lord: 'jupiter', startDeg: 320.0 },
  { name: 'Uttara Bhadrapada', lord: 'saturn', startDeg: 333.3333 },
  { name: 'Revati', lord: 'mercury', startDeg: 346.6667 }
];

const DASHA_YEARS = {
  ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7,
  rahu: 18, jupiter: 16, saturn: 19, mercury: 17
};

const DASHA_SEQUENCE = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];

const EXALTATION_DEBILITATION = {
  sun: { exaltedSign: 'Aries', deepDegree: 10, debilitatedSign: 'Libra' },
  moon: { exaltedSign: 'Taurus', deepDegree: 3, debilitatedSign: 'Scorpio' },
  mars: { exaltedSign: 'Capricorn', deepDegree: 28, debilitatedSign: 'Cancer' },
  mercury: { exaltedSign: 'Virgo', deepDegree: 15, debilitatedSign: 'Pisces' },
  jupiter: { exaltedSign: 'Cancer', deepDegree: 5, debilitatedSign: 'Capricorn' },
  venus: { exaltedSign: 'Pisces', deepDegree: 27, debilitatedSign: 'Virgo' },
  saturn: { exaltedSign: 'Libra', deepDegree: 20, debilitatedSign: 'Aries' },
  rahu: { exaltedSign: 'Taurus', deepDegree: 15, debilitatedSign: 'Scorpio' },
  ketu: { exaltedSign: 'Scorpio', deepDegree: 15, debilitatedSign: 'Taurus' }
};

const MOOLATRIKONA = {
  sun: { sign: 'Leo', start: 0, end: 20 },
  moon: { sign: 'Taurus', start: 4, end: 20 },
  mars: { sign: 'Aries', start: 0, end: 12 },
  mercury: { sign: 'Virgo', start: 16, end: 20 },
  jupiter: { sign: 'Sagittarius', start: 0, end: 10 },
  venus: { sign: 'Libra', start: 0, end: 15 },
  saturn: { sign: 'Aquarius', start: 0, end: 20 }
};

const NATURAL_FRIENDSHIPS = {
  sun: { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'], neutrals: ['mercury'] },
  moon: { friends: ['sun', 'mercury'], enemies: [], neutrals: ['mars', 'jupiter', 'venus', 'saturn'] },
  mars: { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'], neutrals: ['venus', 'saturn'] },
  mercury: { friends: ['sun', 'venus'], enemies: ['moon'], neutrals: ['mars', 'jupiter', 'saturn'] },
  jupiter: { friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'], neutrals: ['saturn'] },
  venus: { friends: ['mercury', 'saturn'], enemies: ['sun', 'moon'], neutrals: ['mars', 'jupiter'] },
  saturn: { friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'], neutrals: ['jupiter'] },
  rahu: { friends: ['mercury', 'venus', 'saturn'], enemies: ['sun', 'moon', 'mars'], neutrals: ['jupiter'] },
  ketu: { friends: ['mars', 'venus', 'saturn'], enemies: ['sun', 'moon'], neutrals: ['mercury', 'jupiter'] }
};

const COMBUSTION_ORBS = {
  moon: 12,
  mars: 17,
  mercury: { direct: 14, retro: 12 },
  jupiter: 11,
  venus: { direct: 10, retro: 8 },
  saturn: 15
};

function calculateNakshatraAndPada(absLon) {
  const normLon = ((absLon % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(normLon / (360 / 27));
  const nak = NAKSHATRAS[nakshatraIndex % 27];
  
  const span = 360 / 27; // 13°20' = 13.333333°
  const degInNak = normLon - (nakshatraIndex * span);
  const pada = Math.min(4, Math.floor(degInNak / (span / 4)) + 1);

  return {
    nakshatra: nak.name,
    nakshatra_lord: nak.lord,
    pada,
    degInNak: Number(degInNak.toFixed(2))
  };
}

function calculateDignity(planetName, signName, degreeInSign) {
  const p = planetName.toLowerCase();
  const rule = EXALTATION_DEBILITATION[p];
  if (!rule) return 'Neutral';

  if (signName === rule.exaltedSign) return 'Exalted';
  if (signName === rule.debilitatedSign) return 'Debilitated';

  const mool = MOOLATRIKONA[p];
  if (mool && signName === mool.sign && degreeInSign >= mool.start && degreeInSign <= mool.end) {
    return 'Moolatrikona';
  }

  const signLord = SIGN_LORDS[signName];
  if (signLord === p) return 'Own Sign';

  const friendships = NATURAL_FRIENDSHIPS[p];
  if (friendships) {
    if (friendships.friends.includes(signLord)) return 'Friendly Sign';
    if (friendships.enemies.includes(signLord)) return 'Enemy Sign';
    return 'Neutral Sign';
  }

  return 'Neutral';
}

function checkCombustion(planetName, planetAbsLon, sunAbsLon, isRetrograde = false) {
  const p = planetName.toLowerCase();
  if (p === 'sun' || p === 'rahu' || p === 'ketu') return false;

  const orbLimit = COMBUSTION_ORBS[p];
  if (!orbLimit) return false;

  let limit = typeof orbLimit === 'number' ? orbLimit : (isRetrograde ? orbLimit.retro : orbLimit.direct);
  let diff = Math.abs(planetAbsLon - sunAbsLon);
  if (diff > 180) diff = 360 - diff;

  return diff <= limit;
}

function calculateFunctionalBeneficsMalefics(lagnaSign) {
  const BENEFIC_MALEFIC_MAP = {
    Aries: { benefics: ['sun', 'jupiter', 'mars'], malefics: ['mercury', 'venus', 'saturn'], yogakaraka: ['sun', 'mars'] },
    Taurus: { benefics: ['saturn', 'mercury', 'sun'], malefics: ['jupiter', 'moon', 'venus'], yogakaraka: ['saturn'] },
    Gemini: { benefics: ['venus', 'mercury'], malefics: ['mars', 'jupiter', 'sun'], yogakaraka: ['venus'] },
    Cancer: { benefics: ['moon', 'mars', 'jupiter'], malefics: ['mercury', 'venus'], yogakaraka: ['mars'] },
    Leo: { benefics: ['sun', 'mars', 'jupiter'], malefics: ['mercury', 'venus', 'saturn'], yogakaraka: ['mars'] },
    Virgo: { benefics: ['mercury', 'venus'], malefics: ['mars', 'jupiter', 'moon'], yogakaraka: ['venus'] },
    Libra: { benefics: ['saturn', 'mercury', 'venus'], malefics: ['sun', 'mars', 'jupiter'], yogakaraka: ['saturn'] },
    Scorpio: { benefics: ['sun', 'moon', 'jupiter', 'mars'], malefics: ['mercury', 'venus'], yogakaraka: ['sun', 'moon'] },
    Sagittarius: { benefics: ['jupiter', 'sun', 'mars'], malefics: ['venus', 'mercury'], yogakaraka: ['sun', 'mars'] },
    Capricorn: { benefics: ['venus', 'mercury', 'saturn'], malefics: ['mars', 'jupiter', 'moon'], yogakaraka: ['venus'] },
    Aquarius: { benefics: ['venus', 'saturn', 'mercury'], malefics: ['jupiter', 'moon', 'mars'], yogakaraka: ['venus'] },
    Pisces: { benefics: ['jupiter', 'moon', 'mars'], malefics: ['sun', 'mercury', 'venus', 'saturn'], yogakaraka: ['mars', 'moon'] }
  };

  return BENEFIC_MALEFIC_MAP[lagnaSign] || { benefics: ['jupiter', 'venus', 'mercury'], malefics: ['saturn', 'mars', 'rahu', 'ketu'], yogakaraka: [] };
}

function calculateVimshottariDasha(moonAbsLon, birthDateStr) {
  const normMoonLon = ((moonAbsLon % 360) + 360) % 360;
  const nakIndex = Math.floor(normMoonLon / (360 / 27));
  const nak = NAKSHATRAS[nakIndex % 27];
  
  const span = 360 / 27; // 13.333333°
  const degTraversed = normMoonLon - (nakIndex * span);
  const fractionRemaining = 1 - (degTraversed / span);

  const startLord = nak.lord;
  const totalYearsOfStart = DASHA_YEARS[startLord] || 7;
  const balanceYears = fractionRemaining * totalYearsOfStart;

  // Parse birth year
  const parts = String(birthDateStr).replace(/[^0-9/ -]/g, '').split(/[-/]/).map(Number);
  let birthYear = 2005;
  if (parts.length === 3) {
    birthYear = parts[0] > 1900 ? parts[0] : parts[2];
  }

  const timeline = [];
  let currentYear = birthYear;
  
  const startIndex = DASHA_SEQUENCE.indexOf(startLord);
  
  // First (birth) balance Dasha
  const firstEnd = Number((currentYear + balanceYears).toFixed(1));
  timeline.push({
    lord: startLord.charAt(0).toUpperCase() + startLord.slice(1),
    startYear: Math.round(currentYear),
    endYear: Math.round(firstEnd),
    isBirthDasha: true
  });
  currentYear = firstEnd;

  // Subsequent Dashas for 120-year cycle
  for (let i = 1; i < DASHA_SEQUENCE.length; i++) {
    const lord = DASHA_SEQUENCE[(startIndex + i) % DASHA_SEQUENCE.length];
    const duration = DASHA_YEARS[lord];
    const end = currentYear + duration;
    timeline.push({
      lord: lord.charAt(0).toUpperCase() + lord.slice(1),
      startYear: Math.round(currentYear),
      endYear: Math.round(end),
      durationYears: duration
    });
    currentYear = end;
  }

  const nowYear = new Date().getFullYear();
  const currentDasha = timeline.find(d => nowYear >= d.startYear && nowYear <= d.endYear) || timeline[0];

  return {
    birth_nakshatra: nak.name,
    starting_mahadasha: startLord.charAt(0).toUpperCase() + startLord.slice(1),
    balance_years_at_birth: Number(balanceYears.toFixed(2)),
    current_mahadasha: currentDasha.lord,
    current_mahadasha_period: `${currentDasha.startYear} - ${currentDasha.endYear}`,
    timeline
  };
}

function evaluateTraditionalYogas(chartPlanets, houses, dignities, combustions) {
  const verifiedYogas = [];
  const rejectedYogas = [];

  const houseOf = {};
  Object.entries(chartPlanets).forEach(([p, data]) => {
    houseOf[p.toLowerCase()] = data.house;
  });

  // 1. Gajakesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
  if (houseOf.jupiter && houseOf.moon) {
    const dist = ((houseOf.jupiter - houseOf.moon + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(dist) && dignities.jupiter !== 'Debilitated' && dignities.moon !== 'Debilitated') {
      verifiedYogas.push({
        id: 'gajakesari_yoga',
        name: 'Gajakesari Yoga',
        status: 'Present',
        strength: dignities.jupiter === 'Exalted' || dignities.jupiter === 'Own Sign' ? 'Strong' : 'Moderate',
        evidence: `Jupiter is in house ${houseOf.jupiter} (${dist}th Kendra from Moon in house ${houseOf.moon}) without debilitation.`,
        traditional_effect: 'Bestows intellectual eminence, enduring reputation, sound moral judgment, and protective fortune.'
      });
    } else {
      rejectedYogas.push('Gajakesari Yoga (Jupiter not in auspicious Kendra from Moon)');
    }
  }

  // 2. Budhaditya Yoga: Sun and Mercury in the same sign/house
  if (houseOf.sun && houseOf.mercury && houseOf.sun === houseOf.mercury) {
    const isCombust = combustions.mercury;
    verifiedYogas.push({
      id: 'budhaditya_yoga',
      name: 'Budhaditya Yoga',
      status: 'Present',
      strength: isCombust ? 'Moderate (Mercury Combust)' : 'Strong',
      evidence: `Sun and Mercury conjoined in House ${houseOf.sun} (${chartPlanets.sun.sign}).`,
      traditional_effect: 'Sharpens analytical acumen, executive communication skills, administrative competence, and strategic discrimination.'
    });
  }

  // 3. Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Sasa)
  const kendraHouses = [1, 4, 7, 10];
  
  // Ruchaka (Mars in Kendra + Exalted/Own)
  if (kendraHouses.includes(houseOf.mars) && ['Capricorn', 'Aries', 'Scorpio'].includes(chartPlanets.mars?.sign)) {
    verifiedYogas.push({
      id: 'ruchaka_yoga',
      name: 'Ruchaka Mahapurusha Yoga',
      status: 'Present',
      strength: 'High',
      evidence: `Mars exalted or in own sign in Kendra House ${houseOf.mars}.`,
      traditional_effect: 'Endows heroic physical courage, leadership authority, executive prowess, and strategic distinction.'
    });
  }

  // Bhadra (Mercury in Kendra + Exalted/Own)
  if (kendraHouses.includes(houseOf.mercury) && ['Virgo', 'Gemini'].includes(chartPlanets.mercury?.sign) && !combustions.mercury) {
    verifiedYogas.push({
      id: 'bhadra_yoga',
      name: 'Bhadra Mahapurusha Yoga',
      status: 'Present',
      strength: 'High',
      evidence: `Mercury placed in Kendra House ${houseOf.mercury} in own/exalted sign.`,
      traditional_effect: 'Grants towering intellectual mastery, scholarly eloquence, commerce acumen, and longevity.'
    });
  }

  // Hamsa (Jupiter in Kendra + Exalted/Own)
  if (kendraHouses.includes(houseOf.jupiter) && ['Cancer', 'Sagittarius', 'Pisces'].includes(chartPlanets.jupiter?.sign)) {
    verifiedYogas.push({
      id: 'hamsa_yoga',
      name: 'Hamsa Mahapurusha Yoga',
      status: 'Present',
      strength: 'High',
      evidence: `Jupiter placed in Kendra House ${houseOf.jupiter} in own/exalted sign.`,
      traditional_effect: 'Grants noble ethical character, righteous wisdom, spiritual authority, and universal goodwill.'
    });
  }

  // Malavya (Venus in Kendra + Exalted/Own)
  if (kendraHouses.includes(houseOf.venus) && ['Pisces', 'Taurus', 'Libra'].includes(chartPlanets.venus?.sign)) {
    verifiedYogas.push({
      id: 'malavya_yoga',
      name: 'Malavya Mahapurusha Yoga',
      status: 'Present',
      strength: 'High',
      evidence: `Venus placed in Kendra House ${houseOf.venus} in own/exalted sign.`,
      traditional_effect: 'Endows aesthetic sophistication, refined magnetism, marital prosperity, and material luxury.'
    });
  }

  // Sasa (Saturn in Kendra + Exalted/Own)
  if (kendraHouses.includes(houseOf.saturn) && ['Libra', 'Capricorn', 'Aquarius'].includes(chartPlanets.saturn?.sign)) {
    verifiedYogas.push({
      id: 'sasa_yoga',
      name: 'Sasa Mahapurusha Yoga',
      status: 'Present',
      strength: 'High',
      evidence: `Saturn placed in Kendra House ${houseOf.saturn} in own/exalted sign.`,
      traditional_effect: 'Grants profound organizational perseverance, mastery over mass enterprises, and enduring historical legacy.'
    });
  }

  // 4. Chandra-Mangala Yoga (Moon + Mars conjunction or mutual aspect)
  if (houseOf.moon && houseOf.mars && houseOf.moon === houseOf.mars) {
    verifiedYogas.push({
      id: 'chandra_mangala_yoga',
      name: 'Chandra-Mangala Yoga',
      status: 'Present',
      strength: 'Moderate',
      evidence: `Moon and Mars conjoined in House ${houseOf.moon}.`,
      traditional_effect: 'Energizes commercial drive, resourcefulness, financial determination, and assertive enterprise.'
    });
  }

  // 5. Viparita Raja Yoga (Lords of 6, 8, 12 in 6, 8, or 12)
  const dusthanaHouses = [6, 8, 12];
  // Simple check for 8th lord in 8th or 6th lord in 6th
  if (dusthanaHouses.includes(houseOf.saturn) && ['Capricorn', 'Aquarius'].includes(chartPlanets.saturn?.sign)) {
    verifiedYogas.push({
      id: 'sarala_yoga',
      name: 'Sarala Viparita Raja Yoga',
      status: 'Present',
      strength: 'Moderate',
      evidence: `Saturn as dusthana lord strong in own dusthana house ${houseOf.saturn}.`,
      traditional_effect: 'Enables native to overcome sudden setbacks, triumph over adversaries, and achieve breakthroughs through perseverance.'
    });
  }

  return { verifiedYogas, rejectedYogas };
}

module.exports = {
  calculateNakshatraAndPada,
  calculateDignity,
  checkCombustion,
  calculateFunctionalBeneficsMalefics,
  calculateVimshottariDasha,
  evaluateTraditionalYogas,
  ZODIAC_SIGNS,
  SIGN_LORDS,
  NAKSHATRAS
};
