const test = require('node:test');
const assert = require('node:assert/strict');

const { validateOracleOutput } = require('../services/oracleValidator');

function validate(overrides = {}) {
  return validateOracleOutput({
    userMessage: 'Will he call me?',
    responseText: 'I am leaning yes, within two weeks.',
    prediction: { text: 'I am leaning yes.', strength: 0.65 },
    previousPrediction: null,
    snapshot: { sources: { kundli: 'unavailable' } },
    ...overrides
  });
}

test('accepts a bounded prediction', () => {
  assert.deepEqual(validate(), { valid: true, violations: [] });
});

test('rejects certainty inflation and guarantees', () => {
  const result = validate({ responseText: 'I am 100% certain. This is guaranteed to happen.' });
  assert.equal(result.valid, false);
  assert.ok(result.violations.includes('certainty_guarantee'));
});

test('rejects rewriting a reused prediction', () => {
  const result = validate({
    prediction: { text: 'No, he will not call.', strength: 0.4 },
    previousPrediction: { prediction_original: { text: 'I am leaning yes.', strength: 0.65 } },
    reused: true
  });
  assert.ok(result.violations.includes('original_prediction_changed'));
});

test('rejects unsupported deterministic astrology claims', () => {
  const result = validate({ responseText: 'Mars is at 15 degrees in your seventh house today.' });
  assert.ok(result.violations.includes('unsupported_deterministic_claim'));
});

test('rejects unsupported deterministic claims hidden in prediction fields', () => {
  const result = validate({
    responseText: 'I see a shift ahead.',
    prediction: {
      text: 'Mars is in your seventh house.',
      strength: 'moderate',
      signals: ['Rahu kalam is at noon.'],
      manifestations: []
    },
    snapshot: { sources: { kundli: 'unavailable' } }
  });
  assert.equal(result.valid, false);
  assert.ok(result.violations.includes('unsupported_deterministic_claim'));
});

test('allows deterministic astrology claims backed by a stored Kundli calculation', () => {
  const result = validate({
    responseText: 'Mars is at 15 degrees in your seventh house.',
    snapshot: { sources: { kundli: 'KundliReport' } }
  });
  assert.equal(result.valid, true);
});

test('rejects third-party accusations presented as fact', () => {
  const result = validate({ responseText: 'He is lying and hiding something from you.' });
  assert.ok(result.violations.includes('third_party_factual_accusation'));
});

test('medical emergency requires real-world urgent guidance', () => {
  const unsafe = validate({
    userMessage: 'I have chest pain and cannot breathe. What do the cards say?',
    responseText: 'The cards suggest resting tonight.'
  });
  const safe = validate({
    userMessage: 'I have chest pain and cannot breathe. What do the cards say?',
    responseText: 'Call emergency services now. This needs urgent medical care; symbolic interpretation can wait.'
  });
  assert.ok(unsafe.violations.includes('missing_emergency_guidance'));
  assert.equal(safe.valid, true);
});
