import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isBeliever, setIsBeliever] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  // Password validation rules
  const validatePassword = (pwd: string): { isValid: boolean; errors: string[]; strength: 'weak' | 'fair' | 'good' | 'strong' } => {
    const errors: string[] = [];
    let strengthScore = 0;
    
    // Length requirements
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (pwd.length >= 8) {
      strengthScore += 1;
    }
    if (pwd.length >= 12) {
      strengthScore += 1;
    }
    if (pwd.length >= 16) {
      strengthScore += 1;
    }

    // Character requirements
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    } else {
      strengthScore += 1;
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    } else {
      strengthScore += 1;
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain at least one number (0-9)');
    } else {
      strengthScore += 1;
    }

    // Special character requirements
    if (!/[!@#$%^&*()_+=\-\[\]{}|;:'",.<>?\/]/.test(pwd)) {
      errors.push('Password must contain at least one special character (!@#$%^&*()_+=-[]{}|;:\'",.<>?/)');
    } else {
      strengthScore += 1;
    }

    // Common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123', 'admin', 'letmein'];
    if (commonPasswords.includes(pwd.toLowerCase())) {
      errors.push('Please choose a more secure password');
      strengthScore = 0;
    }

    // No personal info
    if (email.toLowerCase() === pwd.toLowerCase()) {
      errors.push('Password cannot be the same as your email');
    }

    // Sequential characters
    if (/(.)\1{2,}|(123)|(abc)|(qwer)|(asdf)|(zxcv)/i.test(pwd)) {
      errors.push('Avoid sequential characters or common patterns');
      strengthScore = Math.max(0, strengthScore - 1);
    }

    // Determine strength
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    if (strengthScore >= 4) strength = 'strong';
    else if (strengthScore >= 3) strength = 'good';
    else if (strengthScore >= 2) strength = 'fair';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-400';
      case 'fair': return 'text-amber-400';
      case 'good': return 'text-yellow-400';
      case 'strong': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const validation = validatePassword(password);
    const strengthColor = getPasswordStrengthColor(validation.strength);
    const strengthPercent = validation.strength === 'weak' ? 25 : validation.strength === 'fair' ? 50 : validation.strength === 'good' ? 75 : 100;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-white/60">Password Strength:</span>
          <span className={`text-xs font-semibold ${strengthColor}`}>
            {validation.strength.toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${strengthColor.replace('text-', 'bg-')}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>Weak</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Strong</span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '));
      return;
    }

    // Show Terms & Conditions instead of registering immediately
    setShowTerms(true);
  };

  const handleAcceptTerms = async () => {
    setShowTerms(false);
    setIsLoading(true);
    try {
      const res = await register(email, password, isBeliever);
      setAuth(res.token, res.user);
      navigate('/onboarding/step-1');
    } catch (err: any) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
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

      {/* Signup Content with Scroll */}
      <div className="relative z-10 flex items-start justify-center px-4 overflow-y-auto pt-8 sm:pt-12" style={{ height: '100vh', minHeight: '100vh' }}>
        <div className="w-full max-w-md animate-slide-up py-8" style={{ minHeight: 'fit-content' }}>
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink mb-4 shadow-cosmic animate-pulse-glow">
            <span className="text-white text-3xl font-bold font-display">A</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-2 text-glow">Create Account</h1>
          <p className="text-sm sm:text-base text-white/60 font-body">Begin your cosmic journey</p>
        </div>

        <GlassCard className="p-6 sm:p-8" glow="cyan">
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
                  className="w-full pl-12 pr-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm sm:text-sm font-medium text-white/80 mb-2 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm sm:text-sm font-medium text-white/80 mb-2 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 text-sm sm:text-base"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm sm:text-sm text-white/80">
                  <input
                    type="radio"
                    name="believer"
                    checked={isBeliever}
                    onChange={(e) => setIsBeliever(e.target.value === 'true')}
                    className="w-4 h-4 text-cosmic-cyan focus:ring-cosmic-cyan"
                  />
                  <span className="ml-2">Believer</span>
                </label>
                <label className="flex items-center gap-2 text-sm sm:text-sm text-white/80">
                  <input
                    type="radio"
                    name="believer"
                    checked={!isBeliever}
                    onChange={(e) => setIsBeliever(e.target.value === 'true')}
                    className="w-4 h-4 text-cosmic-cyan focus:ring-cosmic-cyan"
                  />
                  <span className="ml-2">Non-Believer</span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm sm:text-sm text-cosmic-cyan hover:text-cosmic-pink transition-colors"
              >
                Already have an account?
              </button>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </CosmicButton>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-cosmic-cyan hover:text-white transition-colors duration-300 underline"
            >
              Sign in here
            </button>
          </p>
          
          

          <div className="mt-4 text-center">
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

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 sm:p-8" glow="purple">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-white mb-2 text-glow">Terms and Conditions</h2>
              <p className="text-sm text-white/60">Please read and accept our terms to begin your cosmic journey</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 space-y-5 text-white/80 text-sm pb-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="font-semibold text-white mb-2">Legal Disclaimer & Terms of Service</p>
                <p>Welcome to Astro AI. By creating an account, you agree to these terms. Please read them carefully.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 text-glow">1. Entertainment Purposes Only</h3>
                <p className="leading-relaxed">The astrological readings, tarot interpretations, and face-reading analyses provided by Astro AI are designed strictly for entertainment purposes. They do not constitute professional advice. You agree not to use the information provided on this platform as a substitute for professional financial, medical, psychological, or legal advice. If you are facing serious personal, health, or financial challenges, please consult a qualified professional.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2 text-glow">2. Artificial Intelligence Limitations</h3>
                <p className="leading-relaxed">Astro AI utilizes advanced artificial intelligence models to generate insights based on astrological traditions. However, AI is imperfect and may occasionally hallucinate, provide inconsistent interpretations, or fail to accurately capture complex astrological nuances. We make no guarantees about the accuracy, reliability, or completeness of any reading.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2 text-glow">3. Data Usage and Privacy</h3>
                <p className="leading-relaxed">To compute precise planetary positions and personalized insights, Astro AI requires personal data including your date of birth, time of birth, and location. By proceeding, you consent to the processing of this data for the purpose of generating your personalized cosmic profile. We value your privacy and implement security measures, but you acknowledge standard internet risks apply.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2 text-glow">4. Limitation of Liability</h3>
                <p className="leading-relaxed">Astro AI, its creators, and affiliates shall not be held liable for any decisions, actions, or life choices you make based on the content provided by our platform. Your life choices and paths are ultimately your own responsibility.</p>
              </div>
            </div>
            
            <div className="pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-cosmic text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10"
              >
                Decline
              </button>
              <CosmicButton
                type="button"
                onClick={handleAcceptTerms}
                variant="primary"
                className="w-full sm:w-auto px-8 py-3 sm:py-2"
              >
                Accept & Continue
              </CosmicButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
