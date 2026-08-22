const test = require('node:test');
const assert = require('node:assert/strict');

const aiService = require('../services/aiService');

test('local Ollama remains the default when a Gemini key is present', () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.AI_PROVIDER;
  process.env.GEMINI_API_KEY = 'configured-key';
  try {
    assert.equal(new aiService.constructor().useGemini, false);
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test('Gemini is selected only when explicitly requested', () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_API_KEY = 'configured-key';
  try {
    assert.equal(new aiService.constructor().useGemini, true);
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test('local-only completions bypass Gemini even when globally selected', async () => {
  const service = new aiService.constructor();
  service.useGemini = true;
  service.maxRetries = 1;
  let geminiCalls = 0;
  service._geminiNonStreamChat = async () => { geminiCalls += 1; return 'remote'; };
  service._nonStreamChat = async () => 'local';

  const result = await service.generateCompletion([{ role: 'user', content: 'Hello' }], { localOnly: true });
  assert.equal(result, 'local');
  assert.equal(geminiCalls, 0);
});

test('transient Gemini overload falls back to local Ollama', async () => {
  const service = new aiService.constructor();
  service.useGemini = true;
  service.maxRetries = 1;
  let ollamaCalls = 0;
  service._geminiNonStreamChat = async () => {
    const error = new Error('high demand');
    error.response = { status: 503 };
    throw error;
  };
  service._nonStreamChat = async () => {
    ollamaCalls += 1;
    return 'local response';
  };

  const result = await service.generateCompletion([{ role: 'user', content: 'Hello' }]);
  assert.equal(result, 'local response');
  assert.equal(ollamaCalls, 1);
});

test('Gemini authentication errors do not fall back silently', async () => {
  const service = new aiService.constructor();
  service.useGemini = true;
  service.maxRetries = 1;
  let ollamaCalls = 0;
  service._geminiNonStreamChat = async () => {
    const error = new Error('bad key');
    error.response = { status: 403, data: { error: { message: 'bad key' } } };
    throw error;
  };
  service._nonStreamChat = async () => {
    ollamaCalls += 1;
    return 'should not run';
  };

  await assert.rejects(service.generateCompletion([{ role: 'user', content: 'Hello' }]), /bad key/);
  assert.equal(ollamaCalls, 0);
});
