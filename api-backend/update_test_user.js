const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const update = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await User.updateOne({ email: 'personalaffiliator@gmail.com' }, { $set: { credits: 10 } });
  console.log('Update result:', result);
  process.exit(0);
};

update();
