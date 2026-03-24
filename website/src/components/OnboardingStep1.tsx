import React, { useState } from 'react';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

interface BasicProfileData {
  full_name: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  gender: string;
  current_location: string;
}

const OnboardingStep1: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BasicProfileData>({
    full_name: '',
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: '',
    gender: '',
    current_location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/profile/basic', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      localStorage.setItem('onboarding_basic', JSON.stringify(formData));
      navigate('/onboarding/step-2');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CosmicBackground className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-pink to-cosmic-purple flex items-center justify-center shadow-neon-pink">
                <span className="text-white text-sm font-bold">1</span>
              </div>
            </div>
            <div className="w-16 h-1 rounded-full bg-white/20"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm font-medium">2</span>
              </div>
            </div>
            <div className="w-16 h-1 rounded-full bg-white/20"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm font-medium">3</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/60 mt-3">Step 1 of 3: Basic Profile</p>
        </div>

        <GlassCard className="p-8" glow="pink">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cosmic-pink/20 mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Tell Us About Yourself</h1>
            <p className="text-white/60 text-sm">Let's start with your basic information</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Time of Birth</label>
              <input
                type="time"
                name="time_of_birth"
                value={formData.time_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Place of Birth *</label>
              <input
                type="text"
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all"
                placeholder="City, Country"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all"
              >
                <option value="" className="bg-cosmic-deep-space">Select gender</option>
                <option value="male" className="bg-cosmic-deep-space">Male</option>
                <option value="female" className="bg-cosmic-deep-space">Female</option>
                <option value="other" className="bg-cosmic-deep-space">Other</option>
                <option value="prefer_not_to_say" className="bg-cosmic-deep-space">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Current Location</label>
              <input
                type="text"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/30 transition-all"
                placeholder="City, Country"
              />
            </div>

            <CosmicButton
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Next Step
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </CosmicButton>
          </form>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default OnboardingStep1;
