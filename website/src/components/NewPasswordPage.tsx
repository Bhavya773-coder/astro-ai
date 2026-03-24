import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPasswordWithOtp } from '../api/client';

const NewPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetSessionToken = (location.state as any)?.resetSessionToken || '';

  // Debug: Force refresh if token is missing
  React.useEffect(() => {
    console.log('NewPasswordPage - resetSessionToken:', resetSessionToken);
    if (!resetSessionToken) {
      console.error('No resetSessionToken found, redirecting to forgot password');
      navigate('/forgot-password');
    }
  }, [resetSessionToken, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending resetSessionToken:', resetSessionToken);
      await resetPasswordWithOtp(password, resetSessionToken);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-custom-light-yellow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">Password Reset</h1>
            <p className="text-gray-600 font-sans">Your password has been updated successfully.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full">
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-custom-light-yellow flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-custom-yellow rounded-full mb-4">
            <span className="text-white text-3xl font-bold font-display">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">New Password</h1>
          <p className="text-gray-600 font-sans">Enter your new password.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error ? (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Updating...' : 'Update password'}
            </button>

            <button type="button" onClick={() => navigate('/login')} className="btn-secondary w-full">
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordPage;
