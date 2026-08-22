const OUTCOMES = {
  very_similar: { status: 'confirmed_strong', label: 'Very similar' },
  partly: { status: 'confirmed_partial', label: 'Partly' },
  no: { status: 'missed', label: 'No' },
  something_else: { status: 'awaiting_outcome', label: 'Something else' },
  not_sure: { status: 'awaiting_outcome', label: 'Not sure' }
};

function mapOutcome(choice, text = '') {
  if (choice && OUTCOMES[choice]) return { choice, ...OUTCOMES[choice] };

  const normalized = String(text).trim().toLowerCase();
  if (/\b(hope (?:was|is) wrong|that never happened|did not happen|didn't happen)\b/.test(normalized) || /^no\b/.test(normalized)) {
    return { choice: 'no', ...OUTCOMES.no };
  }
  return { choice: 'not_sure', ...OUTCOMES.not_sure };
}

function isStrongMatch(outcome) {
  return outcome?.choice === 'very_similar';
}

function predictionWindowMatch(prediction, eventAt) {
  const eventTime = new Date(eventAt).getTime();
  const window = prediction?.prediction_original?.time_window;
  const start = Date.parse(window?.start);
  let end = Date.parse(window?.end);
  if (!Number.isFinite(eventTime) || !Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(window.end)) end += 86400000 - 1;
  return eventTime >= start && eventTime <= end;
}

async function recordOutcome({ userId, predictionId, choice, text, eventAt }, models = {}) {
  const OraclePrediction = models.OraclePrediction || require('../models/OraclePrediction');
  const mapped = mapOutcome(choice, text);
  const prediction = await OraclePrediction.findOne({ user_id: userId, prediction_id: predictionId });
  if (!prediction) return null;

  prediction.status = mapped.status;
  prediction.outcome = {
    choice: mapped.choice,
    text: String(text || '').trim(),
    event_at: eventAt || undefined,
    confirmed_at: new Date(),
    user_supplied_truth: true,
    truth_source: 'user_report',
    prediction_window_match: predictionWindowMatch(prediction, eventAt),
    prediction_window_match_source: 'deterministic_date_comparison'
  };
  prediction.user_feedback = {
    text: String(text || '').trim(),
    submitted_at: new Date()
  };
  await prediction.save();
  return prediction;
}

module.exports = { OUTCOMES, mapOutcome, isStrongMatch, predictionWindowMatch, recordOutcome };
