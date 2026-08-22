const NEAR_TERM = /\b(today|tonight|tomorrow|this (?:week|weekend|month)|next (?:hour|day|week|month)|soon|within \d+ (?:minutes?|hours?|days?|weeks?))\b/;
const PREDICTION = /\b(will|when will|going to|predict|what (?:is|are) going to happen|what(?:'s| is) next|do (?:you think )?i (?:need to|have to)|should i)\b/;
const EXPLANATION = /\b(how did you (?:decide|know|predict)|explain|reason(?:ing)? behind|what made you say|why are you saying|why did you (?:say|predict)|why (?:this|that) (?:call|prediction|reading))\b/;
const OUTCOME = /\b(you were (?:right|wrong)|you predicted|just like you said|it happened|did(?: not|n't) happen|called me|got the job|we broke up)\b/;
const REPEAT = /\b(same question|ask(?:ing)? again|already asked|repeat (?:that|the question)|one more time)\b/;
const CORRECTION = /^(?:no,?|actually|i meant)\b|\b(?:that(?:'s| is) (?:wrong|not what i meant)|you misunderstood)\b/;
const INTERPRETATION = /\b(what does|what do).+\b(mean|signify)|\binterpret(?:ation)?\b|\bmeaning of\b/;
const BINARY = /\b(yes or no|just (?:say|answer) yes|give me a (?:yes|no)|binary answer)\b/;
const PRESSURE = /\b(are you (?:absolutely |really |completely )?sure|100\s*%|for certain|guarantee(?:d)?|definitely|promise me|be certain|tell me honestly)\b/;
const HIGH_STAKES = /\b(chest pain|kill me|suicid|pregnan|cancer|medical|diagnos|medication|all my savings|invest|crypto|stock|court case|lawsuit|legal|arrest|jail)\b/;
const THIRD_PARTY = /\b(my ex|my partner|my (?:boyfriend|girlfriend|husband|wife)|he|she|his|her|they|their)\b/;

function classifyMessage(message) {
  const normalized = String(message || '').toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
  const prediction = PREDICTION.test(normalized);
  const nearTermPrediction = prediction && NEAR_TERM.test(normalized);
  const binaryDemand = BINARY.test(normalized);
  const certaintyPressure = PRESSURE.test(normalized);
  const highStakes = HIGH_STAKES.test(normalized);
  const thirdParty = THIRD_PARTY.test(normalized);

  let intent = 'unknown';
  if (CORRECTION.test(normalized)) intent = 'user_correction';
  else if (OUTCOME.test(normalized)) intent = 'outcome_report';
  else if (REPEAT.test(normalized)) intent = 'repeat_question';
  else if (EXPLANATION.test(normalized)) intent = 'explanation';
  else if (INTERPRETATION.test(normalized)) intent = 'interpretation';
  else if (nearTermPrediction) intent = 'near_term_prediction';
  else if (prediction) intent = 'prediction';
  else if (certaintyPressure) intent = 'certainty_pressure';
  else if (binaryDemand) intent = 'binary_demand';

  return {
    intent,
    prediction,
    nearTermPrediction,
    explanation: intent === 'explanation',
    outcomeReport: intent === 'outcome_report',
    repeatQuestion: intent === 'repeat_question',
    userCorrection: intent === 'user_correction',
    interpretation: intent === 'interpretation',
    binaryDemand,
    certaintyPressure,
    highStakes,
    thirdParty,
    allowsStrengthIncrease: false,
    needsLlmFallback: intent === 'unknown'
  };
}

module.exports = { classifyMessage };
