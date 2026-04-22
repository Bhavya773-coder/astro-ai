import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppData } from '../state/AppDataContext';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import { Shirt, ChevronRight } from 'lucide-react';
import {
  DailyDecisionEngine,
  CosmicStreak,
  LiveSituation
} from './dashboard';
import FeatureTour from './FeatureTour';
import FeatureAnnouncement from './FeatureAnnouncement';
import toast from 'react-hot-toast';
import AutoResizeTextarea from './AutoResizeTextarea';
import NotificationPrompt from './NotificationPrompt';

interface Trait {
  icon: string;
  text: string;
  type: 'positive' | 'warning' | 'neutral';
}

interface DailyAction {
  do: string[];
  avoid: string[];
  luck_window: string;
}

interface HoroscopeData {
  zodiac: string;
  date: string;
  horoscope: string;
  insights: string;
  reason: string;
  actions: string;
  // NEW fields from PRD
  energy_label?: string;
  traits?: Trait[];
  prediction?: string;
  lucky_moment?: {
    color: string;
    number: number;
    power_hour: string;
    avoid: string;
  };
  daily_actions?: {
    work: DailyAction;
    love: DailyAction;
    mind: DailyAction;
    money: DailyAction;
  };
}

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { insightStatus } = useAppData();
  const { user } = useAuth();
  const insightsGenerated = Boolean(insightStatus?.insights_generated);

  const [profileData, setProfileData] = useState<any>(null);
  const [birthChartData, setBirthChartData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Simple question input for chat navigation
  const [questionInput, setQuestionInput] = useState('');

  // Feature tour state
  const [showFeatureTour, setShowFeatureTour] = useState(false);

  // NEW: Feature announcement popup (shows once for new dashboard)
  const [showFeatureAnnouncement, setShowFeatureAnnouncement] = useState(false);

  // NEW: Dashboard state from PRD
  // Section 2: Focus selection
  const [selectedFocus, setSelectedFocus] = useState<'work' | 'love' | 'mind' | 'money' | null>(() => {
    return localStorage.getItem(`daily_selected_focus_${user?.id}`) as any || null;
  });

  // Section 3: Action output reaction
  const [actionReaction, setActionReaction] = useState<'accurate' | 'not_me' | null>(() => {
    return localStorage.getItem(`daily_action_reaction_${user?.id}`) as any || null;
  });

  // Section 4: Prediction reaction
  const [predictionReaction, setPredictionReaction] = useState<'accurate' | 'not_me' | null>(() => {
    return localStorage.getItem(`daily_prediction_reaction_${user?.id}`) as any || null;
  });

  // Element B: Live Situation Mode modal
  const [showSituationMode, setShowSituationMode] = useState(false);

  // Element A: Cosmic Streak
  const [streak, setStreak] = useState(0);
  const [showFocusWarning] = useState(false);

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

  // Check if user is first-time after insights generated
  useEffect(() => {
    if (insightsGenerated) {
      const hasSeenTour = localStorage.getItem('astroai-feature-tour-seen');
      if (!hasSeenTour) {
        // Small delay to let the dashboard load first
        const timer = setTimeout(() => {
          setShowFeatureTour(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [insightsGenerated]);

  // Show feature announcement once for dashboard redesign
  useEffect(() => {
    if (!user?.id) return;

    const announcementKey = `astroai_dashboard_v2_seen_${user.id}`;
    const hasSeenAnnouncement = localStorage.getItem(announcementKey);

    if (!hasSeenAnnouncement) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowFeatureAnnouncement(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Handle closing the announcement
  const handleCloseAnnouncement = () => {
    if (user?.id) {
      const announcementKey = `astroai_dashboard_v2_seen_${user.id}`;
      localStorage.setItem(announcementKey, 'true');
    }
    setShowFeatureAnnouncement(false);
  };

  // Element A: Cosmic Streak tracking
  useEffect(() => {
    if (!user?.id) return;

    const streakKey = `astroai_streak_${user.id}`;
    const saved = localStorage.getItem(streakKey);
    const today = new Date().toISOString().split('T')[0];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastCheck = parsed.last_check;

        if (lastCheck === today) {
          // Already checked today, keep current streak
          setStreak(parsed.count);
        } else if (lastCheck === getYesterday()) {
          // Checked yesterday, increment streak
          const newCount = parsed.count + 1;
          setStreak(newCount);
          localStorage.setItem(streakKey, JSON.stringify({ count: newCount, last_check: today }));
        } else {
          // Missed a day, reset to 1
          setStreak(1);
          localStorage.setItem(streakKey, JSON.stringify({ count: 1, last_check: today }));
        }
      } catch {
        setStreak(1);
        localStorage.setItem(streakKey, JSON.stringify({ count: 1, last_check: today }));
      }
    } else {
      // First visit
      setStreak(1);
      localStorage.setItem(streakKey, JSON.stringify({ count: 1, last_check: today }));
    }
  }, [user?.id]);

  // Helper to get yesterday's date string
  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

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

  return (
    <CosmicBackground>
      <FeatureTour isOpen={showFeatureTour} onClose={() => setShowFeatureTour(false)} />

      {/* Feature Announcement Popup - Shows Once */}
      <FeatureAnnouncement
        isOpen={showFeatureAnnouncement}
        onClose={handleCloseAnnouncement}
      />

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16">

              {/* GREETING with Streak */}
              <div className="mb-20 animate-fade-in relative">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 blur-[100px] pointer-events-none" />
                <div className="flex justify-center mb-8 relative">
                  <img src="/favicon.png" alt="Astro AI" className="w-28 h-28 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <p className="text-fuchsia-400/80 text-[10px] uppercase tracking-[0.2em] font-medium">{getGreeting()}</p>
                  <CosmicStreak streak={streak} />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white text-center mb-12">
                  <GradientText>Welcome, {getFirstName()}</GradientText>
                </h2>
              </div>
              
              {/* NEW: Daily Decision Engine */}
              {userZodiacSign && (
                <DailyDecisionEngine 
                  zodiac={userZodiacSign} 
                  streak={streak}
                />
              )}

              {/* StyleForecaster Feature Card */}
              <button
                onClick={() => navigate('/style-forecaster')}
                className="w-full text-left mb-8"
              >
                <GlassCard className="p-6 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-fuchsia-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                      <Shirt className="w-7 h-7 text-fuchsia-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">StyleForecaster</h3>
                      <p className="text-white/70 text-sm">Get AI-powered outfit suggestions based on your astrology and numerology</p>
                    </div>
                    <div className="text-fuchsia-400">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </GlassCard>
              </button>

              {/* Show Get Started only if user hasn't completed profile (no zodiac sign) */}
              {user && !userZodiacSign && !profileLoading && (
                <GlassCard className="p-8 text-center mb-8 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <h2 className="font-display text-2xl font-bold text-white mb-4">
                    <GradientText>Begin Your Cosmic Journey</GradientText>
                  </h2>
                  <p className="text-white/70 mb-6">Complete your profile to unlock personalized insights</p>
                  <button
                    onClick={() => navigate('/onboarding/step-1')}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white font-semibold py-3 px-6 rounded-cosmic hover:scale-105 transition-transform"
                  >
                    Get Started
                  </button>
                </GlassCard>
              )}
            </div>
          </div>

          {/* FLOATING CHAT INPUT - ChatGPT Style */}
          <form
            onSubmit={handleAskQuestion}
            className="w-full px-4 py-6 md:py-8"
          >
            <div className="max-w-3xl mx-auto relative flex items-end">
              <AutoResizeTextarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (questionInput.trim()) {
                      handleAskQuestion(e as unknown as React.FormEvent);
                    }
                  }
                }}
                placeholder="Question your oracle here"
                maxRows={6}
                className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20"
              />
              <button
                type="submit"
                disabled={!questionInput.trim()}
                className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:opacity-50 text-purple-900 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg border-2 border-purple-300"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white/30 text-xs mt-2">AstroAI can make mistakes. Consider checking important information.</p>
          </form>
        </div>
      </div>

      {/* ELEMENT B — Live Situation Mode (Floating) */}
      <LiveSituation
        isOpen={showSituationMode}
        onClose={() => setShowSituationMode(false)}
        onSelectSituation={(situation) => {
          setShowSituationMode(false);
          createDashboardChatAndNavigate(situation);
        }}
      />

      {/* Live Situation Floating Button (when modal is closed) */}
      <NotificationPrompt />
    </CosmicBackground>
  );
}

export default MainPage;
