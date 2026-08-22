const OracleAnalyticsEvent = require('../models/OracleAnalyticsEvent');

async function trackOracleEvent({ userId, event, predictionId, questionCluster, metadata = {} }) {
  try {
    await OracleAnalyticsEvent.create({
      user_id: userId,
      event,
      prediction_id: predictionId,
      question_cluster: questionCluster,
      metadata
    });
  } catch (error) {
    console.error('[OracleAnalytics] Event write failed:', error.message);
  }
}

module.exports = { trackOracleEvent };
