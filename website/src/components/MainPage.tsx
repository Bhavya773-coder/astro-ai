import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import AppNavbar from './AppNavbar';
import HoroscopeWidget from './HoroscopeWidget';
import { useAppData } from '../state/AppDataContext';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner, CosmicButton } from './CosmicUI';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { insightStatus, isInsightLoading } = useAppData();
  const insightsGenerated = Boolean(insightStatus?.insights_generated);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  return (
    <CosmicBackground>
      <AppNavbar />
      
      <div className="pt-16"> {/* Add padding for sticky navbar */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Your <GradientText>Cosmic</GradientText> Dashboard
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Track your growth, refine your profile, and generate astrology & numerology insights.
          </p>
          
          {isInsightLoading && (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" className="text-cosmic-pink" />
              <span className="text-white/60">Loading your cosmic profile...</span>
            </div>
          )}
          
          {!isInsightLoading && !insightsGenerated && (
            <button 
              onClick={handleGettingStarted}
              className="bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold py-3 px-8 rounded-cosmic transition-all duration-300 shadow-neon-pink hover:scale-105"
            >
              Getting Started
            </button>
          )}
        </div>

        {insightsGenerated && (
          <>
            {/* Welcome Section with Static Content */}
            <GlassCard className="mb-8 p-8" glow="purple">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                    <GradientText>Welcome to Your Cosmic Dashboard</GradientText>
                  </h2>
                  <p className="text-white/70 text-base leading-relaxed mb-4">
                    Your personal portal to the stars. Here, ancient astrological wisdom meets modern AI to provide you with personalized cosmic insights, daily guidance, and transformative self-discovery tools.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cosmic-cyan/10 rounded-full">
                      <span className="text-cosmic-cyan text-sm">☉</span>
                      <span className="text-white/80 text-xs">Birth Charts</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cosmic-pink/10 rounded-full">
                      <span className="text-cosmic-pink text-sm">🔢</span>
                      <span className="text-white/80 text-xs">Numerology</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-pink/20 rounded-cosmic blur-xl"></div>
                    <div className="relative glass-card p-6 text-center">
                      <div className="text-4xl mb-3">🔮</div>
                      <p className="text-white/80 text-sm italic">
                        "The stars incline, they do not compel. Your cosmic journey begins with self-awareness."
                      </p>
                      <p className="text-white/50 text-xs mt-2">— Ancient Astrological Wisdom</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Horoscope Widget */}
            <HoroscopeWidget 
              birthDate={insightStatus?.date_of_birth}
              className="mb-8"
            />

            {/* Service Cards - Enhanced Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button 
                onClick={() => navigate('/birth-chart')}
                className="group relative overflow-hidden glass-card p-6 text-left hover:border-cosmic-pink/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-cosmic-pink/20 flex items-center justify-center group-hover:bg-cosmic-pink/30 group-hover:scale-110 transition-all">
                      <span className="text-cosmic-pink text-2xl">☉</span>
                    </div>
                    <span className="px-2 py-1 bg-cosmic-pink/20 text-cosmic-pink text-xs font-medium rounded-full">Featured</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cosmic-pink transition-colors">Birth Chart</h3>
                  <p className="text-white/70 text-sm mb-3">Complete astrological analysis revealing your cosmic blueprint</p>
                  <div className="flex items-center text-cosmic-pink text-xs font-medium">
                    <span>Explore Now</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/numerology')}
                className="group relative overflow-hidden glass-card p-6 text-left hover:border-cosmic-cyan/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-cosmic-cyan/20 flex items-center justify-center group-hover:bg-cosmic-cyan/30 group-hover:scale-110 transition-all">
                      <span className="text-cosmic-cyan text-2xl">🔢</span>
                    </div>
                    <span className="px-2 py-1 bg-cosmic-cyan/20 text-cosmic-cyan text-xs font-medium rounded-full">Popular</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cosmic-cyan transition-colors">Numerology</h3>
                  <p className="text-white/70 text-sm mb-3">Discover your life path and destiny numbers</p>
                  <div className="flex items-center text-cosmic-cyan text-xs font-medium">
                    <span>Calculate</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/reports')}
                className="group relative overflow-hidden glass-card p-6 text-left hover:border-cosmic-gold/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-cosmic-gold/20 flex items-center justify-center group-hover:bg-cosmic-gold/30 group-hover:scale-110 transition-all">
                      <span className="text-cosmic-gold text-xl">📊</span>
                    </div>
                    <span className="px-2 py-1 bg-cosmic-gold/20 text-cosmic-gold text-xs font-medium rounded-full">New</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cosmic-gold transition-colors">Reports</h3>
                  <p className="text-white/70 text-sm mb-3">Detailed compatibility and growth analysis</p>
                  <div className="flex items-center text-cosmic-gold text-xs font-medium">
                    <span>View Reports</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <div className="glass-card p-6 text-left opacity-75 cursor-not-allowed relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-1 bg-cosmic-purple/30 text-cosmic-purple text-xs rounded-bl-lg">Soon</div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-cosmic-purple/20 flex items-center justify-center">
                    <span className="text-cosmic-purple text-2xl">🔮</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tarot</h3>
                <p className="text-white/70 text-sm">Daily card readings and spiritual guidance</p>
              </div>
            </div>

            {/* About Astrology Section */}
            <GlassCard className="mb-8 p-6 md:p-8" glow="cyan">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="font-display text-xl font-bold text-white mb-4">
                    <GradientText>Understanding Your Cosmic Journey</GradientText>
                  </h3>
                  <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                    <p>
                      Astrology is an ancient practice that studies the movements and relative positions of celestial bodies 
                      as a means for divining information about human affairs and terrestrial events. Your birth chart, 
                      also known as a natal chart, is a snapshot of the sky at the exact moment you were born.
                    </p>
                    <p>
                      The <span className="text-cosmic-gold">Sun</span> represents your core identity and ego, the <span className="text-cosmic-cyan">Moon</span> governs your emotions 
                      and subconscious, and your <span className="text-cosmic-pink">Ascendant</span> (rising sign) shows how others perceive you. 
                      Together, these form the "big three" of astrology.
                    </p>
                    <p>
                      Numerology, the mystical study of numbers, reveals patterns in your life through your Life Path Number, 
                      Destiny Number, and Personal Year cycles. These numbers provide guidance for career choices, 
                      relationships, and personal growth.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-card p-4 border-l-2 border-cosmic-pink">
                    <h4 className="text-cosmic-pink font-semibold text-sm mb-1">Sun Signs</h4>
                    <p className="text-white/60 text-xs">Your zodiac identity based on birth date</p>
                  </div>
                  <div className="glass-card p-4 border-l-2 border-cosmic-cyan">
                    <h4 className="text-cosmic-cyan font-semibold text-sm mb-1">Moon Signs</h4>
                    <p className="text-white/60 text-xs">Your emotional nature and inner self</p>
                  </div>
                  <div className="glass-card p-4 border-l-2 border-cosmic-gold">
                    <h4 className="text-cosmic-gold font-semibold text-sm mb-1">Rising Signs</h4>
                    <p className="text-white/60 text-xs">Your outward personality and first impressions</p>
                  </div>
                  <div className="glass-card p-4 border-l-2 border-cosmic-purple">
                    <h4 className="text-cosmic-purple font-semibold text-sm mb-1">Life Path Numbers</h4>
                    <p className="text-white/60 text-xs">Your core purpose and journey in this lifetime</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Recent Activity - Enhanced
            <GlassCard className="p-6" glow="purple">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white">Recent Cosmic Activity</h3>
                <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">Last 7 Days</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: '☉', title: 'Birth Chart Analysis', description: 'Complete astrological profile generated', time: '2 hours ago', color: 'cosmic-pink' },
                  { icon: '🔢', title: 'Life Path Reading', description: 'Numerology insights revealed', time: '1 day ago', color: 'cosmic-cyan' },
                  { icon: '🔮', title: 'Daily Horoscope', description: 'Cosmic guidance received', time: '2 days ago', color: 'cosmic-purple' },
                  { icon: '📊', title: 'Growth Check-in', description: 'Personal progress tracked', time: '3 days ago', color: 'green' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-cosmic bg-white/5 hover:bg-white/10 transition-all group">
                    <div className={`w-12 h-12 bg-${activity.color}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className={`text-${activity.color} text-xl`}>{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{activity.title}</h4>
                        <span className="text-white/40 text-xs">•</span>
                        <span className="text-white/40 text-xs">{activity.time}</span>
                      </div>
                      <p className="text-white/60 text-sm">{activity.description}</p>
                    </div>
                    <div className="hidden sm:block">
                      <div className={`w-2 h-2 rounded-full bg-${activity.color}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard> */}
          </>
        )}
      </div>
      </div> {/* Close padding container */}
    </CosmicBackground>
  );
};

export default MainPage;
