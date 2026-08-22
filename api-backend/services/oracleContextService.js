const crypto = require('crypto');
const { summarizeCalibration } = require('./oracleCalibrationService');

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.keys(value).sort().reduce((out, key) => {
      if (value[key] !== undefined) out[key] = stable(value[key]);
      return out;
    }, {});
  }
  return value;
}

function plain(value) {
  if (!value) return value;
  if (typeof value.toObject === 'function') return value.toObject();
  return JSON.parse(JSON.stringify(value));
}

function assembleSnapshot({
  userId,
  question,
  profile,
  kundli,
  memories = [],
  recentPredictions = [],
  readingHistory = [],
  chatHistory = [],
  calendarContext = [],
  preferences = {},
  now = new Date()
}) {
  const learning = preferences.personalized_learning !== false;
  const contextual = preferences.contextual_signals !== false;
  const profileData = plain(profile) || null;
  const currentLocation = profileData?.current_location;
  if (!contextual && profileData) {
    delete profileData.current_location;
    if (profileData.life_context) {
      delete profileData.life_context.current_location;
      delete profileData.life_context.location;
    }
  }

  const snapshot = {
    user_id: userId,
    timestamp: now.toISOString(),
    question_context: String(question || '').trim(),
    profile: profileData,
    kundli: plain(kundli) || null,
    reading_history: learning ? readingHistory.map(plain) : [],
    chat_history: learning ? chatHistory.map(plain) : [],
    memories: learning ? memories.map(plain) : [],
    recent_predictions: learning ? recentPredictions.map(plain) : [],
    prediction_profile: learning ? summarizeCalibration(recentPredictions.map(plain)) : null,
    sources: {
      profile: profileData ? 'Profile' : 'unavailable',
      kundli: kundli ? 'KundliReport' : 'unavailable',
      readings: readingHistory.length ? 'ImageReading/Report' : 'unavailable',
      memories: learning && memories.length ? 'OracleMemory' : 'unavailable',
      conversations: learning && chatHistory.length ? 'Message' : 'unavailable'
    }
  };

  if (contextual && (currentLocation || calendarContext.length)) {
    snapshot.contextual_signals = {
      ...(currentLocation && { current_location: currentLocation }),
      ...(calendarContext.length && { calendar: calendarContext.map(plain) }),
      source: calendarContext.length ? 'Profile/AstroCalendarEvent' : 'Profile.current_location'
    };
  }

  const material = {
    profile: snapshot.profile,
    kundli: snapshot.kundli,
    reading_history: snapshot.reading_history,
    memories: snapshot.memories,
    prediction_profile: snapshot.prediction_profile,
    learned_outcomes: snapshot.recent_predictions.filter(item => ['confirmed_strong', 'confirmed_partial', 'missed'].includes(item.status)),
    contextual_signals: snapshot.contextual_signals,
    sources: {
      profile: snapshot.sources.profile,
      kundli: snapshot.sources.kundli,
      readings: snapshot.sources.readings,
      memories: snapshot.sources.memories
    }
  };
  snapshot.material_hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(stable(material)))
    .digest('hex');

  return snapshot;
}

async function buildInputSnapshot({ userId, chatId, question, now = new Date() }, models = {}) {
  const User = models.User || require('../models/User');
  const Profile = models.Profile || require('../models/Profile');
  const KundliReport = models.KundliReport || require('../models/KundliReport');
  const OracleMemory = models.OracleMemory || require('../models/OracleMemory');
  const OraclePrediction = models.OraclePrediction || require('../models/OraclePrediction');
  const ImageReading = models.ImageReading || require('../models/ImageReading');
  const Report = models.Report || require('../models/Report');
  const Chat = models.Chat || require('../models/Chat');
  const Message = models.Message || require('../models/Message');
  const AstroCalendarEvent = models.AstroCalendarEvent || require('../models/AstroCalendarEvent');

  const [user, profile, kundli, memories, recentPredictions, imageReadings, reports, chats, calendarContext] = await Promise.all([
    User.findById(userId).select('oracle_preferences').lean(),
    Profile.findOne({ user_id: userId }).lean(),
    KundliReport.findOne({ user_id: userId }).lean(),
    OracleMemory.find({ user_id: userId }).sort({ created_at: -1 }).limit(30).lean(),
    OraclePrediction.find({ user_id: userId }).sort({ created_at: -1 }).limit(30).lean(),
    ImageReading.find({ user_id: userId }).sort({ created_at: -1 }).limit(12).select('-image_data').lean(),
    Report.find({ user_id: userId }).sort({ generated_at: -1 }).limit(12).lean(),
    chatId ? Promise.resolve([]) : Chat.find({ user_id: userId }).sort({ updated_at: -1 }).limit(5).select('_id').lean(),
    AstroCalendarEvent.find({ userId, date: { $gte: now.toISOString().slice(0, 10) } }).sort({ date: 1 }).limit(20).select('title description date category').lean()
  ]);

  const chatIds = chatId ? [chatId] : chats.map(chat => chat._id);
  const chatHistory = chatIds.length
    ? await Message.find(chatId ? { chat_id: chatId } : { chat_id: { $in: chatIds } })
      .sort({ created_at: -1 })
      .limit(40)
      .select('chat_id role content created_at oracle_prediction_id')
      .lean()
    : [];

  return assembleSnapshot({
    userId,
    question,
    profile,
    kundli,
    memories,
    recentPredictions,
    readingHistory: [...imageReadings, ...reports],
    chatHistory,
    calendarContext,
    preferences: user?.oracle_preferences || {},
    now
  });
}

module.exports = { assembleSnapshot, buildInputSnapshot };
