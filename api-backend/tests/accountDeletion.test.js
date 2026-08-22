const test = require('node:test');
const assert = require('node:assert/strict');

const { deleteAccountData } = require('../controllers/profile.controller');

function model(method, calls, name, error) {
  return {
    [method]: async () => {
      calls.push(name);
      if (error) throw error;
    }
  };
}

test('account deletion fails closed and keeps the user retryable', async () => {
  const calls = [];
  const failure = new Error('message deletion failed');
  const models = {
    Profile: model('findOneAndDelete', calls, 'profile'),
    Report: model('deleteMany', calls, 'report'),
    Chat: model('deleteMany', calls, 'chat'),
    Message: model('deleteMany', calls, 'message', failure),
    AstroCalendarEvent: model('deleteMany', calls, 'calendar'),
    ImageReading: model('deleteMany', calls, 'image'),
    PushToken: model('deleteMany', calls, 'push'),
    OraclePrediction: model('deleteMany', calls, 'prediction'),
    OracleInputSnapshot: model('deleteMany', calls, 'snapshot'),
    OracleMemory: model('deleteMany', calls, 'memory'),
    OracleAnalyticsEvent: model('deleteMany', calls, 'analytics'),
    User: model('findByIdAndDelete', calls, 'user')
  };

  await assert.rejects(deleteAccountData('u1', models), failure);
  assert.equal(calls.includes('user'), false);
});
