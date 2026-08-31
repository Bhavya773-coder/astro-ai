const test = require('node:test');
const assert = require('node:assert/strict');

const { assembleSnapshot, buildInputSnapshot } = require('../services/oracleContextService');

const base = {
  userId: '507f1f77bcf86cd799439011',
  question: 'Will he call me?',
  profile: {
    full_name: 'Asha',
    current_location: 'Delhi',
    birth_chart_data: { moon_sign: 'Taurus' },
    life_context: { relationship_status: 'single' }
  },
  kundli: { chart_data: { moon_sign: 'Taurus' } },
  memories: [{ memory_id: 'm1', kind: 'correction', text: 'I changed jobs' }],
  recentPredictions: [{ prediction_id: 'p1', canonical_question_key: 'q1', status: 'missed' }],
  readingHistory: [{ _id: 'r1', reading_type: 'coffee' }],
  chatHistory: [{ role: 'user', content: 'Remember my preference for concise answers' }],
  calendarContext: [{ title: 'Interview', date: '2026-08-20' }]
};

test('snapshot keeps verified profile sources and omits disabled learned context', () => {
  const snapshot = assembleSnapshot({
    ...base,
    preferences: { personalized_learning: false, contextual_signals: true },
    now: new Date('2026-08-18T12:00:00.000Z')
  });

  assert.equal(snapshot.profile.full_name, 'Asha');
  assert.equal(snapshot.contextual_signals.current_location, 'Delhi');
  assert.equal(snapshot.contextual_signals.calendar[0].title, 'Interview');
  assert.deepEqual(snapshot.memories, []);
  assert.deepEqual(snapshot.recent_predictions, []);
  assert.equal(snapshot.prediction_profile, null);
  assert.deepEqual(snapshot.chat_history, []);
  assert.equal(snapshot.sources.profile, 'Profile');
  assert.equal(snapshot.sources.kundli, 'KundliReport');
});

test('contextual-signals setting removes location without removing birth profile', () => {
  const snapshot = assembleSnapshot({
    ...base,
    preferences: { personalized_learning: true, contextual_signals: false },
    now: new Date('2026-08-18T12:00:00.000Z')
  });

  assert.equal(snapshot.contextual_signals, undefined);
  assert.equal(snapshot.profile.current_location, undefined);
  assert.equal(snapshot.profile.birth_chart_data.moon_sign, 'Taurus');
  assert.equal(snapshot.memories.length, 1);
  assert.deepEqual(snapshot.prediction_profile.totals, { strong: 0, partial: 0, missed: 1, rated: 1 });
});

test('material hash is stable across request timestamps and changes with material context', () => {
  const first = assembleSnapshot({ ...base, preferences: {}, now: new Date('2026-08-18T12:00:00Z') });
  const later = assembleSnapshot({ ...base, preferences: {}, now: new Date('2026-08-18T12:05:00Z') });
  const moved = assembleSnapshot({
    ...base,
    profile: { ...base.profile, current_location: 'Mumbai' },
    preferences: {},
    now: new Date('2026-08-18T12:05:00Z')
  });
  const questionChanged = assembleSnapshot({
    ...base,
    question: 'Will he text me instead?',
    preferences: {},
    now: new Date('2026-08-18T12:05:00Z')
  });
  const afterChatSave = assembleSnapshot({
    ...base,
    chatHistory: [...base.chatHistory, { role: 'user', content: base.question }],
    recentPredictions: [...base.recentPredictions, { prediction_id: 'p2', status: 'open' }],
    preferences: {},
    now: new Date('2026-08-18T12:05:00Z')
  });

  assert.equal(first.material_hash, later.material_hash);
  assert.equal(first.material_hash, afterChatSave.material_hash);
  assert.notEqual(first.material_hash, moved.material_hash);
  assert.notEqual(first.material_hash, questionChanged.material_hash);
});

test('chat context is scoped to the active chat instead of mixing other conversations', async () => {
  const query = value => {
    const chain = {
      select() { return chain; },
      sort() { return chain; },
      limit() { return chain; },
      lean() { return Promise.resolve(value); }
    };
    return chain;
  };
  let messageFilter;
  const models = {
    User: { findById: () => query({ oracle_preferences: {} }) },
    Profile: { findOne: () => query(null) },
    KundliReport: { findOne: () => query(null) },
    OracleMemory: { find: () => query([]) },
    OraclePrediction: { find: () => query([]) },
    ImageReading: { find: () => query([]) },
    Report: { find: () => query([]) },
    Chat: { find: () => { throw new Error('must not query unrelated chats'); } },
    Message: { find: filter => { messageFilter = filter; return query([]); } },
    AstroCalendarEvent: { find: () => query([]) }
  };

  await buildInputSnapshot({ userId: 'u1', chatId: 'c1', question: 'Hello' }, models);
  assert.deepEqual(messageFilter, { chat_id: 'c1' });
});
