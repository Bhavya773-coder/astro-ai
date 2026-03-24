const cron = require('node-cron');
const { generateDailyHoroscopes } = require('../services/horoscopeGenerator');

class DailyHoroscopeWorker {
  constructor() {
    this.isRunning = false;
  }

  start() {
    console.log('Starting Daily Horoscope Worker...');
    
    // Schedule job to run every day at 12:00 AM (midnight)
    cron.schedule('0 0 * * *', async () => {
      if (this.isRunning) {
        console.log('Daily horoscope generation is already running. Skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting daily zodiac horoscope generation at midnight:', new Date().toISOString());

      try {
        await generateDailyHoroscopes();
        console.log('Daily zodiac horoscope generation completed successfully');
      } catch (error) {
        console.error('Error in daily zodiac horoscope generation:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // Also run once at startup to ensure today's horoscopes are generated
    this.runOnceAtStartup();
  }

  async runOnceAtStartup() {
    console.log('Running initial horoscope generation check at startup...');
    
    try {
      await generateDailyHoroscopes();
      console.log('Initial zodiac horoscope generation completed');
    } catch (error) {
      console.error('Error in initial horoscope generation:', error);
    }
  }

  // Manual trigger for testing
  async triggerManualGeneration() {
    if (this.isRunning) {
      throw new Error('Horoscope generation is already running');
    }

    this.isRunning = true;
    console.log('Manual zodiac horoscope generation triggered:', new Date().toISOString());

    try {
      await generateDailyHoroscopes();
      console.log('Manual zodiac horoscope generation completed successfully');
    } catch (error) {
      console.error('Error in manual zodiac horoscope generation:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = DailyHoroscopeWorker;
