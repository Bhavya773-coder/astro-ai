import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import {
  Compass,
  Sparkles,
  Calendar,
  Hand,
  Coffee,
  User,
  Layers,
  Shirt,
  HelpCircle,
  BarChart3,
  Hash,
  MessageSquare,
  ArrowRight,
  Star,
  Flame,
  ShieldAlert,
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
    { key: 'vastu-consultant', title: 'Vastu Consultant', desc: 'Upload a 2D floor plan for sacred spatial guidance', to: '/vastu-consultant', icon: <Compass className="w-6 h-6" />, gradient: 'from-amber-500 to-orange-600' },
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
    <div className="flex min-h-screen bg-slate-950 text-white selection:bg-fuchsia-500 selection:text-white">
      <CosmicBackground />
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-64 overflow-y-auto max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-300 w-fit mb-3">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Cosmic Services & Sacred Tools</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            <GradientText>Explore AstroAI</GradientText>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Discover all astrological calculators, AI vision consultants, sacred timing engines, and divination tools in one place.
          </p>
        </div>

        {/* Featured Daily Spotlight Card */}
        <div
          onClick={() => navigate(todaySpecial.to)}
          className={`relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r ${todaySpecial.gradient} text-white cursor-pointer shadow-2xl hover:scale-[1.01] transition-transform duration-300`}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-md border border-white/20">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Daily Featured Tool
              </span>
              <h2 className="text-2xl md:text-3xl font-black">{todaySpecial.title}</h2>
              <p className="text-sm text-white/90 leading-relaxed">{todaySpecial.desc}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-5 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg">
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
                <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item, iIdx) => (
                  <Link
                    key={iIdx}
                    to={item.to}
                    className={`group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border transition-all duration-200 flex flex-col justify-between hover:scale-[1.02] shadow-lg hover:shadow-violet-500/10 ${item.gradient}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:border-slate-700 transition">
                          {item.icon}
                        </div>

                        <div className="flex items-center gap-2">
                          {item.credits && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <Coins className="w-3 h-3" /> {item.credits}
                            </span>
                          )}
                          {item.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/30 px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-100 group-hover:text-white transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-fuchsia-300 transition">
                      <span>Open Tool</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;
