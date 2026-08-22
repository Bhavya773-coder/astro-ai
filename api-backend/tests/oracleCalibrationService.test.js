const test = require('node:test');
const assert = require('node:assert/strict');

const { summarizeCalibration, canSaveSynchronicity, saveSynchronicity } = require('../services/oracleCalibrationService');

const outcomes = [
  { status: 'confirmed_strong', category: 'love', horizon: 'near_term' },
  { status: 'confirmed_partial', category: 'love', horizon: 'near_term' },
  { status: 'missed', category: 'career', horizon: 'medium_term' },
  { status: 'open', category: 'career', horizon: 'near_term' }
];

test('calibration exposes raw counts and not an accuracy percentage', () => {
  const result = summarizeCalibration(outcomes);

  assert.deepEqual(result.totals, { strong: 1, partial: 1, missed: 1, rated: 3 });
  assert.deepEqual(result.by_category.love, { strong: 1, partial: 1, missed: 0, rated: 2 });
  assert.deepEqual(result.by_horizon.medium_term, { strong: 0, partial: 0, missed: 1, rated: 1 });
  assert.equal(Object.hasOwn(result, 'accuracy'), false);
  assert.equal(Object.hasOwn(result, 'accuracy_percentage'), false);
});

test('small samples are labelled needs more data', () => {
  assert.equal(summarizeCalibration(outcomes).needs_more_data, true);
});

test('personal calibration exposes strongest and weakest observed horizons', () => {
  const result = summarizeCalibration([
    ...Array.from({ length: 3 }, () => ({ status: 'confirmed_strong', category: 'career', horizon: '0-24_hours' })),
    ...Array.from({ length: 3 }, () => ({ status: 'missed', category: 'career', horizon: '30+_days' }))
  ]);
  assert.equal(result.best_horizon, '0-24_hours');
  assert.equal(result.weakest_horizon, '30+_days');
});

test('synchronicity requires explicit save and a confirmed strong match', () => {
  assert.equal(canSaveSynchronicity({ status: 'confirmed_strong' }, true), true);
  assert.equal(canSaveSynchronicity({ status: 'confirmed_partial' }, true), false);
  assert.equal(canSaveSynchronicity({ status: 'confirmed_strong' }, false), false);
});

test('saved synchronicity keeps its prediction provenance', async () => {
  const saved = await saveSynchronicity(
    { userId: 'u1', predictionId: 'p1', explicitSave: true, text: 'The message arrived.' },
    {
      OraclePrediction: {
        findOne: () => ({ lean: async () => ({
          prediction_id: 'p1', status: 'confirmed_strong', outcome: { text: 'It happened' }
        }) })
      },
      OracleMemory: { create: async value => value }
    }
  );

  assert.equal(saved.prediction_id, 'p1');
  assert.deepEqual(saved.source_metadata, { prediction_id: 'p1', outcome: 'confirmed_strong' });
  assert.equal(Object.hasOwn(saved, 'source'), false);
});
