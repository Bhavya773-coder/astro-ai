const { calculatePersonalYear } = require('../../utils/numerology');
const { validateSignal } = require('./schema');

const PERSONAL_YEAR_SIGNALS = {
  1: ['yes', 0.65, 'beginnings, initiative, and independent action'],
  2: ['leaning_yes', 0.58, 'patience, cooperation, and gradual partnership'],
  3: ['yes', 0.65, 'expression, visibility, and creative expansion'],
  4: ['leaning_no', 0.62, 'structure, constraints, and preparation before expansion'],
  5: ['leaning_yes', 0.6, 'change, movement, and adaptable choices'],
  6: ['leaning_yes', 0.6, 'commitment, responsibility, and relationship focus'],
  7: ['unclear', 0.55, 'reflection, research, and waiting for clearer evidence'],
  8: ['yes', 0.68, 'material progress, authority, and measurable results'],
  9: ['unclear', 0.58, 'completion, release, and closing an existing cycle'],
  11: ['leaning_yes', 0.58, 'heightened intuition and patient alignment'],
  22: ['leaning_yes', 0.62, 'disciplined long-term building'],
  33: ['leaning_yes', 0.58, 'service, responsibility, and compassionate action']
};

function createNumerologySignal(birthData, question) {
  if (typeof birthData?.date_of_birth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthData.date_of_birth)) {
    throw new Error('Numerology signal requires date_of_birth in YYYY-MM-DD format');
  }
  if (typeof question !== 'string' || !question.trim()) {
    throw new Error('Numerology signal requires a question');
  }

  const personalYear = calculatePersonalYear(birthData.date_of_birth);
  const [direction, confidence, meaning] = PERSONAL_YEAR_SIGNALS[personalYear] || [
    'unclear',
    0.5,
    'a broad annual cycle without a specific directional emphasis'
  ];

  return validateSignal({
    module: 'numerology',
    scope: 'macro',
    direction,
    confidence,
    data_quality: 'medium',
    rationale: `Personal year ${personalYear} emphasizes ${meaning}; this is broad annual context, not a stand-alone answer to the question.`
  });
}

module.exports = { createNumerologySignal };
