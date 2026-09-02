import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import {
  Compass,
  Sparkles,
  Calendar,
  Hand,
  Coffee,
  User,
  Layers,
  Shirt,
  BarChart3,
  Hash,
  MessageSquare,
  ArrowRight,
  Star,
  Coins
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface ServiceItem {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
  credits?: number;
}

const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const specials = [
    { key: 'vastu-consultant', title: 'Vastu Consultant', desc: 'Upload a 2D floor plan for sacred spatial guidance and dosha remedies', to: '/vastu-consultant', icon: <Compass className="w-6 h-6" />, gradient: 'from-amber-500 to-orange-600' },
    { key: 'cosmic-8-ball', title: 'Astrology 8-Ball', desc: 'Ask any yes/no dilemma to the cosmic oracle sphere', to: '/cosmic-8-ball', icon: <Sparkles className="w-6 h-6" />, gradient: 'from-violet-600 to-fuchsia-600' },
    { key: 'astro-calendar', title: 'Astro Calendar', desc: 'Sync lunar transits, Rahu Kaal, and Auspicious Muhurtas', to: '/astro-calendar', icon: <Calendar className="w-6 h-6" />, gradient: 'from-sky-500 to-indigo-600' },
    { key: 'tarot-reading', title: 'Tarot Arcana', desc: 'Draw sacred archetypes to illuminate present energies', to: '/tarot-reading', icon: <Layers className="w-6 h-6" />, gradient: 'from-rose-500 to-purple-600' },
  ];

  const todayIndex = new Date().getDate() % specials.length;
  const todaySpecial = specials[todayIndex];

  const categories: { name: string; description: string; items: ServiceItem[] }[] = [
    {
      name: 'Daily Guidance & Timing',
      description: 'Align your daily choices with planetary transits and favorable windows',
      items: [
        {
          title: 'Astro Calendar',
          description: 'Lunar phases, Muhurta windows, Rahu Kaal, and transit alerts',
          to: '/astro-calendar',
          icon: <Calendar className="w-6 h-6 text-sky-400" />,
          gradient: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30',
          badge: 'Daily Timing'
        },
        {
          title: 'Cosmic 8-Ball',
          description: 'Instant yes/no guidance from the celestial oracle',
          to: '/cosmic-8-ball',
          icon: <Sparkles className="w-6 h-6 text-fuchsia-400" />,
          gradient: 'from-violet-500/20 to-fuchsia-500/20 border-fuchsia-500/30',
          badge: 'Instant'
        },
        {
          title: 'Daily Decision Engine',
          description: 'Micro-timing and personalized daily astrological weather',
          to: '/dashboard',
          icon: <Star className="w-6 h-6 text-amber-400" />,
          gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
          badge: 'Live Status'
        }
      ]
    },
    {
      name: 'AI Vision Readers',
      description: 'Upload photos to reveal hidden patterns, body marks, and spatial harmony',
      items: [
        {
          title: 'Vastu Consultant',
          description: 'Upload 2D floor plans for room orientation & dosha remedies',
          to: '/vastu-consultant',
          icon: <Compass className="w-6 h-6 text-amber-400" />,
          gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
          badge: 'New AI',
          credits: 50
        },
        {
          title: 'Palm Reading',
          description: 'Analyze heart, head, life, and fate lines via high-res palm scan',
          to: '/palm-reading',
          icon: <Hand className="w-6 h-6 text-violet-400" />,
          gradient: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
          credits: 20
        },
        {
          title: 'Face Physiognomy',
          description: 'Character traits and destiny reflected in facial structure',
          to: '/face-reading',
          icon: <User className="w-6 h-6 text-rose-400" />,
          gradient: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
          credits: 20
        },
        {
          title: 'Coffee Cup Reading',
          description: 'Sediment symbol interpretation and intuitive fortune forecasts',
          to: '/coffee-reading',
          icon: <Coffee className="w-6 h-6 text-amber-600" />,
          gradient: 'from-amber-700/20 to-amber-900/20 border-amber-600/30',
          credits: 20
        },
        {
          title: 'Style Forecaster',
          description: 'Cosmic colors, planetary dressing vibes, and outfit scores',
          to: '/style-forecaster',
          icon: <Shirt className="w-6 h-6 text-pink-400" />,
          gradient: 'from-pink-500/20 to-fuchsia-500/20 border-pink-500/30',
          credits: 30
        }
      ]
    },
    {
      name: 'Sacred Mathematics & Calculations',
      description: 'High-precision Swiss Ephemeris Vedic calculations and Pythagorean matrices',
      items: [
        {
          title: 'Vedic Birth Chart (Kundli)',
          description: 'Sidereal planetary longitudes, Bhavas, Yogas, and Vimshottari Dasha',
          to: '/birth-chart',
          icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
          gradient: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30'
        },
        {
          title: 'Pythagorean Numerology',
          description: 'Life Path, Expression, Soul Urge, and Personal Year cycles',
          to: '/numerology',
          icon: <Hash className="w-6 h-6 text-emerald-400" />,
          gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
        },
        {
          title: 'Compatibility Reports',
          description: 'Deep Synastry, Ashtakoota score, and long-term relationship harmony',
          to: '/reports',
          icon: <Layers className="w-6 h-6 text-violet-400" />,
          gradient: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30'
        }
      ]
    },
    {
      name: 'Direct Consultations',
      description: 'Conversational spiritual advice powered by certified Jyotish intelligence',
      items: [
        {
          title: 'Hope AI Astrologer',
          description: 'Deep conversational astrology with lifetime memory & chart context',
          to: '/ai-chat',
          icon: <MessageSquare className="w-6 h-6 text-fuchsia-400" />,
          gradient: 'from-fuchsia-500/20 to-violet-500/20 border-fuchsia-500/30'
        },
        {
          title: 'Tarot Spread Reading',
          description: '3-card past, present, and future archetypal spreads',
          to: '/tarot-reading',
          icon: <Layers className="w-6 h-6 text-purple-400" />,
          gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30'
        }
      ]
    }
  ];

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16 space-y-10">
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3 font-display">
                  <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-fuchsia-400" />
                  Explore AstroAI
                </h1>
                {user?.is_believer && (
                  <div className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/50 text-[11px] font-bold text-violet-300 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    Complete Suite of Sacred Tools
                  </div>
                )}
                <p className="text-white/60 text-lg max-w-2xl text-center">
                  Discover all astrological calculators, AI vision consultants, sacred timing engines, and divination tools in one unified directory.
                </p>
              </div>

              {/* Featured Daily Spotlight Card */}
              <div
                onClick={() => navigate(todaySpecial.to)}
                className={`relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-r ${todaySpecial.gradient} text-white cursor-pointer shadow-2xl hover:scale-[1.01] transition-transform duration-300 border border-white/20`}
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-md border border-white/20">
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Daily Featured Tool
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold font-display">{todaySpecial.title}</h2>
                    <p className="text-sm text-white/90 leading-relaxed">{todaySpecial.desc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-5 py-3 rounded-lg bg-white text-slate-950 font-semibold text-sm flex items-center gap-2 shadow-lg">
                      Launch Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories Directory */}
              <div className="space-y-10">
                {categories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-white/60 mt-0.5">{cat.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cat.items.map((item, iIdx) => (
                        <Link
                          key={iIdx}
                          to={item.to}
                          className="group"
                        >
                          <GlassCard className="p-6 h-full flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] border-white/10 hover:border-fuchsia-500/50">
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-white shadow-lg group-hover:shadow-xl transition-shadow">
                                  {item.icon}
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.credits && (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                                      <Coins className="w-3.5 h-3.5" /> {item.credits}
                                    </span>
                                  )}
                                  {item.badge && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 bg-fuchsia-500/20 border border-fuchsia-500/40 px-2.5 py-0.5 rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h4 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition">
                                {item.title}
                              </h4>
                              <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white/60 group-hover:text-fuchsia-300 transition">
                              <span>Launch Tool</span>
                              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </GlassCard>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default ExplorePage;
