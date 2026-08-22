const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
const { optionalAuth } = require('./middleware/auth');
const { trackVisitor } = require('./middleware/visitorTracker');

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
const palmReadingRoutes = require('./routes/palmReading.routes');
const coffeeReadingRoutes = require('./routes/coffeeReading.routes');
const faceReadingRoutes = require('./routes/faceReading.routes');
const paymentRoutes = require('./routes/payment.routes');
const readingHistoryRoutes = require('./routes/readingHistory.routes');
const creditsRoutes = require('./routes/credits.routes');
const pushRoutes = require('./routes/push.routes');
const contactRoutes = require('./routes/contact.routes');
const tarotReadingRoutes = require('./routes/tarotReading.routes');
const livekitRoutes = require('./routes/livekit.routes');
const calendarRoutes = require('./routes/calendar.routes');
const oracleRoutes = require('./routes/oracle.routes');

const app = express();

app.use(helmet());

// Proper CORS configuration with preflight handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://astroai4u.com',
      'https://www.astroai4u.com',
      'http://localhost:3000',
      'http://localhost:5001',
      'http://localhost:8081',
      'http://localhost:19006',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5001',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:19006',
    ];

    if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200  // Safari needs 200, not 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Handle ALL preflight requests explicitly

// Webhook route needs raw body for signature verification (BEFORE express.json)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Increased body limits for image reading routes (BEFORE route handlers)
app.use('/api/palm-reading', express.json({ limit: '15mb' }));
app.use('/api/coffee-reading', express.json({ limit: '15mb' }));
app.use('/api/face-reading', express.json({ limit: '15mb' }));
app.use('/api/dressing-styler', express.json({ limit: '15mb' }));
app.use('/api/share/style', express.json({ limit: '15mb' }));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Universal Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`\x1b[36m[HTTP INCOMING]\x1b[0m ${new Date().toLocaleTimeString()} ${req.method} ${req.originalUrl || req.url}`);
  next();
});

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get(['/api/health', '/health'], (req, res) => {
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

app.use(optionalAuth);
app.use(trackVisitor);

app.use(['/api/auth', '/auth'], authLimiter, authRoutes);
app.use(['/api/auth', '/auth'], authLimiter, googleAuthRoutes);
app.use(['/api/profile', '/profile'], profileRoutes);
app.use(['/api/numerology', '/numerology'], numerologyRoutes);
app.use(['/api/birth-chart', '/birth-chart'], birthChartRoutes);
app.use(['/api/zodiac', '/zodiac'], zodiacRoutes);
app.use(['/api/debug', '/debug'], debugRoutes);
app.use(['/api/users', '/users'], usersRoutes);
app.use(['/api/admin/emails', '/admin/emails'], adminEmailLimiter, adminEmailsRoutes);
app.use(['/api/conversations', '/conversations'], conversationsRoutes);
app.use(['/api/growth-metrics', '/growth-metrics'], growthMetricsRoutes);
app.use(['/api/compatibility-reports', '/compatibility-reports'], compatibilityReportsRoutes);
app.use(['/api/chat', '/chat'], chatRoutes);
app.use(['/api/gpt', '/gpt'], gptChatRoutes);
app.use(['/api/ai-chat', '/ai-chat'], aiChatRoutes);
app.use(['/api/ai-chat', '/ai-chat'], aiChatHealthRoutes);
app.use(['/api/reports', '/reports'], reportsRoutes);
app.use(['/api/horoscope', '/horoscope'], horoscopeRoutes);
app.use(['/api/dressing-styler', '/dressing-styler'], dressingStylerRoutes);
app.use(['/api', '/'], sharedInsightRoutes);
app.use(['/api', '/'], feedbackRoutes);
app.use(['/api', '/'], sharedChatResponseRoutes);
app.use(['/api/palm-reading', '/palm-reading'], palmReadingRoutes);
app.use(['/api/coffee-reading', '/coffee-reading'], coffeeReadingRoutes);
app.use(['/api/face-reading', '/face-reading'], faceReadingRoutes);
app.use(['/api/payment', '/payment'], paymentRoutes);
app.use(['/api/reading-history', '/reading-history'], readingHistoryRoutes);
app.use(['/api/credits', '/credits'], creditsRoutes);
app.use(['/api/push', '/push'], pushRoutes);
app.use(['/api/contact', '/contact'], contactRoutes);
app.use(['/api/tarot-reading', '/tarot-reading'], tarotReadingRoutes);
app.use(['/api/livekit', '/livekit'], livekitRoutes);
app.use(['/api/calendar', '/calendar'], calendarRoutes);
app.use(['/api/oracle', '/oracle'], oracleRoutes);

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
