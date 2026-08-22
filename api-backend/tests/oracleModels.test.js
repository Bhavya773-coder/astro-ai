const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const OraclePrediction = require('../models/OraclePrediction');
const OracleInputSnapshot = require('../models/OracleInputSnapshot');
const OracleMemory = require('../models/OracleMemory');
const OracleAnalyticsEvent = require('../models/OracleAnalyticsEvent');
const Message = require('../models/Message');
const User = require('../models/User');

const objectId = () => new mongoose.Types.ObjectId();
const original = () => ({
  text: 'A call is likely.',
  direction: 'yes',
  strength: 'moderate',
  time_window: { label: 'within two weeks' },
  manifestations: ['A direct message'],
  signals: ['Renewed contact'],
  recommended_action: 'Wait for a clear invitation.',
  valid_until: new Date('2026-09-01T00:00:00.000Z'),
  reassessment_at: new Date('2026-08-25T00:00:00.000Z'),
  model_version: 'hope-v2',
  statement_tags: [{ text: 'A call is likely.', tag: 'prediction' }]
});

function prediction(overrides = {}) {
  return new OraclePrediction({
    user_id: objectId(),
    canonical_question: 'Will they call me?',
    canonical_question_key: 'will-they-call',
    question_cluster: 'contact',
    category: 'relationship',
    horizon: 'near_term',
    methods: ['astrology'],
    input_snapshot_id: 'snapshot-1',
    material_snapshot_hash: 'snapshot-hash-1',
    prediction_original: original(),
    ...overrides
  });
}

test('OraclePrediction has UUID identity, lifecycle statuses, links, flags, and indexes', () => {
  const doc = prediction();
  assert.match(doc.prediction_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

  assert.deepEqual(OraclePrediction.schema.path('status').enumValues, [
    'open',
    'awaiting_outcome',
    'confirmed_strong',
    'confirmed_partial',
    'missed',
    'expired_unrated',
    'cancelled_due_to_changed_context'
  ]);
  for (const path of [
    'user_id', 'chat_id', 'message_id', 'canonical_question',
    'canonical_question_key', 'question_cluster', 'category', 'horizon',
    'methods', 'input_snapshot_id', 'material_snapshot_hash', 'prediction_original',
    'prediction_post_analysis', 'outcome', 'user_feedback', 'analytics_flags'
  ]) assert.ok(OraclePrediction.schema.path(path), path);

  const indexes = OraclePrediction.schema.indexes().map(([fields]) => fields);
  assert.ok(indexes.some(fields => fields.prediction_id === 1));
  assert.ok(indexes.some(fields => fields.user_id === 1 && fields.created_at === -1));
  assert.ok(indexes.some(fields => fields.user_id === 1 && fields.canonical_question_key === 1));
});

test('OraclePrediction original is immutable after creation', async () => {
  const persisted = OraclePrediction.hydrate(prediction().toObject());
  persisted.prediction_original.text = 'Rewritten after the outcome.';

  await assert.rejects(persisted.validate(), /prediction_original is immutable/);
});

test('OraclePrediction post-analysis remains appendable', async () => {
  const persisted = OraclePrediction.hydrate(prediction().toObject());
  persisted.prediction_post_analysis.push({
    kind: 'outcome_review',
    text: 'User reported a partial match.'
  });

  await persisted.validate();
  assert.equal(persisted.prediction_post_analysis.length, 1);
});

test('OraclePrediction post-analysis rejects destructive updates', async () => {
  mongoose.set('bufferCommands', false);
  await assert.rejects(
    OraclePrediction.updateOne({}, { $pull: { prediction_post_analysis: { kind: 'outcome_review' } } }),
    /prediction_post_analysis is append-only/
  );
});

test('Oracle supporting models expose UUID ownership and required audit fields', () => {
  const snapshot = new OracleInputSnapshot({
    user_id: objectId(),
    authorized_inputs: { birth_profile: { timezone: 'UTC' } },
    deterministic_sources: ['swiss_ephemeris'],
    snapshot_hash: 'abc123'
  });
  const memory = new OracleMemory({
    user_id: objectId(),
    kind: 'correction',
    text: 'The event happened on Tuesday.'
  });
  const event = new OracleAnalyticsEvent({
    user_id: objectId(),
    event: 'prediction_created'
  });

  assert.match(snapshot.snapshot_id, /^[0-9a-f-]{36}$/i);
  assert.match(memory.memory_id, /^[0-9a-f-]{36}$/i);
  assert.ok(OracleInputSnapshot.schema.path('question_context'));
  assert.ok(OracleMemory.schema.path('source_metadata'));
  assert.ok(OracleAnalyticsEvent.schema.path('metadata'));
  assert.equal(memory.kind, 'correction');
  assert.equal(event.event, 'prediction_created');
});

test('legacy Message documents remain valid and Oracle metadata is optional', async () => {
  const legacy = new Message({ chat_id: objectId(), role: 'assistant', content: 'Hello' });
  await legacy.validate();
  assert.equal(legacy.oracle_prediction_id, undefined);
  assert.equal(legacy.oracle_metadata, undefined);

  const linked = new Message({
    chat_id: objectId(),
    role: 'assistant',
    content: 'A prediction',
    oracle_prediction_id: 'prediction-1',
    oracle_metadata: { reused: false }
  });
  await linked.validate();
  assert.equal(linked.oracle_metadata.reused, false);
});

test('User Oracle disclosure and preferences have additive defaults', async () => {
  const user = new User({ email: 'hope@example.com', password_hash: 'hash' });
  await user.validate();

  assert.equal(user.oracle_disclosure.version, null);
  assert.equal(user.oracle_disclosure.accepted_at, null);
  assert.equal(user.oracle_preferences.personalized_learning, true);
  assert.equal(user.oracle_preferences.contextual_signals, true);
});
