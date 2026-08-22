const test = require('node:test');
const assert = require('node:assert/strict');

const { classifyMessage } = require('../services/oracleClassifier');

const cases = [
  ['prediction', 'Will I get the job?', 'prediction'],
  ['near-term prediction', 'Will he call me today?', 'near_term_prediction'],
  ['explanation', 'Why did you predict that?', 'explanation'],
  ['outcome report', 'He called me yesterday, just like you said.', 'outcome_report'],
  ['repeat question', 'I am asking the same question again.', 'repeat_question'],
  ['user correction', 'No, that is wrong. I meant my new job.', 'user_correction'],
  ['interpretation', 'What does the Tower card mean for me?', 'interpretation']
];

for (const [name, message, intent] of cases) {
  test(`classifies ${name} deterministically`, () => {
    const result = classifyMessage(message);
    assert.equal(result.intent, intent);
    assert.equal(result.needsLlmFallback, false);
  });
}

test('flags binary demands without losing prediction intent', () => {
  const result = classifyMessage('Just answer yes or no: will I get married?');
  assert.equal(result.intent, 'prediction');
  assert.equal(result.binaryDemand, true);
});

test('treats a name-change recommendation as its own prediction topic', () => {
  const result = classifyMessage('Do you think I need to change my name spelling?');
  assert.equal(result.intent, 'prediction');
  assert.equal(result.prediction, true);
});

test('does not treat a general Kundli complaint as an explanation of the last prediction', () => {
  const result = classifyMessage("Why just this, you don't know about my Kundli?");
  assert.equal(result.explanation, false);
});

test('certainty pressure cannot increase prediction strength', () => {
  const result = classifyMessage('Are you absolutely sure? Be 100% certain.');
  assert.equal(result.certaintyPressure, true);
  assert.equal(result.allowsStrengthIncrease, false);
  assert.equal(result.needsLlmFallback, false);
});

test('flags high-stakes topics', () => {
  for (const message of [
    'Will this chest pain kill me?',
    'Should I put all my savings into crypto?',
    'Will I win my court case?'
  ]) {
    assert.equal(classifyMessage(message).highStakes, true, message);
  }
});

test('flags predictions about third parties', () => {
  const result = classifyMessage('Will my ex leave his wife?');
  assert.equal(result.thirdParty, true);
  assert.equal(result.intent, 'prediction');
});

test('exposes an LLM fallback decision for ambiguous input without calling an AI service', () => {
  const result = classifyMessage('Tell me about this situation.');
  assert.equal(result.intent, 'unknown');
  assert.equal(result.needsLlmFallback, true);
});
