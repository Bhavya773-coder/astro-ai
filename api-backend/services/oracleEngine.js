const aiService = require('./aiService');
const { classifyMessage } = require('./oracleClassifier');
const { canonicalizeQuestion } = require('./oracleCanonicalizer');
const { buildInputSnapshot } = require('./oracleContextService');
const { calculatePrediction, calculateReconciledPrediction } = require('./oracleCalculationService');
const { createNumerologySignal } = require('./signals/numerologySignal');
const { createWesternSignal } = require('./signals/westernSignal');
const { reconcile } = require('./reconciliationEngine');
const { buildHopeMessages } = require('./oraclePrompt');
const { validateOracleOutput } = require('./oracleValidator');
const { trackOracleEvent } = require('./oracleAnalytics');

function useReconciliation() {
  return process.env.ORACLE_USE_RECONCILIATION === 'true';
}

function flattenStatementTags(tags = {}) {
  return ['prediction', 'interpretation', 'advice'].flatMap(tag =>
    (tags[tag] || []).map(text => ({ tag, text }))
  );
}

function strengthLabel(value) {
  const strength = Number(value);
  if (strength <= 0.4) return 'weak';
  if (strength <= 0.7) return 'moderate';
  return 'strong';
}

function createMongoStore() {
  const OraclePrediction = require('../models/OraclePrediction');
  const OracleInputSnapshot = require('../models/OracleInputSnapshot');

  return {
    findByQuestion({ userId, canonicalQuestionKey }) {
      return OraclePrediction.findOne({
        user_id: userId,
        canonical_question_key: canonicalQuestionKey,
        status: { $nin: ['cancelled_due_to_changed_context', 'expired_unrated'] }
      }).sort({ created_at: -1 }).lean();
    },
    findRecent({ userId, chatId }) {
      const query = { user_id: userId, status: { $nin: ['cancelled_due_to_changed_context', 'expired_unrated'] } };
      if (chatId) query.chat_id = chatId;
      return OraclePrediction.findOne(query).sort({ created_at: -1 }).lean();
    },
    createSnapshot(snapshot) {
      return OracleInputSnapshot.create({
        user_id: snapshot.user_id,
        authorized_inputs: snapshot,
        deterministic_sources: Object.values(snapshot.sources || {}).filter(source => source !== 'unavailable'),
        contextual_signals: snapshot.contextual_signals ? {
          location: snapshot.contextual_signals.current_location,
          environment: snapshot.contextual_signals.environment,
          calendar: snapshot.contextual_signals.calendar
        } : undefined,
        relevant_memories: (snapshot.memories || []).map(memory => memory._id).filter(Boolean),
        recent_prediction_ids: (snapshot.recent_predictions || []).map(item => item.prediction_id).filter(Boolean),
        question_context: snapshot.question_context,
        snapshot_hash: snapshot.material_hash,
        timestamp: snapshot.timestamp
      });
    },
    createPrediction(data) {
      const original = data.prediction_original;
      return OraclePrediction.create({
        ...data,
        prediction_original: {
          ...original,
          strength: strengthLabel(original.strength),
          reassessment_at: original.next_reassessment_at,
          statement_tags: flattenStatementTags(original.statement_tags),
          model_version: original.model_version || process.env.ORACLE_MODEL_VERSION || 'hope-v2'
        }
      });
    },
    async markReused(prediction, method) {
      await OraclePrediction.updateOne(
        { prediction_id: prediction.prediction_id, user_id: prediction.user_id },
        { $addToSet: { methods: method }, $set: { 'analytics_flags.reused': true } }
      );
      prediction.methods = [...new Set([...(prediction.methods || []), method])];
      prediction.analytics_flags = { ...(prediction.analytics_flags || {}), reused: true };
      return prediction;
    },
    cancel(prediction) {
      return OraclePrediction.updateOne(
        { prediction_id: prediction.prediction_id, user_id: prediction.user_id },
        { $set: { status: 'cancelled_due_to_changed_context' } }
      );
    },
    awaitOutcome(prediction) {
      return OraclePrediction.updateOne(
        { prediction_id: prediction.prediction_id, user_id: prediction.user_id },
        { $set: { status: 'awaiting_outcome' } }
      );
    }
  };
}

function defaultCategory(message) {
  const text = String(message).toLowerCase();
  if (/\b(name|spelling|spell|numerolog|number|vibration|chaldean|pythagor)\b/.test(text)) return 'numerology';
  if (/\b(love|relationship|partner|boyfriend|girlfriend|husband|wife|ex|call me|text me|crush|marry|marriage)\b/.test(text)) return 'love';
  if (/\b(job|career|work|promotion|business|boss|colleague|interview|study|exam|college)\b/.test(text)) return 'career';
  if (/\b(money|finance|income|investment|wealth|salary|debt)\b/.test(text)) return 'money';
  if (/\b(family|parent|mother|father|child|children|home|house|relatives)\b/.test(text)) return 'family';
  if (/\b(spirit|spiritual|destiny|purpose|karma|soul|path)\b/.test(text)) return 'spirituality';
  if (/\b(health|medical|pregnan|energy|fitness|wellness)\b/.test(text)) return 'health';
  return 'general';
}

function createOracleEngine(dependencies = {}) {
  const store = dependencies.store || createMongoStore();
  const classify = dependencies.classify || classifyMessage;
  const canonicalize = dependencies.canonicalize || canonicalizeQuestion;
  const buildContext = dependencies.buildContext || buildInputSnapshot;
  const calculate = dependencies.calculate || calculatePrediction;
  const calculateReconciled = dependencies.calculateReconciled || calculateReconciledPrediction;
  const createNumerology = dependencies.createNumerologySignal || createNumerologySignal;
  const createWestern = dependencies.createWesternSignal || createWesternSignal;
  const reconcileSignals = dependencies.reconcile || reconcile;
  const track = dependencies.track || trackOracleEvent;
  let validate = dependencies.validate || validateOracleOutput;
  const generateHope = dependencies.generateHope || (async input => aiService.generateCompletion(buildHopeMessages(input), { temperature: 0.65 }));

  async function safeTrack(event) {
    try { await track(event); } catch (error) { console.error('[OracleAnalytics]', error.message); }
  }

  async function respond({
    userId,
    chatId,
    message,
    method = 'astrology',
    methods,
    category,
    horizon,
    responseMode = 'short',
    ...contextOptions
  }) {
    const classification = classify(message);
    if (classification.highStakes) {
      const urgent = /\b(chest pain|kill me|suicid|cancer|medical|diagnos|medication|pregnan)\b/i.test(message);
      return {
        message_text: urgent
          ? 'I won’t use divination to assess this. If there may be immediate danger, contact local emergency services now; otherwise seek qualified medical help promptly.'
          : 'I won’t use divination as the basis for a high-stakes legal or financial decision. Please use a qualified real-world professional and independently verified information.',
        intent: 'high_stakes_redirect',
        prediction: null,
        reused: false,
        recalculated: false
      };
    }
    if (classification.certaintyPressure) await safeTrack({ userId, event: 'certainty_pressure_detected' });
    if (classification.binaryDemand) await safeTrack({ userId, event: 'binary_request_detected' });
    const recentIntent = classification.certaintyPressure || classification.repeatQuestion || classification.explanation || classification.outcomeReport || (classification.binaryDemand && !classification.prediction);
    let prior = recentIntent ? await store.findRecent({ userId, chatId }) : null;
    const canonical = prior && recentIntent
      ? { canonicalQuestion: prior.canonical_question, canonicalQuestionKey: prior.canonical_question_key }
      : canonicalize(message);

    if (!prior && canonical.canonicalQuestionKey) {
      prior = await store.findByQuestion({ userId, canonicalQuestionKey: canonical.canonicalQuestionKey });
    }

    if (classification.explanation && prior) {
      await safeTrack({ userId, event: 'explanation_requested', predictionId: prior.prediction_id });
      return {
        message_text: `I based that call on ${[...(prior.methods || []), ...(prior.prediction_original?.signals || [])].slice(0, 4).join(', ')}. The original call remains unchanged.`,
        intent: 'explanation',
        prediction: prior,
        reused: true,
        recalculated: false
      };
    }

    if (classification.outcomeReport && prior) {
      await safeTrack({ userId, event: 'outcome_prompted', predictionId: prior.prediction_id });
      return {
        message_text: 'I remember the original call. How close was it: very similar, partly, no, something else, or not sure?',
        intent: 'outcome_report',
        prediction: prior,
        reused: true,
        recalculated: false,
        outcome_prompt: true
      };
    }

    const shouldPredict = classification.prediction || classification.nearTermPrediction || classification.binaryDemand || classification.certaintyPressure || classification.repeatQuestion;
    const snapshot = await buildContext({ userId, chatId, question: message, ...contextOptions });

    if (!shouldPredict && !prior) {
      const messageText = await generateHope({
        question: message,
        category: category || defaultCategory(message),
        horizon: horizon || 'unspecified',
        methods: methods || [method],
        snapshot,
        prediction: null,
        responseMode
      });
      const validation = validate({ userMessage: message, responseText: messageText, snapshot });
      if (!validation.valid) throw new Error(`Oracle response validation failed: ${validation.violations.join(', ')}`);
      return { message_text: messageText, intent: classification.intent, prediction: null, reused: false, recalculated: false };
    }

    const previousHash = prior?.material_snapshot_hash || prior?.input_snapshot_hash || prior?.snapshot_hash;
    const cutoffs = [
      prior?.prediction_original?.reassessment_at,
      prior?.prediction_original?.next_reassessment_at,
      prior?.prediction_original?.valid_until
    ].filter(Boolean).map(value => Date.parse(value)).filter(Number.isFinite);
    const stillValid = cutoffs.every(cutoff => Date.now() < cutoff);
    const expired = cutoffs.some(cutoff => Date.now() >= cutoff);
    const sameInputs = prior && previousHash === snapshot.material_hash && stillValid;

    if (sameInputs) {
      const methodSwitched = !(prior.methods || []).includes(method);
      const messageText = await generateHope({
        question: message,
        category: prior.category,
        horizon: prior.horizon,
        methods: prior.methods,
        snapshot,
        prediction: prior.prediction_original,
        priorPrediction: prior,
        reused: true,
        responseMode
      });
      const validation = validate({
        userMessage: message,
        responseText: messageText,
        prediction: prior.prediction_original,
        previousPrediction: prior,
        snapshot,
        reused: true
      });
      if (!validation.valid) throw new Error(`Oracle response validation failed: ${validation.violations.join(', ')}`);
      prior = await store.markReused(prior, method);
      if (methodSwitched) await safeTrack({ userId, event: 'method_switched', predictionId: prior.prediction_id });
      await safeTrack({ userId, event: 'prediction_reused', predictionId: prior.prediction_id });
      return { message_text: messageText, intent: classification.intent, prediction: prior, reused: true, recalculated: false };
    }

    let reconciliation;
    let predictionOriginal;
    if (useReconciliation()) {
      try {
        const birthDetails = snapshot.kundli?.birth_details;
        if (!birthDetails?.date_of_birth || !birthDetails?.time_of_birth || !Number.isFinite(birthDetails?.latitude) || !Number.isFinite(birthDetails?.longitude)) {
          throw new Error('verified Kundli birth date, time, latitude, and longitude are required');
        }
        const signalQuestion = canonical.canonicalQuestion || message;
        reconciliation = reconcileSignals([
          createNumerology(birthDetails, signalQuestion),
          await createWestern(birthDetails, signalQuestion)
        ]);
        predictionOriginal = await calculateReconciled({
          question: signalQuestion,
          category: category || defaultCategory(message),
          horizon: horizon || (classification.nearTermPrediction ? 'near_term' : 'unspecified'),
          reconciliation,
          snapshot,
          priorPrediction: prior
        });
        if (predictionOriginal.direction !== reconciliation.overall_direction || predictionOriginal.strength > reconciliation.overall_confidence) {
          throw new Error('reconciliation delivery contradicted the reconciled direction or confidence');
        }
      } catch (error) {
        console.error(`[OracleReconciliation] ${error.message}; falling back to the legacy calculation for this request.`);
        reconciliation = undefined;
        predictionOriginal = await calculate({
          question: canonical.canonicalQuestion || message,
          category: category || defaultCategory(message),
          horizon: horizon || (classification.nearTermPrediction ? 'near_term' : 'unspecified'),
          methods: methods || [method],
          snapshot,
          priorPrediction: prior
        });
      }
    } else {
      predictionOriginal = await calculate({
        question: canonical.canonicalQuestion || message,
        category: category || defaultCategory(message),
        horizon: horizon || (classification.nearTermPrediction ? 'near_term' : 'unspecified'),
        methods: methods || [method],
        snapshot,
        priorPrediction: prior
      });
    }
    const messageText = await generateHope({
      question: message,
      category: category || defaultCategory(message),
      horizon: horizon || 'unspecified',
      methods: methods || [method],
      snapshot,
      prediction: predictionOriginal,
      priorPrediction: prior,
      reused: false,
      responseMode,
      reconciliation
    });
    const validation = validate({ userMessage: message, responseText: messageText, prediction: predictionOriginal, previousPrediction: prior, snapshot });
    if (!validation.valid) throw new Error(`Oracle response validation failed: ${validation.violations.join(', ')}`);

    const savedSnapshot = await store.createSnapshot({ ...snapshot, user_id: userId });
    const priorWasRated = ['confirmed_strong', 'confirmed_partial', 'missed'].includes(prior?.status);
    if (prior && !priorWasRated) await (expired ? store.awaitOutcome(prior) : store.cancel(prior));
    const created = await store.createPrediction({
      user_id: userId,
      chat_id: chatId,
      canonical_question: canonical.canonicalQuestion || message,
      canonical_question_key: canonical.canonicalQuestionKey,
      question_cluster: canonical.canonicalQuestionKey,
      category: category || defaultCategory(message),
      horizon: horizon || (classification.nearTermPrediction ? 'near_term' : 'unspecified'),
      methods: methods || [method],
      input_snapshot_id: savedSnapshot.snapshot_id,
      material_snapshot_hash: snapshot.material_hash,
      prediction_original: predictionOriginal,
      analytics_flags: {
        certainty_pressure: classification.certaintyPressure,
        binary_request: classification.binaryDemand,
        recalculation_reason: prior
          ? (priorWasRated ? 'new_cycle_after_outcome' : (expired ? 'reassessment_window_expired' : 'material_input_changed'))
          : undefined
      }
    });
    await safeTrack({ userId, event: prior ? 'prediction_recalculated' : 'prediction_created', predictionId: created.prediction_id });
    return {
      message_text: messageText,
      intent: classification.intent,
      prediction: created,
      reused: false,
      recalculated: Boolean(prior),
      ...(reconciliation && { reconciliation })
    };
  }

  return { respond, setValidator(next) { validate = next; } };
}

const oracleEngine = createOracleEngine();
module.exports = oracleEngine;
module.exports.createOracleEngine = createOracleEngine;
module.exports.strengthLabel = strengthLabel;
