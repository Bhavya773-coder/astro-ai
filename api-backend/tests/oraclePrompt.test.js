const test = require('node:test');
const assert = require('node:assert/strict');

const { HOPE_RUNTIME_PROMPT, buildCalculationMessages, buildHopeMessages } = require('../services/oraclePrompt');
const { parseStructuredPrediction, calculatePrediction } = require('../services/oracleCalculationService');

const request = {
  question: 'Will I hear from him?',
  category: 'love',
  horizon: 'near_term',
  methods: ['astrology'],
  snapshot: { sources: { kundli: 'KundliReport' }, kundli: { chart_data: { moon_sign: 'Taurus' } } }
};

test('calculation prompt requires the complete structured prediction contract', () => {
  const messages = buildCalculationMessages(request);
  const prompt = messages.map(message => message.content).join('\n');
  for (const field of ['direction', 'strength', 'time_window', 'manifestations', 'signals', 'recommended_action', 'statement_tags']) {
    assert.match(prompt, new RegExp(field));
  }
  assert.match(prompt, new RegExp(new Date().toISOString().slice(0, 10)));
  assert.match(prompt, /Never invent deterministic data/);
});

test('Hope prompt uses the fixed identity and preserves prior calls', () => {
  const messages = buildHopeMessages({
    ...request,
    snapshot: {
      ...request.snapshot,
      profile: { full_name: 'Asha' },
      memories: [{ text: 'Prefers concise answers' }],
      prediction_profile: { totals: { strong: 2, partial: 1, missed: 1, rated: 4 } },
      chat_history: [{ role: 'user', content: 'Do you know about my Kundli?' }]
    },
    prediction: { direction: 'leaning_yes', strength: 0.62 }
  });
  const prompt = messages.map(message => message.content).join('\n');
  assert.match(prompt, /Your name is Hope/);
  assert.match(prompt, /Hope predicts\. Reality happens\. The user validates\. The system learns\./);
  assert.match(prompt, /User pressure is not new predictive evidence/);
  assert.doesNotMatch(prompt, /Master Astrologer|true master astrologer/i);
  assert.match(prompt, /Do you know about my Kundli\?/);
  assert.match(prompt, /"moon_sign":"Taurus"/);
  assert.match(prompt, /Asha/);
  assert.match(prompt, /Prefers concise answers/);
  assert.match(prompt, /prediction_profile/);
});

test('runtime Hope prompt is sourced from prompt.md and requires source-grounded direct answers', () => {
  assert.match(HOPE_RUNTIME_PROMPT, /Use actual source data where available/);
  assert.match(HOPE_RUNTIME_PROMPT, /never invent deterministic data/i);
  assert.match(HOPE_RUNTIME_PROMPT, /prediction.*interpretation.*advice/is);
  assert.match(HOPE_RUNTIME_PROMPT, /answer the current question/i);
});

test('structured prediction parser accepts fenced JSON and validates required fields', () => {
  const parsed = parseStructuredPrediction('```json\n{"text":"I lean yes.","direction":"leaning_yes","strength":0.62,"time_window":{"start":"2026-08-18","end":"2026-09-01"},"manifestations":["a message"],"signals":["renewed contact"],"recommended_action":"Wait without chasing.","valid_until":"2026-09-01","next_reassessment_at":"2026-08-25","statement_tags":{"prediction":["I lean yes."],"interpretation":[],"advice":["Wait without chasing."]}}\n```');
  assert.equal(parsed.direction, 'leaning_yes');
  assert.throws(() => parseStructuredPrediction('{"direction":"yes"}'), /missing/i);
  const invalidDates = JSON.stringify({ ...parsed, valid_until: null });
  assert.throws(() => parseStructuredPrediction(invalidDates), /valid_until/i);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const expired = JSON.stringify({
    ...parsed,
    time_window: { start: yesterday, end: yesterday },
    valid_until: yesterday,
    next_reassessment_at: yesterday
  });
  assert.throws(() => parseStructuredPrediction(expired), /past/i);
});

test('calculation uses the existing provider and never substitutes a fake answer', async () => {
  const ai = {
    async generateCompletion(_messages, options) {
      assert.equal(options.localOnly, true);
      return '{"text":"I lean no.","direction":"leaning_no","strength":0.58,"time_window":{"start":"2026-08-18","end":"2026-09-01"},"manifestations":["continued silence"],"signals":["no direct contact"],"recommended_action":"Focus on your own plans.","valid_until":"2026-09-01","next_reassessment_at":"2026-08-25","statement_tags":{"prediction":["I lean no."],"interpretation":[],"advice":["Focus on your own plans."]}}';
    }
  };
  const prediction = await calculatePrediction(request, ai);
  assert.equal(prediction.direction, 'leaning_no');
});

test('calculation repairs one invalid local-model response before failing the request', async () => {
  let calls = 0;
  const ai = {
    async generateCompletion(messages) {
      calls += 1;
      if (calls === 1) return '{"next_reassessment_at":"invalid"}';
      assert.match(messages.at(-1).content, /invalid/i);
      return '{"text":"I lean yes.","direction":"leaning_yes","strength":0.6,"time_window":{"start":"2026-08-18","end":"2026-09-01"},"manifestations":["steady progress"],"signals":["a completed milestone"],"recommended_action":"Finish one bounded task.","valid_until":"2026-09-01","next_reassessment_at":"2026-08-25","statement_tags":{"prediction":["I lean yes."],"interpretation":[],"advice":["Finish one bounded task."]}}';
    }
  };
  const prediction = await calculatePrediction(request, ai);
  assert.equal(calls, 2);
  assert.equal(prediction.direction, 'leaning_yes');
});
