import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

// HARDCODED REFERRAL CODE - Change this to your desired code
const VALID_REFERRAL_CODE = 'ASTRO-7X9P-2026';

const ReferralCodePage: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from state, default to login
  const intendedDestination = location.state?.destination || '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if referral code matches (case-insensitive)
    if (referralCode.trim().toUpperCase() === VALID_REFERRAL_CODE) {
      // Store in session that user has validated
      sessionStorage.setItem('referralValidated', 'true');
      // Redirect to intended destination
      navigate(intendedDestination);
    } else {
      setError('Invalid referral code. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ height: '100vh' }}>
      {/* Video Background Only */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.7) contrast(1.1)',
            transform: 'scale(1.05)',
            objectFit: 'cover'
          }}
          onError={(e) => console.error('Video loading error:', e)}
        >
          <source src="/Astroai-Background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Content with Scroll */}
      <div className="relative z-10 flex items-start justify-center px-4 overflow-y-auto pt-8 sm:pt-12" style={{ height: '100vh', minHeight: '100vh' }}>
        <div className="w-full max-w-md animate-slide-up py-8" style={{ minHeight: 'fit-content' }}>
          {/* Logo/Brand Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink mb-4 shadow-cosmic animate-pulse-glow">
              <span className="text-white text-3xl font-bold font-display">A</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-2 text-glow">Exclusive Access</h1>
            <p className="text-sm sm:text-base text-white/60 font-body">Enter your referral code to continue</p>
          </div>

          {/* Referral Form */}
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
              {/* Referral Code Field */}
              <div>
                <label htmlFor="referralCode" className="block text-sm sm:text-sm font-medium text-white/80 mb-2 sm:mb-2">
                  Referral Code
                </label>
                <div className="relative">
                  <div className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="referralCode"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 text-sm sm:text-base uppercase tracking-wider"
                    placeholder="Enter referral code"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-white/40">
                  Have a referral code? Enter it above to gain access.
                </p>
              </div>

              {/* Submit Button */}
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
                  'Verify & Continue'
                )}
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

export default ReferralCodePage;
