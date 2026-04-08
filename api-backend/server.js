
require('dotenv').config();

const { connectDB } = require('./config/db');

async function start() {
  try {
    const { app } = require('./app'); // moved inside function

    await connectDB(process.env.MONGODB_URI);

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API running on port ${PORT}`);
    });

  } catch (err) {
    console.error('💥 Server startup failed:', err);
    process.exit(1);
  }
}

start();