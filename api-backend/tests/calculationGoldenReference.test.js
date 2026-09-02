const assert = require('node:assert/strict');
const test = require('node:test');
const { calculateKundliChart, getJulianDayUTC, getLahiriAyanamsha } = require('../services/kundliCalculator');
const {
  calculateNakshatraAndPada,
  calculateDignity,
  checkCombustion,
  calculateFunctionalBeneficsMalefics,
  calculateVimshottariDasha,
  ZODIAC_SIGNS,
  NAKSHATRAS
} = require('../services/vedicRulesEngine');
const {
  calculateNumerology,
  calculateLifePath,
  calculateDestinyNumber,
  calculateSoulUrge,
  calculatePersonality,
  calculatePersonalYear,
  reduceNumber,
  letterToNumber
} = require('../utils/numerology');

// Helper to assert numeric tolerance
function assertClose(actual, expected, tolerance = 0.05, label = '') {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    `[${label}] Expected ${actual} to be within ${tolerance} of ${expected} (actual diff: ${diff.toFixed(4)})`
  );
}

test('--- GOLDEN REFERENCE VALIDATION SUITE ---', async (t) => {

  await t.test('1. Numerology Engine: Deterministic Arithmetic & Master Numbers', () => {
    // Basic single digit reduction
    assert.equal(reduceNumber(5), 5);
    assert.equal(reduceNumber(14), 5); // 1 + 4 = 5
    assert.equal(reduceNumber(99), 9); // 9+9=18 -> 1+8=9
    assert.equal(reduceNumber(12345), 6); // 1+2+3+4+5=15 -> 1+5=6

    // Master Numbers (11, 22, 33 should not be reduced)
    assert.equal(reduceNumber(11), 11);
    assert.equal(reduceNumber(22), 22);
    assert.equal(reduceNumber(33), 33);

    // Life Path standard dates
    // 1990-05-15: 1+9+9+0+0+5+1+5 = 30 -> 3+0 = 3
    const lp1 = calculateLifePath('1990-05-15');
    assert.equal(lp1.lifePath, 3);
    assert.equal(lp1.lifePathReduced, 3);

    // 1989-11-28: 1+9+8+9+1+1+2+8 = 39 -> 3+9=12 -> 1+2 = 3
    const lp2 = calculateLifePath('1989-11-28');
    assert.equal(lp2.lifePath, 3);

    // Master Number 11: 1985-07-25: 1+9+8+5+0+7+2+5 = 37 -> 3+7 = 10 -> 1
    // Master Number 11 date: 1975-07-08 -> 1+9+7+5+0+7+0+8 = 37 -> 10 -> 1
    // 1999-09-29 -> 1+9+9+9+0+9+2+9 = 48 -> 4+8 = 12 -> 3
    // Master Number 11: 1998-04-24 -> 1+9+9+8+0+4+2+4 = 37? 1+9+9+8=27, 4+2+4=10, 27+10=37 -> 1
    // Master 11: 1979-05-23 -> 1+9+7+9+0+5+2+3 = 36 -> 9
    // Master 22: 1982-01-01 -> 1+9+8+2+0+1+0+1 = 22 -> Master 22!
    const lpMaster22 = calculateLifePath('1982-01-01');
    assert.equal(lpMaster22.lifePath, 22);
    assert.equal(lpMaster22.lifePathReduced, 4); // 2+2=4

    // Master 11: 1981-01-01 -> 1+9+8+1+0+1+0+1 = 21 -> 3
    // Master 11: 1971-01-01 -> 1+9+7+1+0+1+0+1 = 20 -> 2
    // Master 11: 1991-01-08 -> 1+9+9+1+0+1+0+8 = 29 -> 2+9 = 11!
    const lpMaster11 = calculateLifePath('1991-01-08');
    assert.equal(lpMaster11.lifePath, 11);
    assert.equal(lpMaster11.lifePathReduced, 2);

    // Master 33: 1988-03-04 -> 1+9+8+8+0+3+0+4 = 33!
    const lpMaster33 = calculateLifePath('1988-03-04');
    assert.equal(lpMaster33.lifePath, 33);
    assert.equal(lpMaster33.lifePathReduced, 6);
  });

  await t.test('2. Numerology Engine: Pythagorean Letter Mappings & Edge Cases', () => {
    // Pythagorean Chart checks
    assert.equal(letterToNumber('A'), 1);
    assert.equal(letterToNumber('B'), 2);
    assert.equal(letterToNumber('C'), 3);
    assert.equal(letterToNumber('I'), 9);
    assert.equal(letterToNumber('J'), 1);
    assert.equal(letterToNumber('K'), 2);
    assert.equal(letterToNumber('S'), 1);
    assert.equal(letterToNumber('Z'), 8);

    // Name: "JOHN DOE"
    // J=1, O=6, H=8, N=5 (sum = 20) | D=4, O=6, E=5 (sum = 15) -> Total = 35 -> 3+5 = 8
    const johnDestiny = calculateDestinyNumber('John Doe');
    assert.equal(johnDestiny, 8);

    // Soul Urge (Vowels only: O=6, O=6, E=5 -> 17 -> 1+7 = 8)
    const johnSoulUrge = calculateSoulUrge('John Doe');
    assert.equal(johnSoulUrge, 8);

    // Personality (Consonants only: J=1, H=8, N=5, D=4 -> 18 -> 1+8 = 9)
    const johnPersonality = calculatePersonality('John Doe');
    assert.equal(johnPersonality, 9);

    // Edge Cases: Punctuation, irregular casing, symbols
    const messyNameDestiny = calculateDestinyNumber('  J-o-h-n  D.O.E.!  ');
    assert.equal(messyNameDestiny, 8);

    // Full numerology profile summary
    const numProfile = calculateNumerology({
      full_name: 'John Doe',
      date_of_birth: '1990-05-15'
    });
    assert.equal(numProfile.life_path, 3);
    assert.equal(numProfile.destiny_number, 8);
    assert.equal(numProfile.soul_urge, 8);
    assert.equal(numProfile.personality, 9);
    assert.ok(typeof numProfile.personal_year === 'number');
  });

  await t.test('3. Vedic Rules Engine: 27 Nakshatras & 108 Padas Exact Boundaries', () => {
    // Test the exact 13°20' (13.3333°) segments
    // 0°00' -> Ashwini Pada 1
    const n1 = calculateNakshatraAndPada(0.0);
    assert.equal(n1.nakshatra, 'Ashwini');
    assert.equal(n1.pada, 1);

    // 3°19' -> Ashwini Pada 1
    const n2 = calculateNakshatraAndPada(3.31);
    assert.equal(n2.nakshatra, 'Ashwini');
    assert.equal(n2.pada, 1);

    // 3°21' -> Ashwini Pada 2
    const n3 = calculateNakshatraAndPada(3.35);
    assert.equal(n3.nakshatra, 'Ashwini');
    assert.equal(n3.pada, 2);

    // 13°20' (13.3333°) -> Bharani Pada 1
    const n4 = calculateNakshatraAndPada(13.34);
    assert.equal(n4.nakshatra, 'Bharani');
    assert.equal(n4.pada, 1);

    // 120°00' -> Magha Pada 1 (Ketu ruled)
    const n5 = calculateNakshatraAndPada(120.0);
    assert.equal(n5.nakshatra, 'Magha');
    assert.equal(n5.nakshatra_lord, 'ketu');
    assert.equal(n5.pada, 1);

    // 359°59' -> Revati Pada 4
    const n6 = calculateNakshatraAndPada(359.99);
    assert.equal(n6.nakshatra, 'Revati');
    assert.equal(n6.nakshatra_lord, 'mercury');
    assert.equal(n6.pada, 4);

    // Verify all 27 nakshatras have valid lords
    NAKSHATRAS.forEach((nak, idx) => {
      assert.ok(nak.name, `Nakshatra #${idx} must have name`);
      assert.ok(nak.lord, `Nakshatra ${nak.name} must have lord`);
    });
  });

  await t.test('4. Vedic Rules Engine: Planetary Dignities & Combustions', () => {
    // Sun in Aries -> Exalted
    assert.equal(calculateDignity('sun', 'Aries', 10), 'Exalted');
    // Sun in Libra -> Debilitated
    assert.equal(calculateDignity('sun', 'Libra', 10), 'Debilitated');
    // Sun in Leo (0-20 deg) -> Moolatrikona
    assert.equal(calculateDignity('sun', 'Leo', 15), 'Moolatrikona');
    // Sun in Leo (25 deg) -> Own Sign
    assert.equal(calculateDignity('sun', 'Leo', 25), 'Own Sign');

    // Venus in Pisces -> Exalted
    assert.equal(calculateDignity('venus', 'Pisces', 27), 'Exalted');
    // Venus in Virgo -> Debilitated
    assert.equal(calculateDignity('venus', 'Virgo', 27), 'Debilitated');

    // Mars in Capricorn -> Exalted
    assert.equal(calculateDignity('mars', 'Capricorn', 28), 'Exalted');
    // Mars in Cancer -> Debilitated
    assert.equal(calculateDignity('mars', 'Cancer', 28), 'Debilitated');

    // Jupiter in Cancer -> Exalted
    assert.equal(calculateDignity('jupiter', 'Cancer', 5), 'Exalted');
    // Jupiter in Capricorn -> Debilitated
    assert.equal(calculateDignity('jupiter', 'Capricorn', 5), 'Debilitated');

    // Saturn in Libra -> Exalted
    assert.equal(calculateDignity('saturn', 'Libra', 20), 'Exalted');
    // Saturn in Aries -> Debilitated
    assert.equal(calculateDignity('saturn', 'Aries', 20), 'Debilitated');

    // Combustion testing (Direct vs Retrograde orb limits)
    // Mercury within 14° direct is combust; 15° is not
    assert.equal(checkCombustion('mercury', 50, 55, false), true); // diff 5 <= 14
    assert.equal(checkCombustion('mercury', 50, 65, false), false); // diff 15 > 14
    // Mercury retrograde orb is 12°
    assert.equal(checkCombustion('mercury', 50, 63, true), false); // diff 13 > 12

    // Sun, Rahu, Ketu cannot be combust
    assert.equal(checkCombustion('sun', 50, 50), false);
    assert.equal(checkCombustion('rahu', 50, 50), false);
    assert.equal(checkCombustion('ketu', 50, 50), false);
  });

  await t.test('5. Vedic Rules Engine: Vimshottari Dasha 120-Year Timeline', () => {
    // Moon at 0° (Ashwini starting -> Ketu dasha)
    const dasha1 = calculateVimshottariDasha(0.0, '2000-01-01');
    assert.equal(dasha1.birth_nakshatra, 'Ashwini');
    assert.equal(dasha1.starting_mahadasha, 'Ketu');
    assert.equal(dasha1.balance_years_at_birth, 7); // Full 7 years of Ketu remaining
    assert.equal(dasha1.timeline.length, 9);

    // Sum of durations in full timeline should equal exactly 120 years
    let totalYears = dasha1.balance_years_at_birth;
    for (let i = 1; i < dasha1.timeline.length; i++) {
      totalYears += dasha1.timeline[i].durationYears;
    }
    assertClose(totalYears, 120, 0.01, 'Vimshottari 120-year cycle sum');
  });

  await t.test('6. Functional Benefics and Malefics Across All 12 Lagnas', () => {
    ZODIAC_SIGNS.forEach(sign => {
      const res = calculateFunctionalBeneficsMalefics(sign);
      assert.ok(Array.isArray(res.benefics), `${sign} must have benefics array`);
      assert.ok(Array.isArray(res.malefics), `${sign} must have malefics array`);
      assert.ok(Array.isArray(res.yogakaraka), `${sign} must have yogakaraka array`);
    });

    // Known traditional Jyotish alignments:
    // Taurus Lagna -> Saturn is Yogakaraka (Lord of 9th and 10th)
    assert.ok(calculateFunctionalBeneficsMalefics('Taurus').yogakaraka.includes('saturn'));
    // Cancer Lagna -> Mars is Yogakaraka (Lord of 5th and 10th)
    assert.ok(calculateFunctionalBeneficsMalefics('Cancer').yogakaraka.includes('mars'));
    // Libra Lagna -> Saturn is Yogakaraka (Lord of 4th and 5th)
    assert.ok(calculateFunctionalBeneficsMalefics('Libra').yogakaraka.includes('saturn'));
  });

  await t.test('7. Timezone & Midnight Crossing Julian Day Arithmetic', () => {
    // Case A: Birth 5 minutes after midnight in India (00:05 IST, UTC+5.5 -> 18:35 UTC previous day)
    // 2024-05-01 00:05 IST -> 2024-04-30 18:35 UTC
    const jd1 = getJulianDayUTC('2024-05-01', '00:05', 5.5);
    const jdDirectUTC = getJulianDayUTC('2024-04-30', '18:35', 0);
    assertClose(jd1, jdDirectUTC, 0.0001, 'Midnight crossing IST to UTC previous day');

    // Case B: Birth 5 minutes before midnight in New York (23:55 EDT, UTC-4 -> 03:55 UTC next day)
    // 2024-05-01 23:55 EDT -> 2024-05-02 03:55 UTC
    const jdNY = getJulianDayUTC('2024-05-01', '23:55', -4.0);
    const jdNY_UTC = getJulianDayUTC('2024-05-02', '03:55', 0);
    assertClose(jdNY, jdNY_UTC, 0.0001, 'Midnight crossing West to UTC next day');

    // Case C: Non-integer timezone (Nepal UTC+5:45 = 5.75 hours)
    // 2024-03-15 12:00 Nepal Time -> 2024-03-15 06:15 UTC
    const jdNepal = getJulianDayUTC('2024-03-15', '12:00', 5.75);
    const jdNepalUTC = getJulianDayUTC('2024-03-15', '06:15', 0);
    assertClose(jdNepal, jdNepalUTC, 0.0001, 'Non-integer timezone offset (+5:45)');

    // Case D: Leap Year Feb 29 rollover
    // 2024-03-01 01:00 IST -> 2024-02-29 19:30 UTC
    const jdLeap = getJulianDayUTC('2024-03-01', '01:00', 5.5);
    const jdLeapUTC = getJulianDayUTC('2024-02-29', '19:30', 0);
    assertClose(jdLeap, jdLeapUTC, 0.0001, 'Leap year Feb 29 boundary crossing');
  });

  await t.test('8. Benchmark Reference Charts (Swiss Ephemeris Sidereal Lahiri Verification)', async () => {
    // Benchmark 1: J2000.0 Standard Epoch (2000-01-01 12:00 UTC)
    // Known Lahiri Ayanamsha at J2000.0 is ~23.8571° (23°51'25.5")
    const jdJ2000 = getJulianDayUTC('2000-01-01', '12:00', 0);
    assert.equal(jdJ2000, 2451545.0);
    const ayanJ2000 = getLahiriAyanamsha(jdJ2000);
    assertClose(ayanJ2000, 23.8571, 0.02, 'J2000 Lahiri Ayanamsha');

    // Benchmark 2: Reference Chart 1 - 1990-05-15, 14:30 IST, New Delhi (28.6139° N, 77.2090° E)
    const chart1 = await calculateKundliChart({
      date_of_birth: '1990-05-15',
      time_of_birth: '14:30',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone_offset: 5.5
    });

    assert.equal(chart1.tradition, 'vedic');
    assert.equal(chart1.zodiac, 'sidereal');
    assert.equal(chart1.ayanamsha, 'lahiri');
    assert.equal(chart1.ascendant, 'Virgo');
    assert.equal(chart1.sun_sign, 'Taurus');
    assert.equal(chart1.moon_sign, 'Capricorn');

    // Sun at ~30.55° absolute (0.55° Taurus in Lahiri)
    assertClose(chart1.planets.sun.absolute_longitude, 30.55, 0.05, 'Chart1 Sun Longitude');
    assert.equal(chart1.planets.sun.sign, 'Taurus');

    // Venus Exalted in Pisces (~348.95° absolute / 18.95° Pisces)
    assertClose(chart1.planets.venus.absolute_longitude, 348.95, 0.05, 'Chart1 Venus Longitude');
    assert.equal(chart1.planets.venus.sign, 'Pisces');
    assert.equal(chart1.planets.venus.dignity, 'Exalted');

    // Saturn in Capricorn (~271.53° absolute / 1.53° Capricorn)
    assertClose(chart1.planets.saturn.absolute_longitude, 271.53, 0.05, 'Chart1 Saturn Longitude');
    assert.equal(chart1.planets.saturn.sign, 'Capricorn');
    assert.equal(chart1.planets.saturn.dignity, 'Own Sign');

    // Nodes (Rahu in Capricorn ~287.62°, Ketu in Cancer ~107.62° exact 180° opposite)
    assertClose(
      (chart1.planets.rahu.absolute_longitude + 180) % 360,
      chart1.planets.ketu.absolute_longitude,
      0.01,
      'Rahu & Ketu 180° Opposition'
    );

    // Benchmark 3: Reference Chart 2 - 1980-10-15, 06:30 IST, Mumbai (19.0760° N, 72.8777° E)
    const chart2 = await calculateKundliChart({
      date_of_birth: '1980-10-15',
      time_of_birth: '06:30',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone_offset: 5.5
    });

    assert.equal(chart2.ascendant, 'Virgo');
    assert.equal(chart2.sun_sign, 'Virgo');
    assert.equal(chart2.moon_sign, 'Sagittarius');
    assert.ok(chart2.planets.sun.absolute_longitude >= 170 && chart2.planets.sun.absolute_longitude <= 180);

    // Benchmark 4: Reference Chart 3 - Southern Hemisphere & Western Longitude
    // 1995-12-25, 18:00 UTC-3, Buenos Aires (-34.6037° S, -58.3816° W)
    const chart3 = await calculateKundliChart({
      date_of_birth: '1995-12-25',
      time_of_birth: '18:00',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone_offset: -3.0
    });

    assert.equal(chart3.sun_sign, 'Sagittarius');
    assert.equal(chart3.moon_sign, 'Aquarius');
    assert.ok(chart3.ascendant, 'Ascendant must be calculated for Southern latitudes');
    assert.equal(Object.keys(chart3.houses).length, 12);
  });

  await t.test('9. Benchmark Western Tropical Birth Chart Verification (Swiss Ephemeris Tropical Placidus)', async () => {
    const { calculateWesternBirthChart } = require('../services/westernChartCalculator');

    // Benchmark Western Chart: 1990-05-15, 14:30 IST, New Delhi
    const westernChart = await calculateWesternBirthChart({
      date_of_birth: '1990-05-15',
      time_of_birth: '14:30',
      latitude: 28.6139,
      longitude: 77.2090,
      timezoneOffsetHours: 5.5
    });

    assert.equal(westernChart.zodiac_system, 'Tropical (Western)');
    assert.equal(westernChart.sun_sign, 'Taurus');
    assert.equal(westernChart.moon_sign, 'Capricorn');
    assert.equal(westernChart.ascendant, 'Virgo');

    // Tropical Sun ~24.28° Taurus (54.28° longitude)
    assertClose(westernChart.planets.sun.longitude, 54.28, 0.05, 'Western Sun Longitude');
    assert.equal(westernChart.planets.sun.sign, 'Taurus');

    // Tropical Moon ~25.66° Capricorn (295.66° longitude)
    assertClose(westernChart.planets.moon.longitude, 295.66, 0.05, 'Western Moon Longitude');
    assert.equal(westernChart.planets.moon.sign, 'Capricorn');

    // Tropical Venus in Aries ~12.8° (12.8° longitude)
    assert.equal(westernChart.planets.venus.sign, 'Aries');

    // Placidus House Cusps
    assert.equal(Object.keys(westernChart.houses).length, 12);
    assert.equal(Object.keys(westernChart.house_cusps).length, 12);

    // Elements & Modalities
    assert.ok(typeof westernChart.elements.Earth === 'number');
    assert.ok(typeof westernChart.elements.Water === 'number');
    assert.ok(typeof westernChart.modalities.Fixed === 'number');

    // Aspects Matrix
    assert.ok(Array.isArray(westernChart.aspects));
    assert.ok(westernChart.aspects.length > 0, 'Aspects matrix must contain calculated planetary aspects');
  });
});
