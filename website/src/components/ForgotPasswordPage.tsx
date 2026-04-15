import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp } from '../api/client';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

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
    <div className="min-h-screen text-white relative overflow-hidden bg-black" style={{ height: '100vh' }}>

      {/* Content with Scroll */}
      <div className="relative z-10 flex items-start justify-center px-4 overflow-y-auto pt-8 sm:pt-12" style={{ height: '100vh', minHeight: '100vh' }}>
        <div className="w-full max-w-md animate-slide-up py-8" style={{ minHeight: 'fit-content' }}>
          {/* Logo/Brand Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse-glow p-2">
              <img src="/favicon.png" alt="AstroAI" className="w-16 h-16 rounded-lg" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-2 text-glow">Forgot Password</h1>
            <p className="text-sm sm:text-base text-white/60 font-body">Enter your email and we'll send a 6-digit code</p>
          </div>

          <GlassCard className="p-6 sm:p-8 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
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

            {sent ? (
              <div className="space-y-4 sm:space-y-5">
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-300">
                  If an account exists for this email, a 6-digit code has been sent.
                </div>

                {devOtp ? (
                  <div className="rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 p-4 text-sm text-white">
                    <div className="font-medium mb-2 text-fuchsia-400">Dev OTP</div>
                    <div className="text-2xl font-mono tracking-widest text-fuchsia-400">{devOtp}</div>
                  </div>
                ) : null}

                <CosmicButton
                  type="button"
                  variant="primary"
                  className="w-full py-3 sm:py-3 text-sm sm:text-base"
                  onClick={() => navigate('/verify-otp', { state: { email } })}
                >
                  Enter code
                </CosmicButton>

                <CosmicButton
                  type="button"
                  variant="glass"
                  className="w-full py-3 sm:py-3 text-sm sm:text-base"
                  onClick={() => navigate('/login')}
                >
                  Back to login
                </CosmicButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm sm:text-sm font-medium text-white/80 mb-2 sm:mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-cosmic bg-black/40 border border-violet-500/30 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 text-sm sm:text-base"
                      placeholder="Enter your email"
                      required
                    />
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
                      Sending...
                    </span>
                  ) : (
                    'Send code'
                  )}
                </CosmicButton>

                <CosmicButton
                  type="button"
                  variant="glass"
                  className="w-full py-3 sm:py-3 text-sm sm:text-base"
                  onClick={() => navigate('/login')}
                >
                  Cancel
                </CosmicButton>
              </form>
            )}

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

export default ForgotPasswordPage;
