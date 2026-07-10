import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifySignupOtp, resendSignupOtp } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

const SignupOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const email = (location.state as any)?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(25);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

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
    
    if (timer <= 0) {
      setError('OTP has expired. Please click Resend Code for a new one.');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await verifySignupOtp(email, otpCode);
      setAuth(res.token, res.user);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again or resend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await resendSignupOtp(email);
      setTimer(25);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-black" style={{ height: '100vh' }}>
      <div className="relative z-10 flex items-start justify-center px-4 overflow-y-auto pt-8 sm:pt-12" style={{ height: '100vh', minHeight: '100vh' }}>
        <div className="w-full max-w-md animate-slide-up py-8" style={{ minHeight: 'fit-content' }}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse-glow p-2">
              <img src="/favicon.png" alt="AstroAi4u" className="w-16 h-16 rounded-lg" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 text-glow">Verify Your Email</h1>
            <p className="text-sm sm:text-base text-white/60 font-body">We've sent a 6-digit code to <span className="text-fuchsia-400">{email}</span></p>
          </div>

          <GlassCard className="p-6 sm:p-8 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            {error ? (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-white/80">Verification Code</label>
                  <div className={`text-xs font-mono ${timer > 3 ? 'text-white/40' : 'text-red-400 animate-pulse'}`}>
                    Expires in: {timer}s
                  </div>
                </div>
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
                      disabled={timer <= 0 || isLoading}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-black/40 border-2 border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 transition-all duration-300 disabled:opacity-50"
                      required
                    />
                  ))}
                </div>
              </div>

              <CosmicButton
                type="submit"
                variant="primary"
                className="w-full py-3"
                disabled={isLoading || timer <= 0}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Verifying...
                  </span>
                ) : (
                  'Create Account'
                )}
              </CosmicButton>

              <div className="text-center">
                <button
                  type="button"
                  disabled={!canResend || isLoading}
                  onClick={handleResend}
                  className={`text-sm font-medium transition-colors ${canResend ? 'text-fuchsia-400 hover:text-fuchsia-300 underline' : 'text-white/20 cursor-not-allowed'}`}
                >
                  {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                ← Back to sign up
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SignupOtpPage;
