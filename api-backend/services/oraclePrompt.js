const fs = require('fs');
const path = require('path');

const PROMPT_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'prompt.md'), 'utf8');

function promptSection(number) {
  const start = PROMPT_SOURCE.indexOf(`\n${number}. `);
  const end = PROMPT_SOURCE.indexOf(`\n${number + 1}. `, start + 1);
  if (start < 0 || end < 0) throw new Error(`prompt.md is missing section ${number}`);
  return PROMPT_SOURCE.slice(start + 1, end).trim();
}

const philosophy = PROMPT_SOURCE.match(/The fundamental rule is:\s*«([^»]+)»/)?.[1];
if (!philosophy) throw new Error('prompt.md is missing the fundamental rule');

const HOPE_RUNTIME_PROMPT = `Core philosophy: ${philosophy}\n\n` + [1, 2, 3, 4, 6, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  .map(promptSection)
  .join('\n\n')
  + '\n\nRuntime application: answer the current question directly using only the authorized source data below. Never invent deterministic data. Keep prediction, interpretation, and advice distinct.';

const PREDICTION_SCHEMA = `Return JSON only with:
{
  "text": "short plain-language call",
  "direction": "yes|leaning_yes|unclear|leaning_no|no",
  "strength": 0.0,
  "time_window": { "start": "ISO date like YYYY-MM-DD or null", "end": "ISO date like YYYY-MM-DD or null" },
  "manifestations": ["specific observable form"],
  "signals": ["observable signal"],
  "recommended_action": "one grounded action",
  "valid_until": "required ISO date after today (e.g. 7 days from today)",
  "next_reassessment_at": "required ISO date between today and valid_until (must not be after valid_until)",
  "statement_tags": { "prediction": [], "interpretation": [], "advice": [] }
}`;

function buildCalculationMessages({ question, category, horizon, methods, snapshot, priorPrediction }) {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      role: 'system',
      content: `You are the calculation layer for Hope, an Adaptive Oracle used for predictive entertainment and self-exploration.

Today is ${today}. All prediction dates must be ${today} or later.

${PREDICTION_SCHEMA}

GUIDANCE:
- Address the user's question directly. If open-ended (e.g. "what will happen today?"), identify the most prominent active daily theme (communication, career/study shift, or personal focus) and make a clear, grounded call.
- Never invent deterministic data. Use only facts and calculated values present in the labelled snapshot. If evidence is weak, use unclear or leaning language. Never claim supernatural certainty. Never turn divination into a factual accusation, medical diagnosis, legal finding, or financial guarantee. A prior prediction is immutable; do not rewrite it.`
    },
    {
      role: 'user',
      content: JSON.stringify({ question, category, horizon, methods, snapshot, prior_prediction: priorPrediction || null })
    }
  ];
}

function buildHopeMessages({ question, category, horizon, methods, snapshot, prediction, priorPrediction, reused, responseMode = 'short' }) {
  const profile = snapshot?.profile || {};
  const profileName = profile.full_name || profile.name || '';
  const numData = profile.numerology_data || {};
  const lifeCtx = profile.life_context || {};

  const profileLines = [
    profileName ? `Name: ${profileName}` : '',
    profile.date_of_birth ? `Birth Date: ${profile.date_of_birth}` : '',
    profile.current_location ? `Location: ${profile.current_location}` : '',
    profile.sun_sign ? `Sun Sign: ${profile.sun_sign}` : '',
    profile.moon_sign ? `Moon Sign: ${profile.moon_sign}` : '',
    profile.ascendant ? `Ascendant/Lagna: ${profile.ascendant}` : '',
    profile.dominant_planet ? `Dominant Planet: ${profile.dominant_planet}` : '',
    numData.life_path ? `Life Path Number: ${numData.life_path}` : '',
    numData.destiny ? `Destiny/Expression Number: ${numData.destiny}` : '',
    numData.personal_year ? `Personal Year: ${numData.personal_year}` : '',
    lifeCtx.career_stage ? `Career Stage: ${lifeCtx.career_stage}` : '',
    lifeCtx.relationship_status ? `Relationship Status: ${lifeCtx.relationship_status}` : '',
    lifeCtx.main_life_focus ? `Main Focus: ${lifeCtx.main_life_focus}` : ''
  ].filter(Boolean);

  const profileContext = profileLines.length > 0 ? `User's Complete Astrological Profile:\n${profileLines.join(', ')}` : '';
  const memoriesList = (snapshot?.memories || []).map(m => m.text || m.content).filter(Boolean);
  const memoriesContext = memoriesList.length > 0 ? `Known User Preferences & Memories: ${memoriesList.slice(0, 10).join('; ')}` : '';
  const predictionProfileContext = snapshot?.prediction_profile ? `prediction_profile (Past Accuracy Tracking): ${JSON.stringify(snapshot.prediction_profile)}` : '';
  const priorContext = priorPrediction ? `Prior Prediction on this Topic: ${JSON.stringify(priorPrediction)}` : '';
  const kundliContext = snapshot?.kundli ? `Verified Kundli source data: ${JSON.stringify(snapshot.kundli)}` : 'Verified Kundli source data: unavailable';
  const chatHistory = (snapshot?.chat_history || [])
    .slice(0, 12)
    .reverse()
    .map(message => `${message.role}: ${String(message.content || '').slice(0, 1000)}`)
    .join('\n');
  const chatContext = chatHistory ? `Current conversation history:\n${chatHistory}` : '';
  const calculatedCall = prediction ? `Your Structured Calculation Call:
- Direction: ${prediction.direction} (Strength: ${prediction.strength})
- Prediction Summary: ${prediction.text}
- Active Window: ${prediction.time_window?.start || 'soon'} to ${prediction.time_window?.end || prediction.valid_until || 'upcoming window'}
- Signals to Watch: ${(prediction.signals || []).join(', ') || 'N/A'}
- Manifestation Form: ${(prediction.manifestations || []).join(', ') || 'N/A'}
- Grounded Recommendation: ${prediction.recommended_action || 'N/A'}
- Valid Until: ${prediction.valid_until || 'N/A'} (Reassessment: ${prediction.next_reassessment_at || 'N/A'})` : '';

  const systemPrompt = `Your name is Hope.

${HOPE_RUNTIME_PROMPT}

Runtime response depth: ${responseMode}. Reused prediction: ${Boolean(reused)}.

AUTHORIZED SOURCE DATA:
${profileContext}
${kundliContext}
${memoriesContext}
${predictionProfileContext}
${priorContext}
${calculatedCall}
${snapshot?.contextual_signals ? 'Contextual signals: ' + JSON.stringify(snapshot.contextual_signals) : ''}
${chatContext}`;

  return [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: question
    }
  ];
}

module.exports = { HOPE_RUNTIME_PROMPT, PREDICTION_SCHEMA, buildCalculationMessages, buildHopeMessages };
