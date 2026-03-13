const swisseph = require('@swisseph/node');

// Initialize Swiss Ephemeris
swisseph.setEphemerisPath(process.env.SWISSEPH_PATH || '.');

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

function getJulianDay(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hourStr, minuteStr] = (timeStr || '00:00').split(':');
  const hour = Number(hourStr) + Number(minuteStr || 0) / 60;

  return swisseph.julianDay(year, month, day, hour);
}

function getSignFromLongitude(longitude) {
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[index];
}

function formatDegree(longitude) {
  const deg = longitude % 30;
  return Number(deg.toFixed(2));
}

function calculatePlanet(jdUt, planetConst) {
  const result = swisseph.calculatePosition(jdUt, planetConst);
  if (!result || typeof result.longitude !== 'number') {
    throw new Error(`Swiss Ephemeris error for planet ${planetConst}`);
  }
  const lon = result.longitude;
  return {
    sign: getSignFromLongitude(lon),
    degree: formatDegree(lon)
  };
}

function calculateNodes(jdUt) {
  const rahuRes = swisseph.calculatePosition(jdUt, 10); // Mean node (Rahu)
  if (!rahuRes || typeof rahuRes.longitude !== 'number') {
    throw new Error('Swiss Ephemeris error for Rahu (mean node)');
  }
  const rahuLon = rahuRes.longitude;
  const ketuLon = (rahuLon + 180) % 360;

  return {
    rahu: {
      sign: getSignFromLongitude(rahuLon),
      degree: formatDegree(rahuLon)
    },
    ketu: {
      sign: getSignFromLongitude(ketuLon),
      degree: formatDegree(ketuLon)
    }
  };
}

function calculateHouses(jdUt, latitude, longitude) {
  const houseResult = swisseph.calculateHouses(jdUt, latitude, longitude, 'P'); // Placidus
  
  if (!houseResult || !houseResult.cusps) {
    throw new Error('Swiss Ephemeris error for houses calculation');
  }

  const houses = {};
  for (let i = 1; i <= 12; i += 1) {
    houses[i] = getSignFromLongitude(houseResult.cusps[i]);
  }

  const ascendantLon = houseResult.ascendant;
  const ascendantSign = getSignFromLongitude(ascendantLon);

  return {
    houses,
    ascendant: ascendantSign
  };
}

function calculateMoonSignNakshatra(moonLon) {
  const moonSign = getSignFromLongitude(moonLon);

  // Very simplified Nakshatra calculation: 27 equal parts of 13°20'
  const nakshatraNames = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
    'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
    'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
  ];

  const nakshatraIndex = Math.floor((moonLon / 360) * 27) % 27;
  const nakshatra = nakshatraNames[nakshatraIndex];

  return { moonSign, nakshatra };
}

async function calculateKundliChart(birthDetails) {
  const { date_of_birth, time_of_birth, latitude, longitude } = birthDetails;

  const jdUt = getJulianDay(date_of_birth, time_of_birth);

  // Planets
  const sun = calculatePlanet(jdUt, 0); // Sun
  const moonData = swisseph.calculatePosition(jdUt, 1); // Moon
  if (!moonData || typeof moonData.longitude !== 'number') {
    throw new Error('Swiss Ephemeris error for Moon');
  }
  const moonLon = moonData.longitude;
  const moon = {
    sign: getSignFromLongitude(moonLon),
    degree: formatDegree(moonLon)
  };

  const mars = calculatePlanet(jdUt, 4); // Mars
  const mercury = calculatePlanet(jdUt, 2); // Mercury
  const jupiter = calculatePlanet(jdUt, 5); // Jupiter
  const venus = calculatePlanet(jdUt, 3); // Venus
  const saturn = calculatePlanet(jdUt, 6); // Saturn
  const { rahu, ketu } = calculateNodes(jdUt);

  // Houses and Ascendant
  const { houses, ascendant } = calculateHouses(jdUt, latitude, longitude);

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

