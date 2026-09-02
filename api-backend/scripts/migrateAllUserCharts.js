require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const KundliReport = require('../models/KundliReport');
const Report = require('../models/Report');
const { calculateKundliChart } = require('../services/kundliCalculator');
const { calculateWesternBirthChart } = require('../services/westernChartCalculator');
const { calculateNumerology } = require('../utils/numerology');
const axios = require('axios');

async function geocodePlace(place) {
  try {
    const url = 'https://nominatim.openstreetmap.org/search';
    const response = await axios.get(url, {
      params: { q: place, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'AstroAi4u-Migration/1.0' }
    });
    if (Array.isArray(response.data) && response.data.length > 0) {
      return {
        latitude: Number(response.data[0].lat),
        longitude: Number(response.data[0].lon)
      };
    }
  } catch (err) {}
  return { latitude: 28.6139, longitude: 77.2090 }; // default New Delhi
}

async function runMigration() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astroai4u';
  console.log(`🔌 Connecting to MongoDB: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  const profiles = await Profile.find({});
  console.log(`📊 Found ${profiles.length} total user profiles.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const profile of profiles) {
    const userId = profile.user_id;
    if (!profile.date_of_birth || !profile.full_name) {
      skippedCount++;
      continue;
    }

    console.log(`\n🌌 Processing User: ${profile.full_name} (${userId})...`);

    try {
      const place = profile.place_of_birth || 'New Delhi, India';
      const coords = await geocodePlace(place);

      const birthDetails = {
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        time_of_birth: profile.time_of_birth || '12:00',
        place_of_birth: place,
        latitude: coords.latitude,
        longitude: coords.longitude
      };

      // 1. Calculate Western Tropical Birth Chart
      const westernChart = await calculateWesternBirthChart({
        date_of_birth: birthDetails.date_of_birth,
        time_of_birth: birthDetails.time_of_birth,
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      // 2. Calculate Vedic Kundli Chart
      const vedicChart = await calculateKundliChart({
        date_of_birth: birthDetails.date_of_birth,
        time_of_birth: birthDetails.time_of_birth,
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      // 3. Calculate Numerology
      const numerology = calculateNumerology({
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth
      });

      // Update Report (Western Birth Chart)
      await Report.findOneAndUpdate(
        { user_id: userId, report_type: 'birth_chart' },
        {
          user_id: userId,
          report_type: 'birth_chart',
          content: {
            birth_details: birthDetails,
            chart_data: westernChart,
            interpretation: {
              personality: `With ${westernChart.sun_sign} Sun, ${westernChart.moon_sign} Moon, and ${westernChart.ascendant} Rising, your chart expresses balanced vitality and intuition.`,
              strengths: `Core vitality in ${westernChart.sun_sign} grants clear leadership and vision.`,
              challenges: `Maintaining steady emotional boundaries.`,
              career: `Vocational calling in ${westernChart.midheaven} alignment.`,
              relationships: `Relational synergy guided by ${westernChart.moon_sign} Moon.`,
              spiritual_path: `Self-actualization path honoring your core gifts.`
            }
          },
          summary: `${westernChart.sun_sign} Sun, ${westernChart.moon_sign} Moon, ${westernChart.ascendant} Rising`,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      // Update KundliReport (Vedic Sidereal)
      await KundliReport.findOneAndUpdate(
        { user_id: userId },
        {
          user_id: userId,
          birth_details: birthDetails,
          chart_data: vedicChart,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      // Update Profile model
      profile.numerology_data = numerology;
      profile.birth_chart_data = {
        sun_sign: String(westernChart.sun_sign || ''),
        moon_sign: String(westernChart.moon_sign || ''),
        ascendant: String(westernChart.ascendant || ''),
        dominant_planet: 'Sun'
      };
      profile.updated_at = new Date();
      await profile.save();

      console.log(`   ✨ Updated: Tropical ${westernChart.sun_sign} Sun / ${westernChart.moon_sign} Moon | Vedic ${vedicChart.sun_sign} Sun / ${vedicChart.moon_sign} Moon`);
      updatedCount++;
    } catch (err) {
      console.error(`   ❌ Failed to process ${profile.full_name}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Migration Completed Successfully!`);
  console.log(`   - Updated Users: ${updatedCount}`);
  console.log(`   - Skipped Profiles (incomplete data): ${skippedCount}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
