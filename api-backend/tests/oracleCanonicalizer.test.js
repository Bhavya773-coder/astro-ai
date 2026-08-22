const test = require('node:test');
const assert = require('node:assert/strict');

const { canonicalizeQuestion } = require('../services/oracleCanonicalizer');

const examples = [
  'Will he call?',
  'When will he call me?',
  'Is he going to call me?',
  'Check if he will call me',
  'Ask tarot whether he will call'
];

test('clusters paraphrases and method switches into one reality', () => {
  const results = examples.map(canonicalizeQuestion);
  assert.equal(new Set(results.map(result => result.canonicalQuestionKey)).size, 1);
  assert.equal(new Set(results.map(result => result.canonicalQuestion)).size, 1);
});

test('method words do not create a new question cluster', () => {
  const plain = canonicalizeQuestion('Will she return?');
  for (const method of ['Use astrology: will she return?', 'Ask tarot if she will return', 'Check numerology whether she will return', 'Ask palm whether she will return', 'Ask face whether she will return', 'Ask coffee whether she will return']) {
    assert.equal(canonicalizeQuestion(method).canonicalQuestionKey, plain.canonicalQuestionKey);
  }
});

test('certainty pressure and punctuation do not create a new reality', () => {
  const plain = canonicalizeQuestion('Will he call?');
  const pressured = canonicalizeQuestion('Are you absolutely sure??? Tell me honestly: will he call!!!');
  assert.equal(pressured.canonicalQuestionKey, plain.canonicalQuestionKey);
});

test('normalization preserves material pronouns', () => {
  assert.notEqual(
    canonicalizeQuestion('Will he call?').canonicalQuestionKey,
    canonicalizeQuestion('Will she call?').canonicalQuestionKey
  );
});

test('method names used as ordinary words remain material', () => {
  assert.notEqual(
    canonicalizeQuestion('Will I face trouble?').canonicalQuestionKey,
    canonicalizeQuestion('Will I trouble?').canonicalQuestionKey
  );
});

test('changed time horizons create a new question cluster', () => {
  assert.notEqual(
    canonicalizeQuestion('Will he call today?').canonicalQuestionKey,
    canonicalizeQuestion('Will he call next week?').canonicalQuestionKey
  );
});

test('changed topics create a new question cluster', () => {
  assert.notEqual(
    canonicalizeQuestion('Will he call?').canonicalQuestionKey,
    canonicalizeQuestion('Will he visit?').canonicalQuestionKey
  );
});

test('keys are deterministic SHA-256 hex and ambiguous semantics expose fallback need', () => {
  const first = canonicalizeQuestion('Could this work?');
  const second = canonicalizeQuestion('Could this work?');
  assert.match(first.canonicalQuestionKey, /^[a-f0-9]{64}$/);
  assert.equal(first.canonicalQuestionKey, second.canonicalQuestionKey);
  assert.equal(first.needsLlmFallback, true);
});
