import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import toast from 'react-hot-toast';
import { AlertTriangle, Telescope } from 'lucide-react';

const OnboardingStep3: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Analyzing birth details...');

  useEffect(() => {
    const progressSteps = [
      'Analyzing birth details...',
      'Calculating planetary positions...',
      'Generating birth chart insights...',
      'Computing numerology patterns...',
      'Creating personalized recommendations...',
      'Finalizing your cosmic profile...'
    ];

    const generateInsights = async () => {
      try {
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
          stepIndex++;
          if (stepIndex < progressSteps.length) {
            setCurrentStep(progressSteps[stepIndex]);
          }
          
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 800);

        const response = await apiFetch('/api/profile/generate-insights', {
          method: 'POST',
          body: JSON.stringify({})
        });

        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStep('Complete!');

        localStorage.removeItem('onboarding_basic');
        localStorage.removeItem('onboarding_context');

        toast.success('Your insights are ready! Explore them in the Numerology tab.');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (err: any) {
        setError(err.message || 'Failed to generate insights');
        toast.error('Failed to generate insights. Please try again.');
      }
    };

    generateInsights();
  }, [navigate]);

  if (error) {
    return (
      <CosmicBackground className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <GlassCard className="p-8 text-center bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-4">Generation Failed</h1>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3 px-6 rounded-cosmic transition-colors"
            >
              Return to Dashboard
            </button>
          </GlassCard>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="w-16 h-1 rounded-full bg-fuchsia-500"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="w-16 h-1 rounded-full bg-fuchsia-500"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                <span className="text-white text-sm font-bold">3</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/60 mt-3">Step 3 of 3: Generating Insights</p>
        </div>

        <GlassCard className="p-8 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/30"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-fuchsia-500 border-r-fuchsia-500 border-b-transparent border-l-transparent animate-spin"
                style={{ transform: `rotate(${progress * 3.6}deg)` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Telescope className="w-10 h-10 text-violet-300" />
              </div>
            </div>
            
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              {progress < 100 ? 'Mapping Your Cosmic Path...' : 'Complete!'}
            </h1>
            
            <p className="text-white/60 mb-6">
              {progress < 100 ? currentStep : 'Your cosmic profile has been successfully created.'}
            </p>

            <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-2 text-sm text-white/50">
              {progress >= 20 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-fuchsia-400">✓</span>
                  <span>Analyzing birth chart patterns</span>
                </div>
              )}
              {progress >= 40 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-fuchsia-400">✓</span>
                  <span>Calculating numerology profiles</span>
                </div>
              )}
              {progress >= 60 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-fuchsia-400">✓</span>
                  <span>Processing life context data</span>
                </div>
              )}
              {progress >= 80 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-fuchsia-400">✓</span>
                  <span>Generating personalized insights</span>
                </div>
              )}
              {progress >= 100 && (
                <div className="flex items-center justify-center gap-2 text-fuchsia-400">
                  <span>✓</span>
                  <span className="font-semibold">Complete! Redirecting to dashboard...</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default OnboardingStep3;
