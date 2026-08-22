'use strict';

const TEN_MINUTES = 10 * 60 * 1000;

function result(previousPrediction, recalculate, reason) {
  return {
    recalculate,
    reason,
    previous_prediction_id: previousPrediction.id,
    next_reassessment_at: recalculate ? null : previousPrediction.next_reassessment_at,
  };
}

function decideReassessment(input) {
  const previous = input.previousPrediction;

  if (input.significantTimeProgression) return result(previous, true, 'significant_time_progression');
  if (Date.parse(input.now) >= Date.parse(previous.next_reassessment_at)) {
    return result(previous, true, 'reassessment_window_expired');
  }
  if (input.userReportedNewEvent) return result(previous, true, 'new_event');
  if (input.location !== previous.location) return result(previous, true, 'location_changed');
  if (input.calendarContext !== previous.calendar_context) {
    return result(previous, true, 'calendar_context_changed');
  }
  if (input.canonicalQuestion !== previous.canonical_question) {
    return result(previous, true, 'canonical_question_changed');
  }
  if (input.materialSnapshotHash !== previous.material_snapshot_hash) {
    return result(previous, true, 'material_snapshot_changed');
  }

  const now = Date.parse(input.now);
  const repeats = (input.repeatTimestamps || []).filter((timestamp) => {
    const repeatedAt = Date.parse(timestamp);
    return repeatedAt >= now - TEN_MINUTES && repeatedAt <= now;
  });
  if (repeats.length >= 10) return result(previous, false, 'repetition_window');
  if (input.certaintyPressure) return result(previous, false, 'certainty_pressure');
  if (!(previous.methods || []).includes(input.method)) return result(previous, false, 'method_added');

  return result(previous, false, 'unchanged');
}

function recordMethod(methods, method) {
  return methods.includes(method) ? [...methods] : [...methods, method];
}

function resolveConfidence(previousConfidence, proposedConfidence, certaintyPressure) {
  return certaintyPressure
    ? Math.min(previousConfidence, proposedConfidence)
    : proposedConfidence;
}

module.exports = { decideReassessment, recordMethod, resolveConfidence };
