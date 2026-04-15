const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const googleAuthRoutes = require('./routes/googleAuth.routes');
const profileRoutes = require('./routes/profile.routes');
const numerologyRoutes = require('./routes/numerology.routes');
const birthChartRoutes = require('./routes/birthChart.routes');
const zodiacRoutes = require('./routes/zodiac.routes');
const debugRoutes = require('./routes/debug.routes');
const usersRoutes = require('./routes/users.routes');
const adminEmailsRoutes = require('./routes/adminEmails.routes');
const conversationsRoutes = require('./routes/conversations.routes');
const growthMetricsRoutes = require('./routes/growthMetrics.routes');
const compatibilityReportsRoutes = require('./routes/compatibilityReports.routes');
const chatRoutes = require('./routes/chat.routes');
const gptChatRoutes = require('./routes/gptChat.routes');
const aiChatRoutes = require('./routes/aiChat.routes');
const aiChatHealthRoutes = require('./routes/aiChatHealth.routes');
const reportsRoutes = require('./routes/reports.routes');
const horoscopeRoutes = require('./routes/horoscope.routes');
const dressingStylerRoutes = require('./routes/dressingStyler.routes');
const sharedInsightRoutes = require('./routes/sharedInsight.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const sharedChatResponseRoutes = require('./routes/sharedChatResponse.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 200)
});

const adminEmailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.ADMIN_EMAIL_RATE_LIMIT_MAX || 60)
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', authLimiter, googleAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/numerology', numerologyRoutes);
app.use('/api/birth-chart', birthChartRoutes);
app.use('/api/zodiac', zodiacRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin/emails', adminEmailLimiter, adminEmailsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/growth-metrics', growthMetricsRoutes);
app.use('/api/compatibility-reports', compatibilityReportsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gpt', gptChatRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/ai-chat', aiChatHealthRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/dressing-styler', dressingStylerRoutes);
app.use('/api', sharedInsightRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', sharedChatResponseRoutes);

const path = require('path');
app.use(express.static(path.join(__dirname, '../website/build')));
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return notFound(req, res, next);
  }
  res.sendFile(path.join(__dirname, '../website/build/index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
