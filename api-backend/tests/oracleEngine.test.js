const test = require('node:test');
const assert = require('node:assert/strict');

const { createOracleEngine, strengthLabel } = require('../services/oracleEngine');

test('numeric model confidence is stored in the prediction schema vocabulary', () => {
  assert.equal(strengthLabel(0.2), 'weak');
  assert.equal(strengthLabel(0.62), 'moderate');
  assert.equal(strengthLabel(0.9), 'strong');
});

function harness(overrides = {}) {
  const predictions = [];
  let calculations = 0;
  const store = {
    async findByQuestion({ userId, canonicalQuestionKey }) {
      return predictions.find(item => item.user_id === userId && item.canonical_question_key === canonicalQuestionKey && !item.status.startsWith('cancelled')) || null;
    },
    async findRecent({ userId, chatId }) {
      return [...predictions].reverse().find(item => item.user_id === userId && item.chat_id === chatId) || null;
    },
    async createSnapshot(snapshot) {
      return { snapshot_id: `s${predictions.length + 1}`, ...snapshot };
    },
    async createPrediction(data) {
      const created = { prediction_id: `p${predictions.length + 1}`, status: 'open', ...data };
      predictions.push(created);
      return created;
    },
    async markReused(prediction, method) {
      if (!prediction.methods.includes(method)) prediction.methods.push(method);
      prediction.analytics_flags = { ...prediction.analytics_flags, reused: true };
      return prediction;
    },
    async cancel(prediction) {
      prediction.status = 'cancelled_due_to_changed_context';
    },
    async awaitOutcome(prediction) {
      prediction.status = 'awaiting_outcome';
    }
  };
  const engine = createOracleEngine({
    store,
    async buildContext({ materialHash = 'h1' } = {}) {
      return { material_hash: materialHash, sources: { kundli: 'KundliReport' } };
    },
    async calculate() {
      calculations += 1;
      return {
        text: 'I am leaning yes.', direction: 'leaning_yes', strength: 0.62,
        time_window: { start: '2026-08-18', end: '2026-09-01' },
        manifestations: ['a direct message'], signals: ['renewed contact'],
        recommended_action: 'Wait without chasing.', valid_until: '2026-12-01T00:00:00.000Z',
        next_reassessment_at: '2026-11-01T00:00:00.000Z',
        statement_tags: { prediction: ['I am leaning yes.'], interpretation: [], advice: ['Wait without chasing.'] }
      };
    },
    async generateHope({ prediction, reused }) {
      return reused ? `My answer is still ${prediction.direction}.` : prediction.text;
    },
    validate() { return { valid: true, violations: [] }; },
    async track() {},
    ...overrides
  });
  return { engine, predictions, get calculations() { return calculations; } };
}

test('same real-world question is calculated once and then reused', async () => {
  const h = harness();
  const first = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
  const repeat = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Ask tarot whether he will call', method: 'tarot' });

  assert.equal(h.calculations, 1);
  assert.equal(h.predictions.length, 1);
  assert.equal(first.reused, false);
  assert.equal(repeat.reused, true);
  assert.deepEqual(repeat.prediction.methods, ['astrology', 'tarot']);
  assert.equal(repeat.prediction.prediction_original.strength, 0.62);
});

test('certainty pressure reuses the recent call without increasing strength', async () => {
  const h = harness();
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
  const pressured = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Are you 100% sure? Be certain.', method: 'astrology' });

  assert.equal(h.calculations, 1);
  assert.equal(pressured.reused, true);
  assert.equal(pressured.prediction.prediction_original.strength, 0.62);
});

test('a name-spelling question replaces an unrelated daily call before a yes-no follow-up', async () => {
  const h = harness();
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'What will happen today?', method: 'astrology' });
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Do you think I need to change my name spelling?', method: 'numerology' });
  const followUp = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Just answer yes or no.', method: 'numerology' });

  assert.equal(h.predictions.length, 2);
  assert.equal(followUp.prediction.category, 'numerology');
  assert.match(followUp.prediction.canonical_question, /name spelling/i);
});

test('materially changed inputs cancel the old call and create a recalculation', async () => {
  const h = harness();
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
  const changed = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology', materialHash: 'h2' });

  assert.equal(h.calculations, 2);
  assert.equal(h.predictions.length, 2);
  assert.equal(h.predictions[0].status, 'cancelled_due_to_changed_context');
  assert.equal(changed.recalculated, true);
});

test('recalculation never overwrites a rated outcome', async () => {
  const h = harness();
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
  h.predictions[0].status = 'confirmed_strong';
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology', materialHash: 'h2' });
  assert.equal(h.predictions[0].status, 'confirmed_strong');
});

test('expired predictions are recalculated even when material inputs are unchanged', async () => {
  const h = harness();
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
  h.predictions[0].prediction_original.valid_until = '2000-01-01T00:00:00.000Z';
  await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
  assert.equal(h.calculations, 2);
  assert.equal(h.predictions[0].status, 'awaiting_outcome');
});

test('high-stakes questions bypass divination and lead with real-world help', async () => {
  const h = harness();
  const response = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will this chest pain kill me?', method: 'astrology' });
  assert.match(response.message_text, /emergency services|medical help/i);
  assert.equal(h.calculations, 0);
  assert.equal(h.predictions.length, 0);
});

test('an invalid generated response is not persisted as a new prediction', async () => {
  const h = harness();
  h.engine.setValidator(() => ({ valid: false, violations: ['certainty_guarantee'] }));
  await assert.rejects(
    h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' }),
    /validation/i
  );
  assert.equal(h.predictions.length, 0);
});

test('reconciliation flag gates the new delivery path while retaining output validation', async () => {
  const originalFlag = process.env.ORACLE_USE_RECONCILIATION;
  let signalCalls = 0;
  let reconciliationCalls = 0;
  let deliveryCalls = 0;
  let validations = 0;
  const birthDetails = { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 };
  const signal = (module, direction, data_quality) => ({ module, scope: 'macro', direction, confidence: 0.65, data_quality, rationale: `${module} rationale.` });
  const reconciliation = {
    overall_direction: 'leaning_yes', overall_confidence: 0.65, agreement: 'full',
    contributing_signals: [signal('numerology', 'yes', 'medium'), signal('western_astrology', 'leaning_yes', 'high')], hedge_note: ''
  };
  const reconciledPrediction = {
    text: 'I lean yes based on the reconciled signals.', direction: 'leaning_yes', strength: 0.65,
    time_window: { start: '2026-08-18', end: '2026-09-01' }, manifestations: ['a direct message'], signals: ['renewed contact'],
    recommended_action: 'Wait without chasing.', valid_until: '2026-12-01T00:00:00.000Z', next_reassessment_at: '2026-11-01T00:00:00.000Z',
    statement_tags: { prediction: ['I lean yes based on the reconciled signals.'], interpretation: [], advice: ['Wait without chasing.'] }
  };

  try {
    delete process.env.ORACLE_USE_RECONCILIATION;
    const off = harness({
      createNumerologySignal: () => { signalCalls += 1; return signal('numerology', 'yes', 'medium'); },
      createWesternSignal: async () => { signalCalls += 1; return signal('western_astrology', 'leaning_yes', 'high'); },
      reconcile: () => { reconciliationCalls += 1; return reconciliation; },
      calculateReconciled: async () => { deliveryCalls += 1; return reconciledPrediction; }
    });
    await off.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
    assert.equal(signalCalls, 0);
    assert.equal(reconciliationCalls, 0);
    assert.equal(deliveryCalls, 0);
    assert.equal(off.calculations, 1);

    process.env.ORACLE_USE_RECONCILIATION = 'true';
    const on = harness({
      async buildContext() { return { material_hash: 'h1', sources: { kundli: 'KundliReport' }, kundli: { birth_details: birthDetails } }; },
      createNumerologySignal: () => { signalCalls += 1; return signal('numerology', 'yes', 'medium'); },
      createWesternSignal: async () => { signalCalls += 1; return signal('western_astrology', 'leaning_yes', 'high'); },
      reconcile: inputs => { reconciliationCalls += 1; assert.equal(inputs.length, 2); return reconciliation; },
      calculateReconciled: async input => { deliveryCalls += 1; assert.deepEqual(input.reconciliation, reconciliation); return reconciledPrediction; },
      validate() { validations += 1; return { valid: true, violations: [] }; }
    });
    const response = await on.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
    assert.equal(signalCalls, 2);
    assert.equal(reconciliationCalls, 1);
    assert.equal(deliveryCalls, 1);
    assert.equal(on.calculations, 0);
    assert.equal(validations, 1);
    assert.equal(response.message_text, reconciledPrediction.text);
  } finally {
    if (originalFlag === undefined) delete process.env.ORACLE_USE_RECONCILIATION;
    else process.env.ORACLE_USE_RECONCILIATION = originalFlag;
  }
});

test('reconciliation falls back to legacy calculation when verified birth details are unavailable', async () => {
  const originalFlag = process.env.ORACLE_USE_RECONCILIATION;
  let signalCalls = 0;
  const originalError = console.error;
  try {
    process.env.ORACLE_USE_RECONCILIATION = 'true';
    console.error = () => {};
    const h = harness({
      async buildContext() { return { material_hash: 'h1', sources: { kundli: 'unavailable' } }; },
      createNumerologySignal: () => { signalCalls += 1; },
      createWesternSignal: async () => { signalCalls += 1; }
    });
    const response = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
    assert.equal(signalCalls, 0);
    assert.equal(h.calculations, 1);
    assert.equal(response.reconciliation, undefined);
  } finally {
    console.error = originalError;
    if (originalFlag === undefined) delete process.env.ORACLE_USE_RECONCILIATION;
    else process.env.ORACLE_USE_RECONCILIATION = originalFlag;
  }
});

test('reconciliation falls back when delivery contradicts the reconciled direction', async () => {
  const originalFlag = process.env.ORACLE_USE_RECONCILIATION;
  const originalError = console.error;
  try {
    process.env.ORACLE_USE_RECONCILIATION = 'true';
    console.error = () => {};
    const h = harness({
      async buildContext() { return { material_hash: 'h1', sources: { kundli: 'KundliReport' }, kundli: { birth_details: { date_of_birth: '1990-05-15', time_of_birth: '10:30', latitude: 28.61, longitude: 77.21 } } }; },
      createNumerologySignal: () => ({ module: 'numerology', scope: 'macro', direction: 'yes', confidence: 0.65, data_quality: 'medium', rationale: 'Numerology.' }),
      createWesternSignal: async () => ({ module: 'western_astrology', scope: 'macro', direction: 'yes', confidence: 0.65, data_quality: 'high', rationale: 'Western.' }),
      reconcile: () => ({ overall_direction: 'yes', overall_confidence: 0.65, agreement: 'full', contributing_signals: [], hedge_note: '' }),
      calculateReconciled: async () => ({
        text: 'I lean no.', direction: 'leaning_no', strength: 0.65,
        time_window: { start: '2026-08-18', end: '2026-09-01' }, manifestations: ['silence'], signals: ['no contact'],
        recommended_action: 'Wait.', valid_until: '2026-12-01T00:00:00.000Z', next_reassessment_at: '2026-11-01T00:00:00.000Z',
        statement_tags: { prediction: ['I lean no.'], interpretation: [], advice: ['Wait.'] }
      })
    });
    const response = await h.engine.respond({ userId: 'u1', chatId: 'c1', message: 'Will he call me?', method: 'astrology' });
    assert.equal(h.calculations, 1);
    assert.equal(response.reconciliation, undefined);
  } finally {
    console.error = originalError;
    if (originalFlag === undefined) delete process.env.ORACLE_USE_RECONCILIATION;
    else process.env.ORACLE_USE_RECONCILIATION = originalFlag;
  }
});

test('Hope uses the configured AI provider instead of forcing local Ollama', async () => {
  const aiService = require('../services/aiService');
  const originalGenerateCompletion = aiService.generateCompletion;
  let completionOptions;
  aiService.generateCompletion = async (_messages, options) => {
    completionOptions = options;
    return 'Here is your guidance.';
  };

  try {
    const engine = createOracleEngine({
      store: {
        async findRecent() { return null; },
        async findByQuestion() { return null; }
      },
      classify: () => ({ intent: 'conversation' }),
      canonicalize: () => ({ canonicalQuestion: '', canonicalQuestionKey: '' }),
      buildContext: async () => ({ material_hash: 'h1', sources: {} }),
      validate: () => ({ valid: true, violations: [] }),
      track: async () => {}
    });

    await engine.respond({ userId: 'u1', chatId: 'c1', message: 'Tell me something helpful.' });
    assert.notEqual(completionOptions?.localOnly, true);
  } finally {
    aiService.generateCompletion = originalGenerateCompletion;
  }
});
