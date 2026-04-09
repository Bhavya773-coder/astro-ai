import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../api/client';
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
    <div className="min-h-screen text-white relative overflow-hidden bg-black" style={{ height: '100vh' }}>

      {/* Content with Scroll */}
      <div className="relative z-10 flex items-start justify-center px-4 overflow-y-auto pt-8 sm:pt-12" style={{ height: '100vh', minHeight: '100vh' }}>
        <div className="w-full max-w-md animate-slide-up py-8" style={{ minHeight: 'fit-content' }}>
          {/* Logo/Brand Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink mb-4 shadow-cosmic animate-pulse-glow">
              <span className="text-white text-3xl font-bold font-display">A</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-2 text-glow">Verify Code</h1>
            <p className="text-sm sm:text-base text-white/60 font-body">Enter the 6-digit code sent to {email}</p>
          </div>

          <GlassCard className="p-6 sm:p-8" glow="pink">
            {error ? (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300 animate-shake">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-4 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
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
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-white/5 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all duration-300"
                      required
                    />
                  ))}
                </div>
              </div>

              <CosmicButton
                type="submit"
                variant="primary"
                className="w-full py-3 sm:py-3 text-sm sm:text-base"
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
                className="w-full py-3 sm:py-3 text-sm sm:text-base"
                onClick={() => navigate('/forgot-password')}
              >
                Back
              </CosmicButton>
            </form>

            {/* Back to home */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                ← Back to home
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
