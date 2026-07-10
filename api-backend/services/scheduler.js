const cron = require('node-cron');
const pushService = require('./pushService');

const HOOKS = {
  MORNING: [
    { title: "Your Morning Synergy", body: "Your next move today matters more than you think." },
    { title: "Astro Insight", body: "You’re about to make a small but important decision." },
    { title: "Today's Energy", body: "The cosmos has a specific plan for your lunch hour. See it." },
    { title: "Rise & Align", body: "Your chart shows a surge in creativity this morning. Use it." },
    { title: "Wake Up, Believer", body: "A specific alignment at 9 AM will change your focus." }
  ],
  MIDDAY: [
    { title: "Transit Alert", body: "A shift is happening now. Stay grounded during lunch." },
    { title: "Mid-Day Momentum", body: "Your energy is peaking. Now is the time to push for that goal." },
    { title: "Lunchtime Oracle", body: "Someone you meet today holds a key to your next week." },
    { title: "Cosmic Pulse", body: "Your aura is projecting confidence. Make that call now." }
  ],
  AFTERNOON: [
    { title: "Vibe Check", body: "Is your current environment matching your frequency?" },
    { title: "Style Forecast", body: "Your chart suggests a bolder look for the rest of the day." },
    { title: "Opportunity Window", body: "A small window for luck is opening in the next 2 hours." },
    { title: "Focus Shift", body: "Stop looking back. The planets are aligned for a forward leap." }
  ],
  EVENING: [
    { title: "Critical Update", body: "This is where most people mess up today. Don't be one." },
    { title: "Evening Transit", body: "Something tonight might not go as expected. Adjust now." },
    { title: "Daily Checkpoint", body: "How's your 5 PM focus? Your chart says it's shifting." },
    { title: "Sunset Synergy", body: "Release the stress of the day. A new energy is arriving." },
    { title: "Style Shift", body: "Your evening vibe needs a touch of fuchsia. See why." }
  ],
  NIGHT: [
    { title: "Before You Sleep", body: "You might regret one decision today. See which it was." },
    { title: "The Final Word", body: "Before your day ends… check this final transit tip." },
    { title: "Cosmic Wrap-up", body: "Your aura needs a specific reset tonight. Do this." },
    { title: "Dream Gateway", body: "Tonight's lunar position favors lucid insights. Prepare." },
    { title: "Moonlight Wisdom", body: "The stars have a secret for your subconscious tonight." }
  ]
};

const getRandomHook = (category) => {
  const hooks = HOOKS[category] || HOOKS['MORNING'];
  return hooks[Math.floor(Math.random() * hooks.length)];
};

const initScheduler = () => {
  console.log('[Scheduler] Initializing automated 8-cycle notification system...');

  // 08:30 AM - Morning Synergy
  cron.schedule('30 8 * * *', async () => {
    const hook = getRandomHook('MORNING');
    await pushService.broadcast({ ...hook, click_action: '/horoscope', icon: '/icons/morning-star.png' });
  });

  // 10:30 AM - Morning Focus
  cron.schedule('30 10 * * *', async () => {
    const hook = getRandomHook('MORNING');
    await pushService.broadcast({ ...hook, click_action: '/dashboard', icon: '/icons/sun-rise.png' });
  });

  // 12:30 PM - Mid-Day Oracle
  cron.schedule('30 12 * * *', async () => {
    const hook = getRandomHook('MIDDAY');
    await pushService.broadcast({ ...hook, click_action: '/ai-chat', icon: '/icons/lunch-time.png' });
  });

  // 02:30 PM - Afternoon Momentum
  cron.schedule('30 14 * * *', async () => {
    const hook = getRandomHook('AFTERNOON');
    await pushService.broadcast({ ...hook, click_action: '/style-forecaster', icon: '/icons/afternoon-vibe.png' });
  });

  // 04:30 PM - Evening Transition
  cron.schedule('30 16 * * *', async () => {
    const hook = getRandomHook('AFTERNOON');
    await pushService.broadcast({ ...hook, click_action: '/palm-reading', icon: '/icons/evening-sun.png' });
  });

  // 06:30 PM - Evening Insight
  cron.schedule('30 18 * * *', async () => {
    const hook = getRandomHook('EVENING');
    await pushService.broadcast({ ...hook, click_action: '/dashboard', icon: '/icons/sunset.png' });
  });

  // 08:30 PM - Night Reflection
  cron.schedule('30 20 * * *', async () => {
    const hook = getRandomHook('NIGHT');
    await pushService.broadcast({ ...hook, click_action: '/numerology', icon: '/icons/night-moon.png' });
  });

  // 10:30 PM - Sleep Prep
  cron.schedule('30 22 * * *', async () => {
    const hook = getRandomHook('NIGHT');
    await pushService.broadcast({ ...hook, click_action: '/horoscope', icon: '/icons/stars.png' });
  });

  console.log('[Scheduler] 8 daily cycles scheduled successfully.');
};

module.exports = { initScheduler };
