const swisseph = require('@swisseph/node');

// Set ephemeris path
try {
  swisseph.setEphemerisPath(process.env.SWISSEPH_PATH || '.');
} catch (e) {
  console.warn('Swiss ephemeris path init warning:', e.message);
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_ELEMENTS = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
};

const SIGN_MODALITIES = {
  'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
  'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
  'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
};

const PLANET_IDS = {
  sun: swisseph.Planet?.Sun ?? 0,
  moon: swisseph.Planet?.Moon ?? 1,
  mercury: swisseph.Planet?.Mercury ?? 2,
  venus: swisseph.Planet?.Venus ?? 3,
  mars: swisseph.Planet?.Mars ?? 4,
  jupiter: swisseph.Planet?.Jupiter ?? 5,
  saturn: swisseph.Planet?.Saturn ?? 6,
  uranus: swisseph.Planet?.Uranus ?? 7,
  neptune: swisseph.Planet?.Neptune ?? 8,
  pluto: swisseph.Planet?.Pluto ?? 9,
  north_node: swisseph.LunarPoint?.TrueNode ?? 11,
  chiron: 15
};

const MAJOR_ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8, nature: 'Major' },
  { name: 'Opposition', angle: 180, orb: 8, nature: 'Challenging' },
  { name: 'Trine', angle: 120, orb: 8, nature: 'Harmonious' },
  { name: 'Square', angle: 90, orb: 7, nature: 'Tension' },
  { name: 'Sextile', angle: 60, orb: 6, nature: 'Opportunity' }
];

function parseDateComponents(dateStr) {
  if (!dateStr) return { year: 2000, month: 1, day: 1 };
  const clean = String(dateStr).trim();

  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 31) return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
      if (parts[2] > 1900) return { year: parts[2], month: parts[1] || 1, day: parts[0] || 1 };
    }
  }

  if (clean.includes('-')) {
    const parts = clean.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1900) return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
      if (parts[2] > 1900) return { year: parts[2], month: parts[1] || 1, day: parts[0] || 1 };
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

  return { year: 2000, month: 1, day: 1 };
}

function parseTimeComponents(timeStr) {
  if (!timeStr) return 12.0;
  const clean = String(timeStr).trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const numOnly = clean.replace(/[^0-9:]/g, '');
  const parts = numOnly.split(':').map(Number);

  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) hours += 12;
  else if (isAM && hours === 12) hours = 0;

  return hours + (minutes / 60);
}

function getJulianDayUTC(dateStr, timeStr, timezoneOffsetHours = 5.5) {
  const { year, month, day } = parseDateComponents(dateStr);
  const localHour = parseTimeComponents(timeStr);

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
    let jdn = adjDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (utcHour - 12) / 24;
  }
}

function normalizeDegree(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function formatDegree(degreeInSign) {
  const deg = Math.floor(degreeInSign);
  const min = Math.floor((degreeInSign - deg) * 60);
  const sec = Math.round(((degreeInSign - deg) * 60 - min) * 60);
  return `${deg}° ${String(min).padStart(2, '0')}' ${String(sec).padStart(2, '0')}"`;
}

function getZodiacDetails(longitude) {
  const norm = normalizeDegree(longitude);
  const signIndex = Math.floor(norm / 30);
  const sign = ZODIAC_SIGNS[signIndex] || 'Aries';
  const degreeInSign = norm % 30;

  return {
    longitude: Number(norm.toFixed(4)),
    sign,
    sign_index: signIndex,
    degree_in_sign: Number(degreeInSign.toFixed(4)),
    degree: Number(degreeInSign.toFixed(2)),
    formatted: `${Math.floor(degreeInSign)}° ${sign}`,
    element: SIGN_ELEMENTS[sign],
    modality: SIGN_MODALITIES[sign]
  };
}

function calculateAspects(planets) {
  const aspects = [];
  const planetKeys = Object.keys(planets);

  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const p1 = planetKeys[i];
      const p2 = planetKeys[j];
      const long1 = planets[p1].longitude;
      const long2 = planets[p2].longitude;

      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;

      for (const asp of MAJOR_ASPECTS) {
        const orbDist = Math.abs(diff - asp.angle);
        if (orbDist <= asp.orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            aspect: asp.name,
            angle: asp.angle,
            exact_angle: Number(diff.toFixed(2)),
            orb: Number(orbDist.toFixed(2)),
            nature: asp.nature
          });
          break;
        }
      }
    }
  }

  return aspects;
}

function assignHousePlacements(planetLong, houseCusps) {
  const norm = normalizeDegree(planetLong);
  for (let h = 1; h <= 12; h++) {
    const cuspCurrent = normalizeDegree(houseCusps[h]);
    const cuspNext = normalizeDegree(houseCusps[h === 12 ? 1 : h + 1]);

    if (cuspCurrent <= cuspNext) {
      if (norm >= cuspCurrent && norm < cuspNext) return h;
    } else {
      // Wraps around 0° Aries
      if (norm >= cuspCurrent || norm < cuspNext) return h;
    }
  }
  return 1;
}

/**
 * 100% Deterministic Western Tropical Birth Chart Calculator
 */
async function calculateWesternBirthChart({ date_of_birth, time_of_birth, latitude, longitude, timezoneOffsetHours = 5.5 }) {
  const julianDay = getJulianDayUTC(date_of_birth, time_of_birth, timezoneOffsetHours);
  const lat = Number(latitude) || 0.0;
  const lon = Number(longitude) || 0.0;

  // Calculate Placidus Houses (Tropical)
  let houseData;
  try {
    houseData = swisseph.calculateHouses(julianDay, lat, lon, 'P');
  } catch (e) {
    try {
      houseData = swisseph.calculateHouses(julianDay, lat, lon, 'E');
    } catch (err2) {
      houseData = { cusps: [], ascendant: 0, mc: 90 };
    }
  }

  const ascLongitude = normalizeDegree(houseData.ascendant ?? 0);
  const mcLongitude = normalizeDegree(houseData.mc ?? 90);
  const dscLongitude = normalizeDegree(ascLongitude + 180);
  const icLongitude = normalizeDegree(mcLongitude + 180);

  const ascDetails = getZodiacDetails(ascLongitude);
  const mcDetails = getZodiacDetails(mcLongitude);

  // House Cusps (1 through 12)
  const houseCusps = {};
  const housesFormatted = {};
  const rawCusps = Array.isArray(houseData.cusps) ? houseData.cusps : [];

  for (let h = 1; h <= 12; h++) {
    const cusp = normalizeDegree(rawCusps[h] !== undefined ? rawCusps[h] : ((ascLongitude + (h - 1) * 30) % 360));
    houseCusps[h] = cusp;
    const zd = getZodiacDetails(cusp);
    housesFormatted[String(h)] = `${zd.sign} (${zd.formatted})`;
  }

  // Calculate Tropical Planetary Positions using swisseph.calculatePosition
  const planets = {};
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  for (const [planetName, planetId] of Object.entries(PLANET_IDS)) {
    try {
      const calcResult = swisseph.calculatePosition(julianDay, planetId);
      const planetLong = normalizeDegree(calcResult?.longitude ?? 0);
      const speed = calcResult?.longitudeSpeed ?? 1;
      const isRetrograde = Boolean(speed < 0);

      const zd = getZodiacDetails(planetLong);
      const houseNumber = assignHousePlacements(planetLong, houseCusps);

      planets[planetName] = {
        ...zd,
        house: houseNumber,
        retrograde: isRetrograde,
        speed: Number(speed.toFixed(4)),
        detailed_degree: formatDegree(zd.degree_in_sign)
      };

      // Tally elements & modalities (for major celestial bodies)
      if (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(planetName)) {
        elementCounts[zd.element] = (elementCounts[zd.element] || 0) + 1;
        modalityCounts[zd.modality] = (modalityCounts[zd.modality] || 0) + 1;
      }
    } catch (err) {
      console.warn(`Error calculating tropical position for ${planetName}:`, err.message);
    }
  }

  // Include Ascendant in element/modality weighting
  elementCounts[ascDetails.element] = (elementCounts[ascDetails.element] || 0) + 1;
  modalityCounts[ascDetails.modality] = (modalityCounts[ascDetails.modality] || 0) + 1;

  // Major aspects
  const aspects = calculateAspects(planets);

  const sunSign = planets.sun?.sign || 'Aries';
  const moonSign = planets.moon?.sign || 'Taurus';
  const ascendantSign = ascDetails.sign;

  return {
    zodiac_system: 'Tropical (Western)',
    sun_sign: sunSign,
    moon_sign: moonSign,
    ascendant: ascendantSign,
    ascendant_degree: ascDetails.degree,
    ascendant_details: ascDetails,
    midheaven: mcDetails.sign,
    midheaven_details: mcDetails,
    planets,
    houses: housesFormatted,
    house_cusps: houseCusps,
    angles: {
      ascendant: ascDetails,
      midheaven: mcDetails,
      descendant: getZodiacDetails(dscLongitude),
      imum_coeli: getZodiacDetails(icLongitude)
    },
    aspects,
    elements: elementCounts,
    modalities: modalityCounts,
    big_three: {
      sun: { sign: sunSign, degree: planets.sun?.degree, house: planets.sun?.house },
      moon: { sign: moonSign, degree: planets.moon?.degree, house: planets.moon?.house },
      rising: { sign: ascendantSign, degree: ascDetails.degree, house: 1 }
    }
  };
}

module.exports = {
  calculateWesternBirthChart,
  getZodiacDetails,
  getJulianDayUTC,
  ZODIAC_SIGNS,
  SIGN_ELEMENTS,
  SIGN_MODALITIES
};
