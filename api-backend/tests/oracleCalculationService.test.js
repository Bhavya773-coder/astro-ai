const test = require('node:test');
const assert = require('node:assert/strict');

const { parseStructuredPrediction } = require('../services/oracleCalculationService');

function basePayload() {
  return {
    text: 'I am leaning yes.',
    direction: 'leaning_yes',
    strength: 0.6,
    time_window: { start: '2026-08-28', end: '2026-09-01' },
    manifestations: ['message'],
    signals: ['signal'],
    recommended_action: 'Wait.',
    valid_until: '2026-09-01T00:00:00.000Z',
    next_reassessment_at: '2026-08-30T00:00:00.000Z',
    statement_tags: { prediction: ['x'], interpretation: ['y'], advice: ['z'] }
  };
}

function assertThrows(raw, expected) {
  assert.throws(() => parseStructuredPrediction(raw), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

test('parseStructuredPrediction rejects malformed oracle output and accepts a valid payload', () => {
  const now = new Date('2026-08-18T12:00:00.000Z');
  const originalNow = Date.now;
  Date.now = () => now.getTime();

  try {
    assertThrows('not json', 'Oracle calculation returned invalid JSON');
    assertThrows(JSON.stringify({ ...basePayload(), text: undefined }), 'Oracle calculation missing fields: text');
    assertThrows(JSON.stringify({ ...basePayload(), direction: 'sideways' }), 'Oracle calculation has invalid direction');
    assertThrows(JSON.stringify({ ...basePayload(), strength: 1.25 }), 'Oracle calculation has invalid strength');
    assertThrows(JSON.stringify({ ...basePayload(), valid_until: '2026-08-18T11:59:59.000Z' }), 'Oracle calculation valid_until is in the past');

    const parsed = parseStructuredPrediction(JSON.stringify(basePayload()));
    assert.equal(parsed.direction, 'leaning_yes');
    assert.equal(parsed.strength, 0.6);
  } finally {
    Date.now = originalNow;
  }
});
