const mongoose = require('mongoose');

const connectDB = async (mongoUri, options = {}) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, options);

  return mongoose.connection;
};

module.exports = { connectDB };
