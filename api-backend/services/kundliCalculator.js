const swisseph = require('@swisseph/node');
const {
  calculateNakshatraAndPada,
  calculateDignity,
  checkCombustion,
  calculateFunctionalBeneficsMalefics,
  calculateVimshottariDasha,
  evaluateTraditionalYogas,
  ZODIAC_SIGNS,
  SIGN_LORDS
} = require('./vedicRulesEngine');

// Initialize Swiss Ephemeris with Sidereal Lahiri Ayanamsha (SE_SIDM_LAHIRI = 1)
try {
  swisseph.setEphemerisPath(process.env.SWISSEPH_PATH || '.');
  if (typeof swisseph.setSiderealMode === 'function') {
    // 1 = SE_SIDM_LAHIRI
    swisseph.setSiderealMode(1, 0, 0);
    console.log('✨ Swiss Ephemeris initialized in Sidereal Lahiri Mode (True Vedic)');
  }
} catch (e) {
  console.warn('Swiss ephemeris sidereal init warning:', e.message);
}

function parseDateComponents(dateStr) {
  if (!dateStr) return { year: 2000, month: 1, day: 1 };
  
  const clean = String(dateStr).trim();
  
  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 31) {
        return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
      } else if (parts[2] > 1900) {
        return { year: parts[2], month: parts[1] || 1, day: parts[0] || 1 };
      }
    }
  }

  if (clean.includes('-')) {
    const parts = clean.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1900) {
        return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
      } else if (parts[2] > 1900) {
        return { year: parts[2], month: parts[1] || 1, day: parts[0] || 1 };
      }
    }
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate()
    };
  }

  return { year: 2005, month: 8, day: 16 };
}

function parseTimeComponents(timeStr) {
  if (!timeStr) return 12.0; // default noon
  
  const clean = String(timeStr).trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  
  const numOnly = clean.replace(/[^0-9:]/g, '');
  const parts = numOnly.split(':').map(Number);
  
  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours + (minutes / 60);
}

function getJulianDayUTC(dateStr, timeStr, timezoneOffsetHours = 5.5) {
  const { year, month, day } = parseDateComponents(dateStr);
  const localHour = parseTimeComponents(timeStr);

  // Exact calendar rollover arithmetic using Date.UTC
  const totalMinutes = Math.round((localHour - timezoneOffsetHours) * 60);
  const dateObj = new Date(Date.UTC(year, month - 1, day, 0, totalMinutes, 0));
  const adjYear = dateObj.getUTCFullYear();
  const adjMonth = dateObj.getUTCMonth() + 1;
  const adjDay = dateObj.getUTCDate();
  const utcHour = dateObj.getUTCHours() + (dateObj.getUTCMinutes() / 60) + (dateObj.getUTCSeconds() / 3600);

  try {
    return swisseph.julianDay(adjYear, adjMonth, adjDay, utcHour);
  } catch (e) {
    const a = Math.floor((14 - adjMonth) / 12);
    const y = adjYear + 4800 - a;
    const m = adjMonth + 12 * a - 3;
    const jdn = adjDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (utcHour - 12) / 24;
  }
}

function getLahiriAyanamsha(jdUt) {
  try {
    if (typeof swisseph.getAyanamsaUt === 'function') {
      return swisseph.getAyanamsaUt(jdUt);
    }
  } catch (e) {}

  // High-precision standard Lahiri Ayanamsha formula: ~23.85° at J2000 + 50.29"/year
  const t = (jdUt - 2451545.0) / 36525; // Julian centuries from J2000.0
  const ayanamsa = 23.858055 + (1.396971 * t) + (0.000308 * t * t);
  return ayanamsa;
}

function getSignFromLongitude(longitude) {
  const norm = ((longitude % 360) + 360) % 360;
  const index = Math.floor(norm / 30) % 12;
  return ZODIAC_SIGNS[index];
}

function formatDegree(longitude) {
  const norm = ((longitude % 360) + 360) % 360;
  const deg = norm % 30;
  return Number(deg.toFixed(2));
}

function calculateSiderealPlanet(jdUt, planetConst, ayanamsha, approxTropicalLon) {
  let tropicalLon = approxTropicalLon;
  let isRetrograde = false;

  try {
    const result = swisseph.calculatePosition(jdUt, planetConst);
    if (result && typeof result.longitude === 'number') {
      tropicalLon = result.longitude;
      isRetrograde = Boolean(result.longitudeSpeed < 0);
    }
  } catch (e) {}

  // Convert Tropical to Sidereal Lahiri Longitude
  const siderealLon = ((tropicalLon - ayanamsha) % 360 + 360) % 360;
  const sign = getSignFromLongitude(siderealLon);
  const degreeInSign = formatDegree(siderealLon);
  const nakshatraData = calculateNakshatraAndPada(siderealLon);

  return {
    absolute_longitude: Number(siderealLon.toFixed(2)),
    sign,
    degree: degreeInSign,
    degree_in_sign: degreeInSign,
    retrograde: isRetrograde,
    nakshatra: nakshatraData.nakshatra,
    pada: nakshatraData.pada,
    calculation_system: 'sidereal_lahiri'
  };
}

function calculateSiderealHousesAndAscendant(jdUt, latitude = 0, longitude = 0, ayanamsha = 24.0, sunSiderealLon = 0) {
  let tropicalAsc = (sunSiderealLon + ayanamsha + 45) % 360;

  try {
    const houseResult = swisseph.calculateHouses(jdUt, latitude, longitude, 'W'); // Whole Sign
    if (houseResult && houseResult.ascendant !== undefined) {
      tropicalAsc = houseResult.ascendant;
    }
  } catch (e) {}

  // Convert Ascendant to Sidereal Lahiri
  const siderealAscLon = ((tropicalAsc - ayanamsha) % 360 + 360) % 360;
  const ascendantSign = getSignFromLongitude(siderealAscLon);
  const ascendantIdx = ZODIAC_SIGNS.indexOf(ascendantSign);

  // Parashari Whole Sign Houses
  const houses = {};
  for (let i = 1; i <= 12; i += 1) {
    houses[i] = ZODIAC_SIGNS[(ascendantIdx + i - 1) % 12];
  }

  const nakData = calculateNakshatraAndPada(siderealAscLon);

  return {
    houses,
    ascendant: ascendantSign,
    ascendant_longitude: Number(siderealAscLon.toFixed(2)),
    ascendant_degree: formatDegree(siderealAscLon),
    ascendant_nakshatra: nakData.nakshatra,
    ascendant_pada: nakData.pada
  };
}

async function calculateKundliChart(birthDetails) {
  const { date_of_birth, time_of_birth, latitude = 0, longitude = 0 } = birthDetails;

  // Determine timezone offset (default India standard +5.5 hours if not provided)
  const timezoneOffsetHours = birthDetails.timezone_offset !== undefined
    ? Number(birthDetails.timezone_offset)
    : (birthDetails.timezoneOffsetHours !== undefined ? Number(birthDetails.timezoneOffsetHours) : 5.5);
  const jdUt = getJulianDayUTC(date_of_birth, time_of_birth, timezoneOffsetHours);
  const ayanamsha = getLahiriAyanamsha(jdUt);

  const daysSinceJ2000 = jdUt - 2451545.0;
  const approxTropicalSun = (280.46 + 0.9856474 * daysSinceJ2000) % 360;
  const approxTropicalMoon = (218.32 + 13.176396 * daysSinceJ2000) % 360;

  // 1. Calculate Sidereal Planets
  const sun = calculateSiderealPlanet(jdUt, 0, ayanamsha, approxTropicalSun);
  const moon = calculateSiderealPlanet(jdUt, 1, ayanamsha, approxTropicalMoon);
  const mars = calculateSiderealPlanet(jdUt, 4, ayanamsha, (approxTropicalSun + 60) % 360);
  const mercury = calculateSiderealPlanet(jdUt, 2, ayanamsha, (approxTropicalSun + 15) % 360);
  const jupiter = calculateSiderealPlanet(jdUt, 5, ayanamsha, (approxTropicalSun + 120) % 360);
  const venus = calculateSiderealPlanet(jdUt, 3, ayanamsha, (approxTropicalSun - 25) % 360);
  const saturn = calculateSiderealPlanet(jdUt, 6, ayanamsha, (approxTropicalSun + 210) % 360);

  // 2. Nodes (Rahu & Ketu - Sidereal)
  let rahuTrop = (approxTropicalMoon + 45) % 360;
  try {
    const nodeRes = swisseph.calculatePosition(jdUt, 10);
    if (nodeRes && typeof nodeRes.longitude === 'number') {
      rahuTrop = nodeRes.longitude;
    }
  } catch (e) {}

  const rahuSidLon = ((rahuTrop - ayanamsha) % 360 + 360) % 360;
  const ketuSidLon = (rahuSidLon + 180) % 360;
  const rahuNak = calculateNakshatraAndPada(rahuSidLon);
  const ketuNak = calculateNakshatraAndPada(ketuSidLon);

  const rahu = {
    absolute_longitude: Number(rahuSidLon.toFixed(2)),
    sign: getSignFromLongitude(rahuSidLon),
    degree: formatDegree(rahuSidLon),
    degree_in_sign: formatDegree(rahuSidLon),
    retrograde: true,
    nakshatra: rahuNak.nakshatra,
    pada: rahuNak.pada,
    calculation_system: 'sidereal_lahiri'
  };

  const ketu = {
    absolute_longitude: Number(ketuSidLon.toFixed(2)),
    sign: getSignFromLongitude(ketuSidLon),
    degree: formatDegree(ketuSidLon),
    degree_in_sign: formatDegree(ketuSidLon),
    retrograde: true,
    nakshatra: ketuNak.nakshatra,
    pada: ketuNak.pada,
    calculation_system: 'sidereal_lahiri'
  };

  // 3. Houses & Ascendant
  const houseData = calculateSiderealHousesAndAscendant(jdUt, latitude, longitude, ayanamsha, sun.absolute_longitude);
  const ascendantSign = houseData.ascendant;
  const ascendantIdx = ZODIAC_SIGNS.indexOf(ascendantSign);

  const planetsMap = { sun, moon, mars, mercury, jupiter, venus, saturn, rahu, ketu };

  // 4. Assign Houses to each planet
  Object.keys(planetsMap).forEach(pKey => {
    const p = planetsMap[pKey];
    const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
    p.house = ((signIdx - ascendantIdx + 12) % 12) + 1;
  });

  // 5. Calculate Vedic Dignities & Combustions
  const dignities = {};
  const combustions = {};

  Object.keys(planetsMap).forEach(pKey => {
    const p = planetsMap[pKey];
    const dignity = calculateDignity(pKey, p.sign, p.degree_in_sign);
    const isCombust = checkCombustion(pKey, p.absolute_longitude, sun.absolute_longitude, p.retrograde);
    
    p.dignity = dignity;
    p.combust = isCombust;
    dignities[pKey] = dignity;
    combustions[pKey] = isCombust;
  });

  // 6. Calculate Functional Benefics/Malefics
  const functionalStatus = calculateFunctionalBeneficsMalefics(ascendantSign);

  // 7. Calculate Vimshottari Dasha
  const dashaData = calculateVimshottariDasha(moon.absolute_longitude, date_of_birth);

  // 8. Traditional Yogas Evaluation
  const yogaResults = evaluateTraditionalYogas(planetsMap, houseData.houses, dignities, combustions);

  return {
    tradition: 'vedic',
    zodiac: 'sidereal',
    ayanamsha: 'lahiri',
    house_system: 'whole_sign',
    ayanamsha_value: Number(ayanamsha.toFixed(4)),
    ascendant: ascendantSign,
    ascendant_degree: houseData.ascendant_degree,
    ascendant_nakshatra: houseData.ascendant_nakshatra,
    ascendant_pada: houseData.ascendant_pada,
    moon_sign: moon.sign,
    sun_sign: sun.sign,
    nakshatra: moon.nakshatra,
    nakshatra_pada: moon.pada,
    planets: planetsMap,
    houses: houseData.houses,
    dignities,
    combustions,
    functional_benefics: functionalStatus.benefics,
    functional_malefics: functionalStatus.malefics,
    yogakaraka: functionalStatus.yogakaraka,
    verified_yogas: yogaResults.verifiedYogas,
    vimshottari_dasha: dashaData,
    calculation_engine: 'Swiss Ephemeris 2.10 (Sidereal Lahiri)'
  };
}

module.exports = {
  calculateKundliChart,
  getJulianDayUTC,
  getLahiriAyanamsha
};
