const CERTAINTY = /\b(100\s*%|guaranteed|definitely (?:will|won't|is|has)|certain to|cannot be wrong)\b/i;
const THIRD_PARTY_FACT = /\b(?:he|she|they|your partner) (?:is|are) (?:definitely )?(?:cheating|lying|stealing|hiding|pregnant)\b/i;
const DETERMINISTIC_CLAIM = /\b(?:sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu) (?:is |are )?(?:currently )?(?:at \d+(?:\.\d+)?\s*(?:degrees?|°)|in your \w+ house)|\b(?:your )?(?:maha)?dasha is\b|\brahu kalam is\b/i;
const MEDICAL_EMERGENCY = /\b(chest pain|cannot breathe|can't breathe|difficulty breathing|severe bleeding|unconscious|overdose|suicid(?:e|al)|stroke symptoms)\b/i;
const URGENT_GUIDANCE = /\b(call|contact|seek|go to)\b.{0,40}\b(emergency services|emergency care|urgent medical|hospital|doctor|crisis line)\b/i;

function validateOracleOutput({
  userMessage = '',
  responseText = '',
  prediction,
  previousPrediction,
  snapshot = {},
  reused = false
}) {
  const violations = [];
  const generatedText = [
    responseText,
    prediction?.text,
    prediction?.recommended_action,
    ...(prediction?.signals || []),
    ...(prediction?.manifestations || [])
  ].filter(Boolean).join('\n');

  if (CERTAINTY.test(generatedText)) violations.push('certainty_guarantee');
  if (THIRD_PARTY_FACT.test(generatedText)) violations.push('third_party_factual_accusation');

  const hasCalculatedAstrology = (snapshot.sources?.astrological_calculation
    && snapshot.sources.astrological_calculation !== 'unavailable')
    || snapshot.sources?.kundli === 'KundliReport';
  if (!hasCalculatedAstrology && DETERMINISTIC_CLAIM.test(generatedText)) {
    violations.push('unsupported_deterministic_claim');
  }

  if (reused && previousPrediction?.prediction_original && prediction) {
    const original = previousPrediction.prediction_original;
    if (prediction.text !== original.text || prediction.strength !== original.strength) {
      violations.push('original_prediction_changed');
    }
  }

  if (MEDICAL_EMERGENCY.test(userMessage) && !URGENT_GUIDANCE.test(responseText)) {
    violations.push('missing_emergency_guidance');
  }

  return { valid: violations.length === 0, violations };
}

module.exports = { validateOracleOutput };
