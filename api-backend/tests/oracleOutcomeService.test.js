const test = require('node:test');
const assert = require('node:assert/strict');

const { mapOutcome, isStrongMatch, recordOutcome } = require('../services/oracleOutcomeService');

test('outcome choices map to honest statuses without upgrading ambiguity', () => {
  assert.equal(mapOutcome('very_similar').status, 'confirmed_strong');
  assert.equal(mapOutcome('partly').status, 'confirmed_partial');
  assert.equal(mapOutcome('no').status, 'missed');
  assert.equal(mapOutcome('something_else').status, 'awaiting_outcome');
  assert.equal(mapOutcome('not_sure').status, 'awaiting_outcome');
});

test('plain admission that Hope was wrong maps to a miss', () => {
  assert.equal(mapOutcome(undefined, 'Hope was wrong about that').status, 'missed');
  assert.equal(mapOutcome(undefined, 'No, that never happened').status, 'missed');
});

test('only explicit very-similar feedback is a strong match', () => {
  assert.equal(isStrongMatch({ choice: 'very_similar' }), true);
  assert.equal(isStrongMatch({ choice: 'partly' }), false);
  assert.equal(isStrongMatch({ choice: 'something_else', text: 'Something great happened' }), false);
});

test('stored outcomes distinguish user truth from deterministic window comparison', async () => {
  const prediction = {
    prediction_original: {
      text: 'A message is likely this week.',
      time_window: { start: '2026-08-18', end: '2026-08-25' }
    },
    async save() { return this; }
  };
  const originalText = prediction.prediction_original.text;
  await recordOutcome({
    userId: 'u1',
    predictionId: 'p1',
    choice: 'very_similar',
    text: 'The message arrived.',
    eventAt: new Date('2026-08-20T12:00:00Z')
  }, { OraclePrediction: { findOne: async () => prediction } });

  assert.equal(prediction.outcome.user_supplied_truth, true);
  assert.equal(prediction.outcome.truth_source, 'user_report');
  assert.equal(prediction.outcome.prediction_window_match, true);
  assert.equal(prediction.outcome.prediction_window_match_source, 'deterministic_date_comparison');
  assert.equal(prediction.prediction_original.text, originalText);
});
