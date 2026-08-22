'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  decideReassessment,
  recordMethod,
  resolveConfidence,
} = require('../services/oracleReassessment');

const NOW = '2026-08-18T12:10:00.000Z';
const NEXT = '2026-08-18T13:00:00.000Z';

function request(overrides = {}) {
  return {
    now: NOW,
    previousPrediction: {
      id: 'prediction-1',
      canonical_question: 'Will I get the role?',
      material_snapshot_hash: 'snapshot-1',
      location: 'Delhi',
      calendar_context: 'interview on Friday',
      methods: ['vedic'],
      next_reassessment_at: NEXT,
    },
    canonicalQuestion: 'Will I get the role?',
    materialSnapshotHash: 'snapshot-1',
    location: 'Delhi',
    calendarContext: 'interview on Friday',
    method: 'vedic',
    ...overrides,
  };
}

function expected(recalculate, reason, nextReassessmentAt = NEXT) {
  return {
    recalculate,
    reason,
    previous_prediction_id: 'prediction-1',
    next_reassessment_at: nextReassessmentAt,
  };
}

test('reuses one prediction for ten repeats within ten minutes', () => {
  const repeatTimestamps = Array.from({ length: 10 }, (_, index) =>
    new Date(Date.parse(NOW) - index * 60_000).toISOString()
  );

  assert.deepEqual(
    decideReassessment(request({ repeatTimestamps })),
    expected(false, 'repetition_window')
  );
});

test('certainty pressure reuses the prediction and cannot raise confidence', () => {
  assert.deepEqual(
    decideReassessment(request({ certaintyPressure: true })),
    expected(false, 'certainty_pressure')
  );
  assert.equal(resolveConfidence(0.62, 0.91, true), 0.62);
  assert.equal(resolveConfidence(0.62, 0.48, true), 0.48);
});

test('significant time progression recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({ significantTimeProgression: true })),
    expected(true, 'significant_time_progression', null)
  );
});

test('an expired reassessment window recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({
      now: '2026-08-18T13:00:00.000Z',
      previousPrediction: {
        ...request().previousPrediction,
        next_reassessment_at: '2026-08-18T12:59:59.999Z',
      },
    })),
    expected(true, 'reassessment_window_expired', null)
  );
});

test('a user-reported new event recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({ userReportedNewEvent: true })),
    expected(true, 'new_event', null)
  );
});

test('changed location recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({ location: 'Mumbai' })),
    expected(true, 'location_changed', null)
  );
});

test('changed calendar context recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({ calendarContext: 'interview moved to Monday' })),
    expected(true, 'calendar_context_changed', null)
  );
});

test('changed canonical question recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({ canonicalQuestion: 'When will I get the role?' })),
    expected(true, 'canonical_question_changed', null)
  );
});

test('changed material snapshot hash recalculates', () => {
  assert.deepEqual(
    decideReassessment(request({ materialSnapshotHash: 'snapshot-2' })),
    expected(true, 'material_snapshot_changed', null)
  );
});

test('a method switch alone reuses the prediction and records the added method', () => {
  const input = request({ method: 'tarot' });

  assert.deepEqual(
    decideReassessment(input),
    expected(false, 'method_added')
  );
  assert.deepEqual(recordMethod(input.previousPrediction.methods, input.method), ['vedic', 'tarot']);
  assert.deepEqual(input.previousPrediction.methods, ['vedic']);
});
