const REQUIRED_FIELDS = [
  'module',
  'scope',
  'direction',
  'confidence',
  'data_quality',
  'rationale'
];

const SCOPES = new Set(['macro', 'meso', 'micro']);
const DIRECTIONS = new Set(['yes', 'leaning_yes', 'unclear', 'leaning_no', 'no']);
const DATA_QUALITIES = new Set(['high', 'medium', 'low']);

function validateSignal(signal) {
  const value = signal && typeof signal === 'object' && !Array.isArray(signal) ? signal : {};
  const missing = REQUIRED_FIELDS.filter(field => value[field] === undefined);
  if (missing.length) throw new Error(`Signal missing fields: ${missing.join(', ')}`);

  if (typeof value.module !== 'string' || !value.module.trim()) {
    throw new Error('Signal has invalid module');
  }
  if (!SCOPES.has(value.scope)) throw new Error('Signal has invalid scope');
  if (!DIRECTIONS.has(value.direction)) throw new Error('Signal has invalid direction');
  if (typeof value.confidence !== 'number' || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) {
    throw new Error('Signal has invalid confidence');
  }
  if (!DATA_QUALITIES.has(value.data_quality)) throw new Error('Signal has invalid data_quality');
  if (typeof value.rationale !== 'string' || !value.rationale.trim()) {
    throw new Error('Signal has invalid rationale');
  }

  return signal;
}

module.exports = {
  REQUIRED_FIELDS,
  SCOPES,
  DIRECTIONS,
  DATA_QUALITIES,
  validateSignal
};
