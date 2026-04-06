import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { apiFetch } from '../api/client';

interface DressingSuggestion {
  headline: string;
  overview: string;
  color_palette: string;
  outfit_top: string;
  outfit_bottom: string;
  outfit_footwear: string;
  accessories: string;
  jewelry: string;
  makeup_grooming: string;
  lucky_item: string;
  astrological_reason: string;
  mood_energy: string;
  date?: string;
  created_at?: string;
}

const DressingStylerPage: React.FC = () => {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState<DressingSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  // Check if already generated today
  useEffect(() => {
    const checkTodaySuggestion = async () => {
      try {
        const response = await apiFetch('/api/dressing-styler/today');
        if (response?.success && response.data) {
          setSuggestion(response.data);
          setHasGeneratedToday(true);
        }
      } catch (error) {
        console.error('Error checking today suggestion:', error);
      }
    };

    checkTodaySuggestion();
  }, []);

  // Countdown timer for next day
  useEffect(() => {
    if (!hasGeneratedToday) return;

    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [hasGeneratedToday]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await apiFetch('/api/dressing-styler/generate', {
        method: 'POST'
      });

      if (response?.success) {
        if (response.source === 'cache') {
          setSuggestion(response.data);
          setHasGeneratedToday(true);
        } else {
          setSuggestion(response.data);
          setHasGeneratedToday(true);
        }
      } else {
        if (response?.message?.includes('Profile not found')) {
          setError('Please complete your profile first to get personalized styling suggestions.');
        } else {
          setError(response?.message || 'Failed to generate suggestion');
        }
      }
    } catch (error: any) {
      console.error('Error generating dressing suggestion:', error);
      setError(error?.message || 'Failed to generate dressing suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-20 overflow-y-auto h-screen" id="main-content">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👗</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                <GradientText>Personal Dressing Styler</GradientText>
              </h1>
              <p className="mt-2 text-white/75 max-w-2xl mx-auto">
                Get AI-powered outfit suggestions based on your astrological profile and numerology
              </p>
              <p className="mt-1 text-cosmic-cyan text-sm">{today}</p>
            </div>

            {/* Generate Button or Countdown */}
            {!hasGeneratedToday ? (
              <GlassCard className="p-8 text-center mb-8" glow="pink">
                <div className="mb-6">
                  <span className="text-5xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Discover Your Perfect Look for Today
                </h2>
                <p className="text-white/70 mb-6 max-w-lg mx-auto">
                  Our AI analyzes your zodiac sign, numerology, and cosmic energies to suggest 
                  the perfect outfit that aligns with your personal vibration.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Consulting the Cosmic Stylist...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">👗</span>
                      <span>Generate Today's Style</span>
                    </>
                  )}
                </button>
              </GlassCard>
            ) : (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-cosmic-cyan/30 rounded-full">
                  <span className="text-cosmic-cyan">⏰</span>
                  <span className="text-white/80 text-sm">Next suggestion available in: {countdown}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <GlassCard className="p-6 mb-8 border-red-500/30" glow="pink">
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
                {error.includes('profile') && (
                  <button
                    onClick={() => navigate('/onboarding/step-1')}
                    className="mt-4 text-cosmic-cyan hover:underline text-sm"
                  >
                    Complete your profile →
                  </button>
                )}
              </GlassCard>
            )}

            {/* Suggestion Display */}
            {suggestion && (
              <div className="space-y-6">
                {/* Headline */}
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    "{suggestion.headline}"
                  </h2>
                </div>

                {/* Overview */}
                <GlassCard className="p-6" glow="purple">
                  <h3 className="text-lg font-semibold text-cosmic-pink mb-3 flex items-center gap-2">
                    <span>✨</span> Today's Cosmic Vibe
                  </h3>
                  <p className="text-white/80 leading-relaxed">{suggestion.overview}</p>
                </GlassCard>

                {/* Color Palette */}
                <GlassCard className="p-6" glow="cyan">
                  <h3 className="text-lg font-semibold text-cosmic-cyan mb-3 flex items-center gap-2">
                    <span>🎨</span> Your Power Colors
                  </h3>
                  <p className="text-white/80 leading-relaxed whitespace-pre-line">{suggestion.color_palette}</p>
                </GlassCard>

                {/* Outfit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassCard className="p-5" glow="pink">
                    <h4 className="text-pink-300 font-semibold mb-2 flex items-center gap-2">
                      <span>👕</span> Top
                    </h4>
                    <p className="text-white/80 text-sm">{suggestion.outfit_top}</p>
                  </GlassCard>

                  <GlassCard className="p-5" glow="purple">
                    <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                      <span>👖</span> Bottom
                    </h4>
                    <p className="text-white/80 text-sm">{suggestion.outfit_bottom}</p>
                  </GlassCard>

                  <GlassCard className="p-5" glow="cyan">
                    <h4 className="text-cosmic-cyan font-semibold mb-2 flex items-center gap-2">
                      <span>👟</span> Footwear
                    </h4>
                    <p className="text-white/80 text-sm">{suggestion.outfit_footwear}</p>
                  </GlassCard>
                </div>

                {/* Accessories & Jewelry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-5" glow="gold">
                    <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                      <span>👜</span> Accessories
                    </h4>
                    <p className="text-white/80 text-sm whitespace-pre-line">{suggestion.accessories}</p>
                  </GlassCard>

                  <GlassCard className="p-5" glow="pink">
                    <h4 className="text-pink-300 font-semibold mb-2 flex items-center gap-2">
                      <span>💎</span> Jewelry
                    </h4>
                    <p className="text-white/80 text-sm">{suggestion.jewelry}</p>
                  </GlassCard>
                </div>

                {/* Makeup & Lucky Item */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-5" glow="purple">
                    <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                      <span>💄</span> Makeup & Grooming
                    </h4>
                    <p className="text-white/80 text-sm">{suggestion.makeup_grooming}</p>
                  </GlassCard>

                  <GlassCard className="p-5" glow="gold">
                    <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                      <span>🍀</span> Lucky Item
                    </h4>
                    <p className="text-white/80 text-sm">{suggestion.lucky_item}</p>
                  </GlassCard>
                </div>

                {/* Astrological Reason */}
                <GlassCard className="p-6" glow="cyan">
                  <h3 className="text-lg font-semibold text-cosmic-cyan mb-3 flex items-center gap-2">
                    <span>🌟</span> Why This Works
                  </h3>
                  <p className="text-white/80 leading-relaxed">{suggestion.astrological_reason}</p>
                </GlassCard>

                {/* Mood Energy */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-full">
                    <span className="text-2xl">✨</span>
                    <span className="text-white font-medium">{suggestion.mood_energy}</span>
                  </div>
                </div>

                {/* Share/Copy Section */}
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      const text = `Today's Look: "${suggestion.headline}"\n\n${suggestion.overview}\n\nColors: ${suggestion.color_palette}\n\nTop: ${suggestion.outfit_top}\nBottom: ${suggestion.outfit_bottom}\nShoes: ${suggestion.outfit_footwear}\n\n#LuckyFit`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-sm rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            )}

            {/* Info Section */}
            {!suggestion && !isGenerating && !hasGeneratedToday && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-cosmic-cyan/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Astrology-Based</h4>
                  <p className="text-white/60 text-sm">Suggestions based on your sun, moon, and rising signs</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-pink-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔢</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Numerology Enhanced</h4>
                  <p className="text-white/60 text-sm">Your life path number influences color and style choices</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Daily Fresh</h4>
                  <p className="text-white/60 text-sm">New suggestions every day aligned with cosmic energies</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default DressingStylerPage;
