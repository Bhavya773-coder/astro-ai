const aiService = require('./aiService');
const { buildCalculationMessages } = require('./oraclePrompt');

const REQUIRED = [
  'text',
  'direction',
  'strength',
  'time_window',
  'manifestations',
  'signals',
  'recommended_action',
  'valid_until',
  'next_reassessment_at',
  'statement_tags'
];
const DIRECTIONS = new Set(['yes', 'leaning_yes', 'unclear', 'leaning_no', 'no']);

function extractJsonCandidate(raw) {
  const text = String(raw || '').trim();
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const blockContent = codeBlockMatch[1].trim();
    const firstBrace = blockContent.indexOf('{');
    const lastBrace = blockContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return blockContent.substring(firstBrace, lastBrace + 1);
    }
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }

  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function parseStructuredPrediction(raw) {
  const unfenced = extractJsonCandidate(raw);
  let value;
  try {
    value = JSON.parse(unfenced);
  } catch {
    throw new Error('Oracle calculation returned invalid JSON');
  }

  const missing = REQUIRED.filter(field => value[field] === undefined);
  if (missing.length) throw new Error(`Oracle calculation missing fields: ${missing.join(', ')}`);
  if (!DIRECTIONS.has(value.direction)) throw new Error('Oracle calculation has invalid direction');
  if (typeof value.strength !== 'number' || value.strength < 0 || value.strength > 1) {
    throw new Error('Oracle calculation has invalid strength');
  }
  if (typeof value.text !== 'string' || !value.text.trim() || value.text.length > 2000) {
    throw new Error('Oracle calculation has invalid text');
  }
  if (!value.time_window || typeof value.time_window !== 'object') {
    throw new Error('Oracle calculation has invalid time_window');
  }
  const validUntil = Date.parse(value.valid_until);
  const reassessmentAt = Date.parse(value.next_reassessment_at);
  if (!Number.isFinite(validUntil)) throw new Error('Oracle calculation has invalid valid_until');
  if (validUntil < Date.parse(new Date().toISOString().slice(0, 10))) {
    throw new Error('Oracle calculation valid_until is in the past');
  }
  if (!Number.isFinite(reassessmentAt)) {
    throw new Error('Oracle calculation has invalid next_reassessment_at');
  }
  if (reassessmentAt > validUntil) {
    value.next_reassessment_at = value.valid_until;
  }
  if (!Array.isArray(value.manifestations) || !Array.isArray(value.signals)) {
    throw new Error('Oracle calculation manifestations and signals must be arrays');
  }
  for (const tag of ['prediction', 'interpretation', 'advice']) {
    if (!Array.isArray(value.statement_tags?.[tag]) || value.statement_tags[tag].some(item => typeof item !== 'string')) {
      throw new Error(`Oracle calculation missing statement_tags.${tag}`);
    }
  }
  return value;
}

async function calculatePrediction(request, provider = aiService) {
  const messages = buildCalculationMessages(request);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const raw = await provider.generateCompletion(messages, { temperature: attempt ? 0 : 0.2, localOnly: true });
    try {
      return parseStructuredPrediction(raw);
    } catch (error) {
      if (attempt === 1) throw error;
      messages.push({ role: 'user', content: `Your previous JSON was invalid: ${error.message}. Return one corrected JSON object only.` });
    }
  }
}

module.exports = { parseStructuredPrediction, calculatePrediction };
