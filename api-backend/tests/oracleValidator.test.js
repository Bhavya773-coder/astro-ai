const test = require('node:test');
const assert = require('node:assert/strict');

const { validateOracleOutput } = require('../services/oracleValidator');
const { validateSignal } = require('../services/signals/schema');
const { createNumerologySignal } = require('../services/signals/numerologySignal');
const { buildWesternSignalMessages, createWesternSignal } = require('../services/signals/westernSignal');
const { reconcile } = require('../services/reconciliationEngine');

const validSignal = {
  module: 'numerology',
  scope: 'macro',
  direction: 'leaning_yes',
  confidence: 0.72,
  data_quality: 'high',
  rationale: 'The personal-year cycle supports expansion.'
};

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

test('signal schema accepts a complete valid signal', () => {
  assert.deepEqual(validateSignal(validSignal), validSignal);
});

test('signal schema rejects every missing required field', () => {
  for (const field of Object.keys(validSignal)) {
    const signal = { ...validSignal };
    delete signal[field];
    assert.throws(() => validateSignal(signal), new RegExp(`Signal missing fields: ${field}`));
  }
});

test('signal schema rejects invalid enums', () => {
  assert.throws(() => validateSignal({ ...validSignal, scope: 'daily' }), /Signal has invalid scope/);
  assert.throws(() => validateSignal({ ...validSignal, direction: 'maybe' }), /Signal has invalid direction/);
  assert.throws(() => validateSignal({ ...validSignal, data_quality: 'excellent' }), /Signal has invalid data_quality/);
});

test('signal schema rejects invalid confidence', () => {
  for (const confidence of ['0.5', -0.01, 1.01, Number.NaN]) {
    assert.throws(() => validateSignal({ ...validSignal, confidence }), /Signal has invalid confidence/);
  }
});

test('signal schema rejects blank module and rationale strings', () => {
  assert.throws(() => validateSignal({ ...validSignal, module: ' ' }), /Signal has invalid module/);
  assert.throws(() => validateSignal({ ...validSignal, rationale: '' }), /Signal has invalid rationale/);
});

test('numerology signal wraps the existing personal-year calculation at macro scope', () => {
  const signal = createNumerologySignal({ date_of_birth: '1990-05-15' }, 'Should I expand my business?');

  assert.equal(signal.module, 'numerology');
  assert.equal(signal.scope, 'macro');
  assert.equal(signal.data_quality, 'medium');
  assert.match(signal.rationale, /Personal year \d+/);
  assert.deepEqual(validateSignal(signal), signal);
});

test('numerology signal rejects missing birth date or question', () => {
  assert.throws(() => createNumerologySignal({}, 'Will this work?'), /date_of_birth/);
  assert.throws(() => createNumerologySignal({ date_of_birth: '1990-05-15' }, ' '), /question/);
});

test('Western signal prompt contains only computed tropical positions and bounded instructions', () => {
  const messages = buildWesternSignalMessages({
    ascendant: 'Libra',
    planets: {
      sun: { sign: 'Aries', degree: 12.5 },
      moon: { sign: 'Cancer', degree: 4.2 }
    }
  }, 'Will this partnership progress?');
  const prompt = messages.map(message => message.content).join('\n');

  assert.match(prompt, /tropical Western astrology/i);
  assert.match(prompt, /Aries/);
  assert.match(prompt, /Will this partnership progress\?/);
  assert.match(prompt, /Do not calculate or invent planetary positions/i);
  assert.match(prompt, /Do not use sidereal, Vedic, dasha, nakshatra/i);
});

test('Western signal translates computed positions without letting the model invent them', async () => {
  const chart = {
    ascendant: 'Libra',
    planets: {
      sun: { sign: 'Aries', degree: 12.5 },
      moon: { sign: 'Cancer', degree: 4.2 },
      rahu: { sign: 'Pisces', degree: 8.1 }
    },
    nakshatra: 'Pushya',
    houses: { 1: 'Libra' }
  };
  let messages;
  const provider = {
    async generateCompletion(received, options) {
      messages = received;
      assert.deepEqual(options, { temperature: 0, localOnly: true });
      return '{"direction":"leaning_yes","rationale":"The supplied Sun and Moon positions offer qualified support."}';
    }
  };
  const calculateChart = async () => chart;

  const signal = await createWesternSignal(
    { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 },
    'Will this partnership progress?',
    provider,
    calculateChart
  );
  const userPayload = messages.find(message => message.role === 'user').content;

  assert.deepEqual(signal, {
    module: 'western_astrology',
    scope: 'macro',
    direction: 'leaning_yes',
    confidence: 0.65,
    data_quality: 'high',
    rationale: 'The supplied Sun and Moon positions offer qualified support.'
  });
  assert.doesNotMatch(userPayload, /Pushya|rahu|houses/i);
});

test('Western signal rejects an invalid model direction', async () => {
  const provider = {
    async generateCompletion() {
      return '{"direction":"maybe","rationale":"Ambiguous."}';
    }
  };
  const calculateChart = async () => ({ ascendant: 'Libra', planets: { sun: { sign: 'Aries', degree: 12.5 } } });

  await assert.rejects(
    createWesternSignal(
      { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 },
      'Will this progress?',
      provider,
      calculateChart
    ),
    /Signal has invalid direction/
  );
});

test('reconcile returns full agreement for the two real signal wrappers', async () => {
  const numerology = createNumerologySignal({ date_of_birth: '1990-05-15' }, 'Will this partnership progress?');
  const western = await createWesternSignal(
    { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 },
    'Will this partnership progress?',
    { async generateCompletion() { return '{"direction":"yes","rationale":"The supplied Sun position supports progress."}'; } },
    async () => ({ ascendant: 'Libra', planets: { sun: { sign: 'Aries', degree: 12.5 } } })
  );

  const result = reconcile([numerology, western]);

  assert.equal(result.overall_direction, 'yes');
  assert.equal(result.agreement, 'full');
  assert.equal(result.hedge_note, '');
  assert.deepEqual(result.contributing_signals, [numerology, western]);
});

test('reconcile exposes high-confidence opposing real signals as no agreement', async () => {
  const numerology = createNumerologySignal({ date_of_birth: '1990-05-15' }, 'Will this partnership progress?');
  const western = await createWesternSignal(
    { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 },
    'Will this partnership progress?',
    { async generateCompletion() { return '{"direction":"leaning_no","rationale":"The supplied Sun position suggests caution."}'; } },
    async () => ({ ascendant: 'Libra', planets: { sun: { sign: 'Aries', degree: 12.5 } } })
  );

  const result = reconcile([numerology, western]);

  assert.equal(result.agreement, 'none');
  assert.match(result.hedge_note, /numerology.*western_astrology|western_astrology.*numerology/i);
  assert.match(result.hedge_note, /disagree/i);
});

test('reconcile keeps a strong real signal directional against a low-confidence disagreement', async () => {
  const western = await createWesternSignal(
    { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 },
    'Will this partnership progress?',
    { async generateCompletion() { return '{"direction":"leaning_yes","rationale":"The supplied Sun position supports progress."}'; } },
    async () => ({ ascendant: 'Libra', planets: { sun: { sign: 'Aries', degree: 12.5 } } })
  );
  const weakNumerology = {
    ...createNumerologySignal({ date_of_birth: '1990-05-15' }, 'Will this partnership progress?'),
    direction: 'leaning_no',
    confidence: 0.2,
    data_quality: 'low',
    rationale: 'Low-quality numerology context disagrees.'
  };

  const result = reconcile([western, weakNumerology]);

  assert.equal(result.overall_direction, 'leaning_yes');
  assert.equal(result.agreement, 'partial');
  assert.match(result.hedge_note, /disagree/i);
  assert.match(result.hedge_note, /western_astrology.*numerology|numerology.*western_astrology/i);
});
