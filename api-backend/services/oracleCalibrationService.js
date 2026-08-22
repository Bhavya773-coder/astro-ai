const RATED = new Set(['confirmed_strong', 'confirmed_partial', 'missed']);

function blankCounts() {
  return { strong: 0, partial: 0, missed: 0, rated: 0 };
}

function add(counts, status) {
  if (status === 'confirmed_strong') counts.strong += 1;
  if (status === 'confirmed_partial') counts.partial += 1;
  if (status === 'missed') counts.missed += 1;
  counts.rated += 1;
}

function bestGroup(groups) {
  const eligible = Object.entries(groups).filter(([, counts]) => counts.rated >= 3);
  if (!eligible.length) return null;
  eligible.sort((a, b) => {
    const aScore = a[1].strong * 2 + a[1].partial;
    const bScore = b[1].strong * 2 + b[1].partial;
    return bScore - aScore || b[1].rated - a[1].rated || a[0].localeCompare(b[0]);
  });
  return eligible[0][0];
}

function weakestGroup(groups) {
  const eligible = Object.entries(groups).filter(([, counts]) => counts.rated >= 3);
  if (!eligible.length) return null;
  eligible.sort((a, b) => {
    const aScore = a[1].strong * 2 + a[1].partial;
    const bScore = b[1].strong * 2 + b[1].partial;
    return aScore - bScore || b[1].rated - a[1].rated || a[0].localeCompare(b[0]);
  });
  return eligible[0][0];
}

function summarizeCalibration(predictions) {
  const totals = blankCounts();
  const byCategory = {};
  const byHorizon = {};

  for (const prediction of predictions || []) {
    if (!RATED.has(prediction.status)) continue;
    const category = prediction.category || 'uncategorized';
    const horizon = prediction.horizon || 'unspecified';
    byCategory[category] ||= blankCounts();
    byHorizon[horizon] ||= blankCounts();
    add(totals, prediction.status);
    add(byCategory[category], prediction.status);
    add(byHorizon[horizon], prediction.status);
  }

  const bestCategory = bestGroup(byCategory);
  const bestHorizon = bestGroup(byHorizon);
  return {
    totals,
    by_category: byCategory,
    by_horizon: byHorizon,
    strongest_category: bestCategory,
    strongest_horizon: bestHorizon,
    best_category: bestCategory,
    best_horizon: bestHorizon,
    weakest_category: weakestGroup(byCategory),
    weakest_horizon: weakestGroup(byHorizon),
    needs_more_data: totals.rated < 10
  };
}

function canSaveSynchronicity(prediction, explicitSave) {
  return explicitSave === true && prediction?.status === 'confirmed_strong';
}

async function getCalibration(userId, models = {}) {
  const OraclePrediction = models.OraclePrediction || require('../models/OraclePrediction');
  const predictions = await OraclePrediction.find({ user_id: userId, status: { $in: [...RATED] } })
    .select('status category horizon')
    .lean();
  return summarizeCalibration(predictions);
}

async function saveSynchronicity({ userId, predictionId, text, explicitSave }, models = {}) {
  const OraclePrediction = models.OraclePrediction || require('../models/OraclePrediction');
  const OracleMemory = models.OracleMemory || require('../models/OracleMemory');
  const prediction = await OraclePrediction.findOne({ user_id: userId, prediction_id: predictionId }).lean();
  if (!canSaveSynchronicity(prediction, explicitSave)) return null;

  return OracleMemory.create({
    user_id: userId,
    kind: 'synchronicity',
    text: String(text || prediction.outcome?.text || prediction.prediction_original?.text || '').trim(),
    prediction_id: predictionId,
    source_metadata: { prediction_id: predictionId, outcome: 'confirmed_strong' }
  });
}

module.exports = { summarizeCalibration, canSaveSynchronicity, getCalibration, saveSynchronicity };
