const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Profile = require('../models/Profile');
const KundliReport = require('../models/KundliReport');

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in env');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);

    const email = 'test_voice@example.com';
    const password = 'password123';

    // Delete existing test user if any
    await User.deleteOne({ email });
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create User
    const user = new User({
      email,
      password_hash,
      is_verified: true,
      credits: 100,
      subscription_plan: 'premium',
      subscription_status: 'active'
    });
    await user.save();
    console.log('User created:', user._id);

    // Delete existing profile
    await Profile.deleteOne({ user_id: user._id });

    // Create Profile
    const profile = new Profile({
      user_id: user._id,
      full_name: 'Bhavya Test',
      date_of_birth: '1995-01-15',
      time_of_birth: '12:30',
      place_of_birth: 'Mumbai, India',
      gender: 'male',
      life_context: {
        career_stage: 'Professional Developer',
        relationship_status: 'Single',
        main_life_focus: 'Career Growth and AI Technology',
        personality_style: 'Analytical and Intuitive',
        primary_life_problem: 'Time management and work-life balance'
      },
      numerology_data: {
        life_path: '5',
        destiny: '7',
        personal_year: '3'
      },
      created_at: new Date()
    });
    await profile.save();
    console.log('Profile created:', profile._id);

    // Delete existing Kundli Report
    await KundliReport.deleteOne({ user_id: user._id });

    // Create Kundli Report
    const kundli = new KundliReport({
      user_id: user._id,
      birth_details: {
        full_name: 'Bhavya Test',
        date_of_birth: '1995-01-15',
        time_of_birth: '12:30',
        place_of_birth: 'Mumbai, India',
        latitude: 19.076,
        longitude: 72.877
      },
      chart_data: {
        ascendant: 'Taurus',
        moon_sign: 'Gemini',
        sun_sign: 'Capricorn',
        nakshatra: 'Ardra',
        planets: {
          sun: { sign: 'Capricorn', house: 9 },
          moon: { sign: 'Gemini', house: 2 },
          mars: { sign: 'Leo', house: 4 },
          mercury: { sign: 'Sagittarius', house: 8 },
          jupiter: { sign: 'Scorpio', house: 7 },
          venus: { sign: 'Aquarius', house: 10 },
          saturn: { sign: 'Pisces', house: 11 },
          rahu: { sign: 'Libra', house: 6 },
          ketu: { sign: 'Aries', house: 12 }
        },
        houses: {
          1: 'Taurus', 2: 'Gemini', 3: 'Cancer', 4: 'Leo', 5: 'Virgo', 6: 'Libra',
          7: 'Scorpio', 8: 'Sagittarius', 9: 'Capricorn', 10: 'Aquarius', 11: 'Pisces', 12: 'Aries'
        }
      },
      interpretation: {
        personality: 'Strong analytical mind, highly communicative, with a spiritual inclination.',
        strengths: 'Intellect, speech, strategic thinking.',
        challenges: 'Overthinking, anxiety.'
      },
      created_at: new Date()
    });
    await kundli.save();
    console.log('Kundli Report created:', kundli._id);

    console.log('Successfully seeded voice test user!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
