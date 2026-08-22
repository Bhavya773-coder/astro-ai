const crypto = require('node:crypto');

const METHODS = /\b(?:tarot|astrology|astrological|numerology|horoscope|oracle|kundli|cards?|psychic)\b/g;
const READING_METHODS = /\b(?:ask|use|check)\s+(?:the\s+)?(?:palm|face|coffee)(?:\s+reading)?\b/g;
const PRESSURE = /\b(?:are you (?:absolutely |really |completely )?sure|tell me honestly|be (?:100\s*% )?certain|for certain|definitely|guarantee(?:d)?|promise me)\b/g;

function normalizeQuestion(question) {
  let value = String(question || '')
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(PRESSURE, ' ')
    .replace(READING_METHODS, ' ')
    .replace(METHODS, ' ')
    .replace(/[^a-z0-9']+/g, ' ')
    .replace(/\b(?:please|really|absolutely)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  value = value
    .replace(/^(?:(?:ask|check|use|see|find out|tell me|predict)\s+)+/, '')
    .replace(/^(?:if|whether)\s+(.+?)\s+will\b/, 'will $1')
    .replace(/^when will\s+(.+)$/, 'will $1')
    .replace(/^is\s+(\S+)\s+going to\s+(.+)$/, 'will $1 $2')
    .replace(/\b(call|contact) me$/, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return value;
}

function canonicalizeQuestion(question) {
  const canonicalQuestion = normalizeQuestion(question);
  return {
    canonicalQuestion,
    canonicalQuestionKey: crypto.createHash('sha256').update(canonicalQuestion).digest('hex'),
    needsLlmFallback: !/^will\s+\S+\s+\S+/.test(canonicalQuestion)
  };
}

module.exports = { canonicalizeQuestion, normalizeQuestion };
