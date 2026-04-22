const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const check = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}, 'email credits');
  console.log('Users found:', users.length);
  users.forEach(u => {
    console.log(`User: ${u.email}, Credits: ${u.credits}, Type: ${typeof u.credits}, Raw: ${JSON.stringify(u.credits)}`);
  });
  process.exit(0);
};

check();
