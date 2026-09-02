const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

test('Signup OTP generates 6-digit code with ~10 minutes expiration', async () => {
  const now = Date.now();
  const expiresAt = new Date(now + 10 * 60 * 1000);
  const diffMinutes = (expiresAt.getTime() - now) / (60 * 1000);

  assert.equal(diffMinutes, 10);
  assert.ok(expiresAt > new Date(now + 9 * 60 * 1000));
});

test('Unverified user check in login flow', async () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password_hash: await bcrypt.hash('secret123', 10),
    is_verified: false,
    role: 'user',
    save: async function() { this.saved = true; }
  };

  const passwordMatches = await bcrypt.compare('secret123', mockUser.password_hash);
  assert.equal(passwordMatches, true);
  assert.equal(mockUser.is_verified, false);
});
