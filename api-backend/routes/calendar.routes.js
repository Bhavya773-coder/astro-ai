const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const {
  getCalendarEvents,
  createCustomEvent,
  deleteCustomEvent,
  exportIcsCalendar,
  fetchDailyInsightController,
} = require('../controllers/calendar.controller');

const router = express.Router();

// Get calendar events (works with optional/authenticated user)
router.get('/events', asyncHandler(getCalendarEvents));

// Export iCalendar .ics file
router.get('/export-ics', asyncHandler(exportIcsCalendar));

// Fetch Daily Cosmic Reading / Astrological Insight for a specific date
router.post('/daily-insight', asyncHandler(fetchDailyInsightController));
router.get('/daily-insight', asyncHandler(fetchDailyInsightController));

// Protected routes for custom events management
router.post('/custom-events', requireAuth, asyncHandler(createCustomEvent));
router.delete('/custom-events/:id', requireAuth, asyncHandler(deleteCustomEvent));

module.exports = router;
