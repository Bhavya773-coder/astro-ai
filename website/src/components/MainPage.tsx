import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppData } from '../state/AppDataContext';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import { Shirt, ChevronRight, Star } from 'lucide-react';

interface HoroscopeData {
  zodiac: string;
  date: string;
  horoscope: string;
  insights: string;
  reason: string;
  actions: string;
}

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { insightStatus } = useAppData();
  const { user } = useAuth();
  const insightsGenerated = Boolean(insightStatus?.insights_generated);

  const [profileData, setProfileData] = useState<any>(null);
  const [birthChartData, setBirthChartData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Horoscope state
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHoroscope, setShowHoroscope] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Simple question input for chat navigation
  const [questionInput, setQuestionInput] = useState('');

  // Get user's zodiac sign from available data
  const getUserZodiacSign = (): string | null => {
    if (birthChartData?.sunSign) return birthChartData.sunSign;
    if (birthChartData?.chart_data?.sun_sign) return birthChartData.chart_data.sun_sign;
    if (birthChartData?.sun_sign) return birthChartData.sun_sign;
    if (profileData?.birth_chart_data?.sun_sign) return profileData.birth_chart_data.sun_sign;
    if (profileData?.sun_sign) return profileData.sun_sign;
    return null;
  };

  const userZodiacSign = getUserZodiacSign();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [profileRes, birthChartRes] = await Promise.all([
          apiFetch('/api/profile'),
          apiFetch('/api/birth-chart')
        ]);

        if (profileRes?.success) setProfileData(profileRes.data);
        if (birthChartRes?.success) setBirthChartData(birthChartRes.data);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Load saved horoscope
  useEffect(() => {
    const saved = localStorage.getItem('horoscopeData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHoroscope(parsed);
        setShowHoroscope(true);
      } catch {
        localStorage.removeItem('horoscopeData');
      }
    }
  }, []);

  // Handle question submission - create new dashboard chat and navigate
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    
    await createDashboardChatAndNavigate(questionInput.trim());
  };

  // Create a dashboard chat with incrementing name and navigate
  const createDashboardChatAndNavigate = async (message: string) => {
    try {
      // Get existing chats to count dashboard chats
      const res = await apiFetch('/api/ai-chat/list');
      let dashboardChatNumber = 1;
      
      if (res?.success && Array.isArray(res?.data)) {
        // Count existing dashboard chats
        const dashboardChats = res.data.filter((chat: any) => 
          chat.title?.startsWith('Dashboard Chat')
        );
        dashboardChatNumber = dashboardChats.length + 1;
      }
      
      // Create new dashboard chat
      const createRes = await apiFetch('/api/ai-chat/create', {
        method: 'POST',
        body: JSON.stringify({ title: `Dashboard Chat ${dashboardChatNumber}` })
      });
      
      if (createRes?.success && createRes?.data) {
        const newChat = createRes.data;
        // Navigate to the new chat with the message
        navigate(`/ai-chat?chatId=${newChat._id}`, { 
          state: { initialMessage: message }
        });
      } else {
        // Fallback: navigate without creating chat
        navigate('/ai-chat', { state: { initialMessage: message } });
      }
    } catch (err) {
      console.error('Failed to create dashboard chat:', err);
      // Fallback: navigate without creating chat
      navigate('/ai-chat', { state: { initialMessage: message } });
    }
  };

  // Horoscope functions
  const handleGenerateHoroscope = async (attempt = 0) => {
    const zodiacSign = getUserZodiacSign();

    if (!zodiacSign) {
      setError('Unable to determine your zodiac sign. Please complete your profile first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setRetryCount(attempt);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await apiFetch('/api/horoscope', {
        method: 'POST',
        body: JSON.stringify({ zodiac: zodiacSign }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to generate horoscope');
      }

      const horoscopeData: HoroscopeData = {
        zodiac: response.data.zodiac,
        date: response.data.date,
        horoscope: response.data.horoscope,
        insights: response.data.insights,
        reason: response.data.reason,
        actions: response.data.actions
      };

      localStorage.setItem('horoscopeData', JSON.stringify(horoscopeData));
      setHoroscope(horoscopeData);
      setShowHoroscope(true);
      setRetryCount(0);

    } catch (error: any) {
      console.error('Horoscope generation failed:', error);
      
      if (attempt < 2 && (error?.message?.includes('timeout') || error?.message?.includes('network') || !error?.message)) {
        console.log(`Retrying... attempt ${attempt + 1}`);
        setTimeout(() => handleGenerateHoroscope(attempt + 1), 1000 * (attempt + 1));
        return;
      }

      const errorMessage = error?.message || 'Failed to generate horoscope. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setError('');
    handleGenerateHoroscope(0);
  };

  // Helper functions
  const getFirstName = (): string => {
    if (profileData?.full_name) {
      return profileData.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'there';
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-20 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

            {/* GREETING */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <img src="/favicon.png" alt="Astro AI" className="w-24 h-24" />
              </div>
              <p className="text-cosmic-cyan text-sm mb-1">{getGreeting()}</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                <GradientText>Welcome, {getFirstName()}</GradientText>
              </h2>
            </div>

            {/* PERSONALIZED HOROSCOPE SECTION */}
            <GlassCard className="mb-8 p-6 md:p-8" glow="purple">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cosmic-purple to-cosmic-pink flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-lg md:text-xl font-bold text-white">Personalized Horoscope</h2>
                  <p className="text-white/60 text-xs">Get your daily cosmic guidance</p>
                </div>
              </div>

              {!showHoroscope ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cosmic-purple/20 flex items-center justify-center">
                      <span className="text-cosmic-purple text-lg">☉</span>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Your Zodiac Sign</p>
                      {profileLoading ? (
                        <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                      ) : userZodiacSign ? (
                        <p className="text-white font-semibold">{userZodiacSign}</p>
                      ) : (
                        <p className="text-amber-400 text-sm">Complete profile to detect sign</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateHoroscope(0)}
                    disabled={isGenerating || !userZodiacSign || profileLoading}
                    className="w-full md:w-auto bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold py-3 px-8 rounded-cosmic transition-all duration-300 shadow-neon-pink hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>Consulting the Stars{retryCount > 0 ? ` (retry ${retryCount})` : ''}...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate Horoscope</span>
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-cosmic">
                      <p className="text-red-400 text-sm">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="text-cosmic-cyan text-xs mt-2 hover:underline"
                      >
                        Click to retry
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{horoscope?.zodiac?.charAt(0)}</span>
                      <div>
                        <h3 className="text-white font-semibold">{horoscope?.zodiac}</h3>
                        <p className="text-white/60 text-sm">{horoscope?.date || today}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHoroscope(false)}
                      className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate
                    </button>
                  </div>

                  {isGenerating ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-24" />
                        <div className="h-4 bg-white/10 rounded w-full" />
                        <div className="h-4 bg-white/10 rounded w-11/12" />
                        <div className="h-4 bg-white/10 rounded w-4/5" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-20" />
                          <div className="h-3 bg-white/10 rounded w-full" />
                          <div className="h-3 bg-white/10 rounded w-4/5" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-20" />
                          <div className="h-3 bg-white/10 rounded w-full" />
                          <div className="h-3 bg-white/10 rounded w-4/5" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-20" />
                          <div className="h-3 bg-white/10 rounded w-full" />
                          <div className="h-3 bg-white/10 rounded w-4/5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="glass-card p-6 bg-white/5 border-white/10">
                        <h4 className="text-cosmic-pink font-semibold text-sm uppercase tracking-wide mb-3">Daily Horoscope</h4>
                        <p className="text-white/90 text-base leading-relaxed">{horoscope?.horoscope}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-5 bg-cosmic-cyan/5 border-cosmic-cyan/20">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-cosmic-cyan/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-cosmic-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-cosmic-cyan font-semibold text-sm">Insights</h4>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{horoscope?.insights}</p>
                        </div>

                        <div className="glass-card p-5 bg-cosmic-purple/5 border-cosmic-purple/20">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-cosmic-purple/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-cosmic-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-cosmic-purple font-semibold text-sm">Reason</h4>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{horoscope?.reason}</p>
                        </div>

                        <div className="glass-card p-5 bg-cosmic-gold/5 border-cosmic-gold/20">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-cosmic-gold/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-cosmic-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </div>
                            <h4 className="text-cosmic-gold font-semibold text-sm">Actions</h4>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{horoscope?.actions}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* SIMPLE CHAT INPUT - Sticky at bottom like ChatGPT */}
            {/* <form onSubmit={handleAskQuestion} className="sticky bottom-4 z-50">
              <div className="flex items-center gap-3 p-4 glass-card bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-cyan to-cosmic-purple flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="Ask AstroAI anything..."
                    className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!questionInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white rounded-xl hover:from-cosmic-purple/80 hover:to-cosmic-pink/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span className="hidden sm:inline text-sm">Ask</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form> */}

            {/* Suggested Questions */}
            <div className="mb-8">
              <p className="text-white/60 text-sm mb-4 text-center">Try asking:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "What does my birth chart say about my career?",
                  "Tell me about my numerology life path",
                  "What are my strengths based on my zodiac sign?",
                  "How can I improve my relationships?",
                  "What should I focus on this month?",
                  "Explain my moon sign influence"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => createDashboardChatAndNavigate(question)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/80 text-sm hover:bg-white/10 hover:border-cosmic-cyan/30 transition-all duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Dressing Styler Feature Card */}
            <button
              onClick={() => navigate('/dressing-styler')}
              className="w-full text-left mb-8"
            >
              <GlassCard className="p-6 hover:border-pink-400/50 transition-all" glow="pink">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shirt className="w-7 h-7 text-pink-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Personal Dressing Styler</h3>
                    <p className="text-white/70 text-sm">Get AI-powered outfit suggestions based on your astrology and numerology</p>
                  </div>
                  <div className="text-pink-400">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </GlassCard>
            </button>

            {!insightsGenerated && (
              <GlassCard className="p-8 text-center mb-8" glow="purple">
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  <GradientText>Begin Your Cosmic Journey</GradientText>
                </h2>
                <p className="text-white/70 mb-6">Complete your profile to unlock personalized insights</p>
                <button
                  onClick={() => navigate('/onboarding/step-1')}
                  className="bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold py-3 px-6 rounded-cosmic hover:scale-105 transition-transform"
                >
                  Get Started
                </button>
              </GlassCard>
            )}
          </div>
        </div>

        {/* FLOATING CHAT INPUT - GPT Style */}
        <div className="p-4 md:p-8 w-full bg-transparent pb-6">
          <div className="max-w-3xl mx-auto w-full relative">
            <form onSubmit={handleAskQuestion} className="w-full relative flex items-center">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask AstroAI anything..."
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full pl-6 pr-14 py-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all shadow-2xl shadow-black/50"
              />
              <button
                type="submit"
                disabled={!questionInput.trim()}
                className="absolute right-2.5 p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </CosmicBackground>
);
}

export default MainPage;
