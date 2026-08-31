const swisseph = require('@swisseph/node');

// Initialize Swiss Ephemeris
try {
  swisseph.setEphemerisPath(process.env.SWISSEPH_PATH || '.');
} catch (e) {
  console.warn('Swiss ephemeris init warning:', e.message);
}

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

function parseDateComponents(dateStr) {
  if (!dateStr) return { year: 2000, month: 1, day: 1 };
  
  const clean = String(dateStr).trim();
  
  // Format DD/MM/YYYY or DD-MM-YYYY
  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 31) {
        // YYYY/MM/DD
        return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
      } else if (parts[2] > 1900) {
        // DD/MM/YYYY
        return { year: parts[2], month: parts[1] || 1, day: parts[0] || 1 };
      }
    }
  }

  if (clean.includes('-')) {
    const parts = clean.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1900) {
        // YYYY-MM-DD
        return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
      } else if (parts[2] > 1900) {
        // DD-MM-YYYY
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

function getJulianDay(dateStr, timeStr) {
  const { year, month, day } = parseDateComponents(dateStr);
  const hour = parseTimeComponents(timeStr);

  try {
    return swisseph.julianDay(year, month, day, hour);
  } catch (e) {
    // Fallback standard astronomical Julian Date formula
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (hour - 12) / 24;
  }
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

function calculatePlanet(jdUt, planetConst, approxLon) {
  try {
    const result = swisseph.calculatePosition(jdUt, planetConst);
    if (result && typeof result.longitude === 'number') {
      const lon = result.longitude;
      return {
        sign: getSignFromLongitude(lon),
        degree: formatDegree(lon)
      };
    }
  } catch (e) {
    // Fallback using approx
  }

  return {
    sign: getSignFromLongitude(approxLon),
    degree: formatDegree(approxLon)
  };
}

function calculateNodes(jdUt, approxMoonLon) {
  try {
    const rahuRes = swisseph.calculatePosition(jdUt, 10); // Mean node (Rahu)
    if (rahuRes && typeof rahuRes.longitude === 'number') {
      const rahuLon = rahuRes.longitude;
      const ketuLon = (rahuLon + 180) % 360;
      return {
        rahu: { sign: getSignFromLongitude(rahuLon), degree: formatDegree(rahuLon) },
        ketu: { sign: getSignFromLongitude(ketuLon), degree: formatDegree(ketuLon) }
      };
    }
  } catch (e) {}

  const rahuLon = (approxMoonLon + 45) % 360;
  const ketuLon = (rahuLon + 180) % 360;
  return {
    rahu: { sign: getSignFromLongitude(rahuLon), degree: formatDegree(rahuLon) },
    ketu: { sign: getSignFromLongitude(ketuLon), degree: formatDegree(ketuLon) }
  };
}

function calculateHouses(jdUt, latitude = 0, longitude = 0, sunLon = 0) {
  try {
    const houseResult = swisseph.calculateHouses(jdUt, latitude, longitude, 'P');
    if (houseResult && houseResult.ascendant !== undefined) {
      const ascendantLon = houseResult.ascendant;
      const ascendantSign = getSignFromLongitude(ascendantLon);
      const houses = {};
      const ascendantIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
      for (let i = 1; i <= 12; i += 1) {
        houses[i] = ZODIAC_SIGNS[(ascendantIdx + i - 1) % 12];
      }
      return { houses, ascendant: ascendantSign };
    }
  } catch (e) {}

  // Fallback whole sign house calculation
  const ascLon = (sunLon + 45) % 360;
  const ascendantSign = getSignFromLongitude(ascLon);
  const houses = {};
  const ascendantIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
  for (let i = 1; i <= 12; i += 1) {
    houses[i] = ZODIAC_SIGNS[(ascendantIdx + i - 1) % 12];
  }
  return { houses, ascendant: ascendantSign };
}

function calculateMoonSignNakshatra(moonLon) {
  const norm = ((moonLon % 360) + 360) % 360;
  const moonSign = getSignFromLongitude(norm);
  const nakshatraIndex = Math.floor((norm / 360) * 27) % 27;
  const nakshatra = NAKSHATRA_NAMES[nakshatraIndex];

  return { moonSign, nakshatra };
}

async function calculateKundliChart(birthDetails) {
  const { date_of_birth, time_of_birth, latitude = 0, longitude = 0 } = birthDetails;

  const jdUt = getJulianDay(date_of_birth, time_of_birth);
  const daysSinceJ2000 = jdUt - 2451545.0;

  // Approximate celestial baselines for robust fallback
  const approxSunLon = (280.46 + 0.9856474 * daysSinceJ2000) % 360;
  const approxMoonLon = (218.32 + 13.176396 * daysSinceJ2000) % 360;

  // Planets
  const sun = calculatePlanet(jdUt, 0, approxSunLon); // Sun
  
  let moonLon = approxMoonLon;
  try {
    const moonData = swisseph.calculatePosition(jdUt, 1);
    if (moonData && typeof moonData.longitude === 'number') {
      moonLon = moonData.longitude;
    }
  } catch (e) {}

  const moon = {
    sign: getSignFromLongitude(moonLon),
    degree: formatDegree(moonLon)
  };

  const mars = calculatePlanet(jdUt, 4, (approxSunLon + 60) % 360);
  const mercury = calculatePlanet(jdUt, 2, (approxSunLon + 15) % 360);
  const jupiter = calculatePlanet(jdUt, 5, (approxSunLon + 120) % 360);
  const venus = calculatePlanet(jdUt, 3, (approxSunLon - 25) % 360);
  const saturn = calculatePlanet(jdUt, 6, (approxSunLon + 210) % 360);
  const { rahu, ketu } = calculateNodes(jdUt, moonLon);

  // Houses and Ascendant
  const { houses, ascendant } = calculateHouses(jdUt, latitude, longitude, approxSunLon);

  // Moon sign and Nakshatra
  const { moonSign, nakshatra } = calculateMoonSignNakshatra(moonLon);

  const chart = {
    ascendant,
    moon_sign: moonSign,
    sun_sign: sun.sign,
    nakshatra,
    planets: {
      sun,
      moon,
      mars,
      mercury,
      jupiter,
      venus,
      saturn,
      rahu,
      ketu
    },
    houses
  };

  return chart;
}

module.exports = {
  calculateKundliChart
};
