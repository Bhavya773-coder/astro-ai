import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await verifyOtp(email, otpCode);
      const resetSessionToken = (res as any)?.resetSessionToken;
      navigate('/new-password', { state: { resetSessionToken } });
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CosmicBackground className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-gold to-cosmic-pink mb-4 shadow-neon-gold">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2 text-glow-gold">Verify Code</h1>
          <p className="text-white/60 font-body">Enter the 6-digit code sent to {email}</p>
        </div>

        <GlassCard className="p-8" glow="gold">
          {error ? (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-4 text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-cosmic-gold focus:ring-2 focus:ring-cosmic-gold/30 transition-all duration-300"
                    required
                  />
                ))}
              </div>
            </div>

            <CosmicButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </CosmicButton>

            <CosmicButton
              type="button"
              variant="glass"
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Back
            </CosmicButton>
          </form>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default VerifyOtpPage;
