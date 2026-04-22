require('dotenv').config();

const { connectDB } = require('./config/db');
const { app } = require('./app');
const { initScheduler } = require('./services/scheduler');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const start = async () => {
  await connectDB(process.env.MONGODB_URI);
  initScheduler();

  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('💥 Server startup failed:', err);
  process.exit(1);
});






