const AstroCalendarEvent = require('../models/AstroCalendarEvent');
const Profile = require('../models/Profile');
const {
  getAstrologicalEvents,
  getBirthdayEvent,
  generateIcsCalendar,
  getDailyInsight,
} = require('../services/astroCalendarService');

/**
 * GET /api/calendar/events?year=YYYY&month=MM
 * Returns all astrological events, birthday, and user custom special days
 */
async function getCalendarEvents(req, res) {
  const userId = req.user ? req.user.id || req.user._id : null;
  const now = new Date();
  const year = parseInt(req.query.year || now.getFullYear(), 10);
  const month = parseInt(req.query.month || now.getMonth() + 1, 10);

  // 1. Get system astrological & moon phase events for month
  const astroEvents = getAstrologicalEvents(year, month);

  // 2. Fetch User Profile to get birthdate
  let birthdayEvent = null;
  let userCustomEvents = [];

  if (userId) {
    const profile = await Profile.findOne({ user_id: userId });
    if (profile && profile.date_of_birth) {
      birthdayEvent = getBirthdayEvent(profile.date_of_birth, year, month);
    }

    // 3. Fetch User Custom Special Days for this month
    const monthStr = String(month).padStart(2, '0');
    const dateRegex = new RegExp(`^${year}-${monthStr}`);
    
    const dbEvents = await AstroCalendarEvent.find({
      userId,
      date: dateRegex,
    }).sort({ date: 1 });

    userCustomEvents = dbEvents.map((e) => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      date: e.date,
      category: e.category || 'special_day',
      isSystem: false,
      isRecurring: e.isRecurring,
      icon: e.category === 'puja' ? '🪔' : e.category === 'fast' ? '🌙' : '⭐',
    }));
  }

  // Combine all events into a unified list
  const allEvents = [...astroEvents];
  if (birthdayEvent) {
    allEvents.push(birthdayEvent);
  }
  allEvents.push(...userCustomEvents);

  // Sort events chronologically by date
  allEvents.sort((a, b) => a.date.localeCompare(b.date));

  return res.json({
    success: true,
    year,
    month,
    events: allEvents,
  });
}

/**
 * POST /api/calendar/custom-events
 * Add a new dynamic special day for the user
 */
async function createCustomEvent(req, res) {
  const userId = req.user ? req.user.id || req.user._id : null;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { title, description, date, category, isRecurring } = req.body;

  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Title and Date (YYYY-MM-DD) are required' });
  }

  const newEvent = await AstroCalendarEvent.create({
    userId,
    title,
    description: description || '',
    date,
    category: category || 'special_day',
    isRecurring: !!isRecurring,
  });

  return res.status(201).json({
    success: true,
    event: {
      id: newEvent._id.toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      category: newEvent.category,
      isSystem: false,
      isRecurring: newEvent.isRecurring,
      icon: newEvent.category === 'puja' ? '🪔' : newEvent.category === 'fast' ? '🌙' : '⭐',
    },
  });
}

/**
 * DELETE /api/calendar/custom-events/:id
 * Remove a user's custom event
 */
async function deleteCustomEvent(req, res) {
  const userId = req.user ? req.user.id || req.user._id : null;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const eventId = req.params.id;
  const deleted = await AstroCalendarEvent.findOneAndDelete({ _id: eventId, userId });

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
  }

  return res.json({ success: true, message: 'Event deleted successfully' });
}

/**
 * GET /api/calendar/export-ics
 * Returns standard .ics file stream for device native calendar sync
 */
async function exportIcsCalendar(req, res) {
  const userId = req.user ? req.user.id || req.user._id : null;
  const year = new Date().getFullYear();

  const allYearEvents = [];
  for (let m = 1; m <= 12; m++) {
    const astro = getAstrologicalEvents(year, m);
    allYearEvents.push(...astro);
  }

  if (userId) {
    const profile = await Profile.findOne({ user_id: userId });
    if (profile && profile.date_of_birth) {
      for (let m = 1; m <= 12; m++) {
        const bday = getBirthdayEvent(profile.date_of_birth, year, m);
        if (bday) allYearEvents.push(bday);
      }
    }

    const customEvents = await AstroCalendarEvent.find({ userId });
    customEvents.forEach((e) => {
      allYearEvents.push({
        id: e._id.toString(),
        title: e.title,
        description: e.description,
        date: e.date,
        isRecurring: e.isRecurring,
      });
    });
  }

  const icsData = generateIcsCalendar(allYearEvents, 'Astro AI Cosmic Calendar');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="astro-calendar.ics"');
  return res.send(icsData);
}

/**
 * POST /api/calendar/daily-insight
 * Calculate & return high-precision daily astrological reading using Swiss Ephemeris
 */
async function fetchDailyInsightController(req, res) {
  const dateStr = req.body.date || req.query.date || new Date().toISOString().split('T')[0];
  const reading = getDailyInsight(dateStr);
  return res.json(reading);
}

module.exports = {
  getCalendarEvents,
  createCustomEvent,
  deleteCustomEvent,
  exportIcsCalendar,
  fetchDailyInsightController,
};
