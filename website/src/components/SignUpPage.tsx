import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBeliever, setIsBeliever] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordFocus, setPasswordFocus] = useState(false);

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
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
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
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 text-sm sm:text-base"
                  placeholder="Confirm your password"
                  required
                />
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
    </div>
  );
};

export default SignUpPage;
