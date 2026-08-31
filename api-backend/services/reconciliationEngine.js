const { validateSignal } = require('./signals/schema');

const RELIABILITY = { high: 1, medium: 0.7, low: 0.4 };
const SCORE_BY_DIRECTION = { no: -2, leaning_no: -1, unclear: 0, leaning_yes: 1, yes: 2 };
const DIRECTION_BY_SCORE = ['no', 'leaning_no', 'unclear', 'leaning_yes', 'yes'];

function describeSignal(signal) {
  return `${signal.module} (${signal.data_quality} data quality, ${signal.scope} scope)`;
}

function reconcile(signals) {
  if (!Array.isArray(signals) || signals.length !== 2) {
    throw new Error('Reconciliation requires exactly two signals');
  }
  signals.forEach(validateSignal);

  const weighted = signals.map(signal => ({
    signal,
    weight: signal.confidence * RELIABILITY[signal.data_quality],
    score: SCORE_BY_DIRECTION[signal.direction]
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const overallScore = totalWeight
    ? weighted.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight
    : 0;
  const overallConfidence = weighted.reduce((sum, item) => sum + item.weight, 0)
    / signals.reduce((sum, signal) => sum + RELIABILITY[signal.data_quality], 0);
  const [first, second] = signals;
  const opposing = SCORE_BY_DIRECTION[first.direction] * SCORE_BY_DIRECTION[second.direction] < 0;

  let agreement = first.direction === second.direction ? 'full' : 'partial';
  let hedge_note = '';
  if (opposing) {
    agreement = first.confidence > 0.5 && second.confidence > 0.5 ? 'none' : 'partial';
    hedge_note = `${describeSignal(first)} disagrees with ${describeSignal(second)}; ${agreement === 'none' ? 'both are material inputs, so neither is treated as the real answer.' : 'the lower-weight signal is retained rather than silently discarded.'}`;
  } else if (agreement === 'partial') {
    hedge_note = `${describeSignal(first)} and ${describeSignal(second)} differ in directional strength.`;
  }

  return {
    overall_direction: DIRECTION_BY_SCORE[Math.round(overallScore) + 2],
    overall_confidence: Number(overallConfidence.toFixed(3)),
    agreement,
    contributing_signals: signals,
    hedge_note
  };
}

module.exports = { reconcile };
