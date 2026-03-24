import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';

interface LifeContextData {
  career_stage: string;
  relationship_status: string;
  main_life_focus: string;
  personality_style: string;
  primary_life_problem: string;
}

const OnboardingStep2: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LifeContextData>({
    career_stage: '',
    relationship_status: '',
    main_life_focus: '',
    personality_style: '',
    primary_life_problem: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const basicData = localStorage.getItem('onboarding_basic');
    if (!basicData) {
      navigate('/onboarding/step-1');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiFetch('/api/profile/context', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      localStorage.setItem('onboarding_context', JSON.stringify(formData));
      navigate('/onboarding/step-3');
    } catch (err: any) {
      setError(err.message || 'Failed to save life context');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate('/onboarding/step-1');
  };

  return (
    <CosmicBackground className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-cyan to-cosmic-purple flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="w-16 h-1 rounded-full bg-cosmic-cyan"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-cyan to-cosmic-purple flex items-center justify-center shadow-neon-cyan">
                <span className="text-white text-sm font-bold">2</span>
              </div>
            </div>
            <div className="w-16 h-1 rounded-full bg-white/20"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm font-medium">3</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/60 mt-3">Step 2 of 3: Life Context</p>
        </div>

        <GlassCard className="p-8" glow="cyan">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cosmic-cyan/20 mb-4">
              <span className="text-3xl">🌟</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Life Context</h1>
            <p className="text-white/60 text-sm">Help us understand your current life situation</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Career Stage *</label>
              <select
                name="career_stage"
                value={formData.career_stage}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 transition-all"
                required
              >
                <option value="" className="bg-cosmic-deep-space">Select your career stage</option>
                <option value="student" className="bg-cosmic-deep-space">Student</option>
                <option value="early-career" className="bg-cosmic-deep-space">Early Career</option>
                <option value="mid-career" className="bg-cosmic-deep-space">Mid Career</option>
                <option value="entrepreneur" className="bg-cosmic-deep-space">Entrepreneur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Relationship Status *</label>
              <select
                name="relationship_status"
                value={formData.relationship_status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 transition-all"
                required
              >
                <option value="" className="bg-cosmic-deep-space">Select relationship status</option>
                <option value="single" className="bg-cosmic-deep-space">Single</option>
                <option value="relationship" className="bg-cosmic-deep-space">In a Relationship</option>
                <option value="married" className="bg-cosmic-deep-space">Married</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Main Life Focus *</label>
              <select
                name="main_life_focus"
                value={formData.main_life_focus}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 transition-all"
                required
              >
                <option value="" className="bg-cosmic-deep-space">Select your main focus</option>
                <option value="career" className="bg-cosmic-deep-space">Career</option>
                <option value="relationships" className="bg-cosmic-deep-space">Relationships</option>
                <option value="finance" className="bg-cosmic-deep-space">Finance</option>
                <option value="health" className="bg-cosmic-deep-space">Health</option>
                <option value="spirituality" className="bg-cosmic-deep-space">Spirituality</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Personality Style *</label>
              <select
                name="personality_style"
                value={formData.personality_style}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 transition-all"
                required
              >
                <option value="" className="bg-cosmic-deep-space">Select your personality style</option>
                <option value="analytical" className="bg-cosmic-deep-space">Analytical</option>
                <option value="emotional" className="bg-cosmic-deep-space">Emotional</option>
                <option value="practical" className="bg-cosmic-deep-space">Practical</option>
                <option value="spiritual" className="bg-cosmic-deep-space">Spiritual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Primary Life Challenge *</label>
              <textarea
                name="primary_life_problem"
                value={formData.primary_life_problem}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-cosmic bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cosmic-cyan focus:ring-2 focus:ring-cosmic-cyan/30 transition-all resize-none"
                placeholder="Describe your main life challenge or goal..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <CosmicButton
                type="button"
                variant="glass"
                onClick={goBack}
                className="flex-1"
              >
                Back
              </CosmicButton>
              <CosmicButton
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Generate Insights
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </CosmicButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default OnboardingStep2;
