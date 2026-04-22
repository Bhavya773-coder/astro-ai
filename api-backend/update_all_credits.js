const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const updateCredits = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany({}, { $inc: { credits: 40 } });
    console.log(`Successfully updated ${result.modifiedCount} users. Added 40 credits to each.`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating credits:', error);
    process.exit(1);
  }
};

updateCredits();
