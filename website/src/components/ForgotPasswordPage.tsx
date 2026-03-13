import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp } from '../api/client';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await requestOtp(email);
      setDevOtp((res as any)?.otp || null);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-custom-light-yellow flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-custom-yellow rounded-full mb-4">
            <span className="text-white text-3xl font-bold font-display">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">Forgot Password</h1>
          <p className="text-gray-600 font-sans">Enter your email and we’ll send a 6‑digit code.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error ? (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          ) : null}

          {sent ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                If an account exists for this email, a 6‑digit code has been sent.
              </div>

              {devOtp ? (
                <div className="rounded-lg bg-custom-light-yellow border border-custom-yellow p-3 text-sm text-gray-800">
                  <div className="font-medium mb-1">Dev OTP</div>
                  <div className="text-2xl font-mono tracking-widest text-custom-dark-yellow">{devOtp}</div>
                </div>
              ) : null}

              <button type="button" onClick={() => navigate('/verify-otp', { state: { email } })} className="btn-primary w-full">
                Enter code
              </button>

              <button type="button" onClick={() => navigate('/login')} className="btn-secondary w-full">
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Sending...' : 'Send code'}
              </button>

              <button type="button" onClick={() => navigate('/login')} className="btn-secondary w-full">
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
