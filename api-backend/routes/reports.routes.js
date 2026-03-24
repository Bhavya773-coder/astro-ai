const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getKundliReport, getBirthChart } = require('../controllers/reports.controller');

const router = express.Router();

// Get or generate Kundli report for the authenticated user
router.get('/kundli', (req, res, next) => {
  console.log('🚀 Kundli route hit!', req.method, req.url);
  next();
}, requireAuth, (req, res, next) => {
  console.log('✅ Auth passed for user:', req.user?.userId);
  next();
}, getKundliReport);

// Get birth chart data for authenticated user (uses kundli_reports as primary source)
router.get('/birth-chart', (req, res, next) => {
  console.log('🚀 Birth Chart route hit!', req.method, req.url);
  next();
}, requireAuth, (req, res, next) => {
  console.log('✅ Auth passed for user:', req.user?.userId);
  next();
}, getBirthChart);

module.exports = router;
