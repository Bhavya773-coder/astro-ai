const cron = require('node-cron');
const pushService = require('./pushService');

const HOOKS = {
  MORNING: [
    { title: "Your Morning Synergy", body: "Your next move today matters more than you think." },
    { title: "Astro Insight", body: "You’re about to make a small but important decision." },
    { title: "Today's Energy", body: "The cosmos has a specific plan for your lunch hour. See it." }
  ],
  EVENING: [
    { title: "Critical Update", body: "This is where most people mess up today. Don't be one." },
    { title: "Transit Alert", body: "Something tonight might not go as expected. Adjust now." },
    { title: "Daily Checkpoint", body: "How's your 5 PM focus? Your chart says it's shifting." }
  ],
  NIGHT: [
    { title: "Before You Sleep", body: "You might regret one decision today. See which it was." },
    { title: "The Final Word", body: "Before your day ends… check this final transit tip." },
    { title: "Cosmic Wrap-up", body: "Your aura needs a specific reset tonight. Do this." }
  ]
};

const getRandomHook = (type) => {
  const hooks = HOOKS[type];
  return hooks[Math.floor(Math.random() * hooks.length)];
};

const initScheduler = () => {
  console.log('[Scheduler] Initializing automated notification cycles...');

  // 10:00 AM Notification
  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] Running 10 AM Broadcast');
    const hook = getRandomHook('MORNING');
    await pushService.broadcast({
      ...hook,
      click_action: '/horoscope',
      icon: '/icons/morning-star.png'
    });
  });

  // 5:00 PM Notification
  cron.schedule('0 17 * * *', async () => {
    console.log('[Scheduler] Running 5 PM Broadcast');
    const hook = getRandomHook('EVENING');
    await pushService.broadcast({
      ...hook,
      click_action: '/dashboard',
      icon: '/icons/evening-sun.png'
    });
  });

  // 9:00 PM Notification
  cron.schedule('0 21 * * *', async () => {
    console.log('[Scheduler] Running 9 PM Broadcast');
    const hook = getRandomHook('NIGHT');
    await pushService.broadcast({
      ...hook,
      click_action: '/numerology',
      icon: '/icons/night-moon.png'
    });
  });

  // Test cron (every minute) - comment out in absolute production
  // cron.schedule('* * * * *', () => console.log('[Scheduler] Monitoring cosmic cycles...'));
};

module.exports = { initScheduler };
