const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DISCLOSURE_VERSION,
  DISCLOSURE_TEXT,
  validatePredictBody,
  validateFeedPeriod,
  validateOutcomeBody,
  parsePagination,
  sanitizeSettings
} = require('../controllers/oracle.controller');

test('disclosure is versioned and explains predictive entertainment once', () => {
  assert.match(DISCLOSURE_VERSION, /^hope-v2-/);
  assert.match(DISCLOSURE_TEXT, /predictive entertainment/i);
  assert.match(DISCLOSURE_TEXT, /Hope predicts\. Reality happens\. You validate\. Hope learns\./);
});

test('prediction input validates method and bounded text at the trust boundary', () => {
  assert.deepEqual(validatePredictBody({ message: 'Will he call?', method: 'tarot' }), {
    message: 'Will he call?', method: 'tarot', category: undefined, horizon: undefined, methodInputs: undefined, chatId: undefined
  });
  assert.throws(() => validatePredictBody({ message: '', method: 'tarot' }), /message/i);
  assert.throws(() => validatePredictBody({ message: 'x'.repeat(5001), method: 'tarot' }), /message/i);
  assert.throws(() => validatePredictBody({ message: 'Will he call?', method: 'crystal_ball' }), /method/i);
});

test('pagination and settings accept only bounded known values', () => {
  assert.deepEqual(parsePagination({ page: '-2', limit: '500' }), { page: 1, limit: 50, skip: 0 });
  assert.deepEqual(sanitizeSettings({ personalized_learning: false, contextual_signals: true, admin: true }), {
    personalized_learning: false,
    contextual_signals: true
  });
  assert.throws(() => sanitizeSettings({ personalized_learning: 'no' }), /boolean/i);
});

test('automated Hope feed allows only morning and evening periods', () => {
  assert.equal(validateFeedPeriod('morning'), 'morning');
  assert.equal(validateFeedPeriod('evening'), 'evening');
  assert.throws(() => validateFeedPeriod('night'), /period/i);
});

test('outcome input validates optional text and event date', () => {
  assert.equal(validateOutcomeBody({ choice: 'partly', text: 'Some details', event_at: '2026-08-18' }).choice, 'partly');
  assert.throws(() => validateOutcomeBody({ choice: 'wrong' }), /outcome/i);
  assert.throws(() => validateOutcomeBody({ choice: 'no', text: 'x'.repeat(2001) }), /text/i);
  assert.throws(() => validateOutcomeBody({ choice: 'no', event_at: 'not-a-date' }), /date/i);
});
