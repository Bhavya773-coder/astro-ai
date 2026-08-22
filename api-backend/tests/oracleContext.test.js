const test = require('node:test');
const assert = require('node:assert/strict');

const contextBuilder = require('../services/contextBuilder');

test('temporal context never presents approximate astrology as deterministic fact', () => {
  const context = contextBuilder._buildTemporalContext(new Date('2026-08-18T12:00:00.000Z'));

  assert.match(context, /CURRENT TEMPORAL CONTEXT:/);
  assert.match(context, /UTC timestamp:/);
  for (const unsupported of [
    'Hindu Month:',
    'Paksha (Fortnight):',
    'Tithi (Lunar Day):',
    'Current Hora (Planetary Hour):',
    'Rahu Kalam:',
    'Yama Gandam:',
    'Moon Phase:',
    'Current Hour Ruler:'
  ]) {
    assert.equal(context.includes(unsupported), false, unsupported);
  }
});

test('Hope identity is fixed and deterministic limits are explicit', () => {
  const identity = contextBuilder._buildIdentitySection('short', 'believer');

  assert.match(identity, /Your name is Hope/);
  assert.match(identity, /Never invent planetary positions, transits, dashas, lunar phases, or timing windows/);
  assert.doesNotMatch(identity, /professional Vedic astrologer/);
});
