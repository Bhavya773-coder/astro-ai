import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { Target, Calendar, Telescope, Sparkles } from 'lucide-react';

interface NumerologyData {
  life_path: string;
  destiny: string;
  personal_year: string;
}

interface SharedData {
  user_name: string;
  numerology_data: NumerologyData;
  created_at: string;
}

const SharedNumerologyPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const loadSharedNumerology = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/shared-numerology/${shareId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load shared numerology');
      }

      const result = await res.json();
      
      if (result?.success) {
        setData(result.data);
      } else {
        setError(result?.message || 'Shared numerology not found');
      }
    } catch (err) {
      console.error('Error loading shared numerology:', err);
      setError('Failed to load shared numerology. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (shareId) {
      loadSharedNumerology();
    }
  }, [shareId, loadSharedNumerology]);

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveSlide((prev) => Math.min(coreSlides.length - 1, prev + 1));
    }
    if (isRightSwipe) {
      setActiveSlide((prev) => Math.max(0, prev - 1));
    }
  };

  // Helper functions for detailed number analysis (Enriched)
  const getLifePathStrength = (lifePath: string) => {
    const strengths: { [key: string]: string } = {
      '1': 'Natural leadership and independence',
      '2': 'Diplomacy and cooperation skills',
      '3': 'Creativity and self-expression',
      '4': 'Organization and practical skills',
      '5': 'Adaptability and freedom-loving nature',
      '6': 'Nurturing and responsibility',
      '7': 'Analytical and spiritual wisdom',
      '8': 'Ambition and material success',
      '9': 'Compassion and humanitarian spirit',
      '11': 'Intuitive and spiritual insight',
      '22': 'Visionary and manifesting abilities',
      '33': 'Healing and teaching gifts'
    };
    return strengths[lifePath] || 'Unique personal strengths';
  };

  const getLifePathChallenge = (lifePath: string) => {
    const challenges: { [key: string]: string } = {
      '1': 'Overcoming ego and learning cooperation',
      '2': 'Building self-confidence and setting boundaries',
      '3': 'Focusing energy and avoiding scattered interests',
      '4': 'Embracing change and avoiding rigidity',
      '5': 'Commitment and avoiding restlessness',
      '6': 'Self-care and avoiding over-responsibility',
      '7': 'Connecting with others and avoiding isolation',
      '8': 'Balancing material and spiritual concerns',
      '9': 'Learning to let go and forgive',
      '11': 'Managing anxiety and trusting intuition',
      '22': 'Avoiding overwhelm and staying practical',
      '33': 'Setting boundaries and avoiding martyrdom'
    };
    return challenges[lifePath] || 'Personal growth opportunities';
  };

  const getDestinyPurpose = (destiny: string) => {
    const purposes: { [key: string]: string } = {
      '1': 'To pioneer and lead new initiatives',
      '2': 'To bring harmony and cooperation',
      '3': 'To inspire and uplift others',
      '4': 'To build solid foundations',
      '5': 'To bring freedom and change',
      '6': 'To nurture and serve humanity',
      '7': 'To seek truth and wisdom',
      '8': 'To achieve material and spiritual success',
      '9': 'To complete humanitarian service',
      '11': 'To illuminate spiritual truths',
      '22': 'To build lasting structures',
      '33': 'To teach and heal humanity'
    };
    return purposes[destiny] || 'To fulfill your unique potential';
  };

  const getDestinyTalent = (destiny: string) => {
    const talents: { [key: string]: string } = {
      '1': 'Innovation and leadership abilities',
      '2': 'Diplomacy and peacemaking skills',
      '3': 'Communication and creative expression',
      '4': 'Organization and building capabilities',
      '5': 'Versatility and adaptability',
      '6': 'Teaching and nurturing gifts',
      '7': 'Analysis and spiritual insight',
      '8': 'Management and resource development',
      '9': 'Compassion and creative vision',
      '11': 'Intuition and spiritual guidance',
      '22': 'Visionary thinking and practical application',
      '33': 'Healing and inspirational teaching'
    };
    return talents[destiny] || 'Unique natural abilities';
  };

  const getPersonalYearTheme = (personalYear: string) => {
    const themes: { [key: string]: string } = {
      '1': 'New beginnings and independence',
      '2': 'Partnerships and cooperation',
      '3': 'Creativity and self-expression',
      '4': 'Hard work and foundation building',
      '5': 'Change and freedom',
      '6': 'Responsibility and harmony',
      '7': 'Spirituality and introspection',
      '8': 'Success and material achievement',
      '9': 'Completion and humanitarian service',
      '11': 'Spiritual awakening and intuition',
      '22': 'Master building and achievement',
      '33': 'Universal love and service'
    };
    return themes[personalYear] || 'Personal growth and development';
  };

  const getPersonalYearAdvice = (personalYear: string) => {
    const advice: { [key: string]: string } = {
      '1': 'Take initiative and be bold in your decisions',
      '2': 'Practice patience and seek cooperation',
      '3': 'Express yourself creatively and socially',
      '4': 'Stay disciplined and focus on long-term goals',
      '5': 'Embrace change and avoid routine',
      '6': 'Balance responsibility with self-care',
      '7': 'Trust your intuition and seek wisdom',
      '8': 'Be confident and pursue success',
      '9': 'Practice forgiveness and serve others',
      '11': 'Pay attention to dreams and inner guidance',
      '22': 'Think big but stay practical',
      '33': 'Focus on healing and uplifting others'
    };
    return advice[personalYear] || 'Stay true to your authentic self';
  };

  const coreSlides = data?.numerology_data ? [
    {
      title: 'Life Path',
      number: data.numerology_data.life_path,
      subtitle: 'Your Core Journey',
      description: 'This number represents the path you\'re destined to walk in this lifetime. It reveals your natural talents, the lessons you\'re here to learn, and the challenges you\'ll face.',
      points: [
        'Your innate abilities and strengths',
        'Life lessons and challenges',
        'Natural career inclinations',
        'Relationship patterns'
      ],
      color: 'violet',
      bgColor: 'from-violet-600/20 to-purple-600/20',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-300',
      icon: <Telescope className="w-5 h-5 text-violet-400" />
    },
    {
      title: 'Destiny Number',
      number: data.numerology_data.destiny,
      subtitle: 'Your Ultimate Purpose',
      description: 'Also known as the Expression Number, this reveals your life\'s purpose, your mission, and the opportunities that will come your way to fulfill your potential.',
      points: [
        'Your life\'s mission and purpose',
        'Career and success potential',
        'How others perceive you',
        'Your unique contribution to the world'
      ],
      color: 'purple',
      bgColor: 'from-purple-600/20 to-fuchsia-600/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-300',
      icon: <Target className="w-5 h-5 text-purple-400" />
    },
    {
      title: 'Personal Year',
      number: data.numerology_data.personal_year,
      subtitle: 'Current Year Energy',
      description: 'This number changes yearly and shows the themes, opportunities, and challenges you\'ll experience during this specific year cycle.',
      points: [
        'Best timing for important decisions',
        'Current year\'s main themes',
        'Opportunities to watch for',
        'Areas requiring focus'
      ],
      color: 'fuchsia',
      bgColor: 'from-fuchsia-600/20 to-pink-600/20',
      borderColor: 'border-fuchsia-500/30',
      textColor: 'text-fuchsia-300',
      icon: <Calendar className="w-5 h-5 text-fuchsia-400" />
    }
  ] : [];

  if (loading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
        </div>
      </CosmicBackground>
    );
  }

  if (error || !data) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Numerology Not Found</h2>
            <p className="text-white/70 mb-6">{error || 'This shared numerology reading is no longer available.'}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Go to Astro AI
            </button>
          </GlassCard>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <div 
        className="min-h-screen py-8 px-4 custom-scrollbar overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Astro AI" className="w-10 h-10 rounded-lg shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest">ASTRO AI</h1>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Cosmic Intelligence</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            Back to App
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-violet-400 text-[10px] font-bold uppercase tracking-[0.3em]">Cosmic Reading Shared</span>
             </div>
             <h1 className="text-4xl md:text-6xl font-black font-display mb-4">
                <GradientText>Blueprint for {data.user_name}</GradientText>
             </h1>
             <p className="text-white/50 text-lg max-w-xl mx-auto">
                Explore the numerical vibrations and life path energies shared from Astro AI.
             </p>
          </div>

          <div className="space-y-16 animate-in fade-in duration-1000">
            {/* Central Interactive Mandala */}
            <div className="relative w-full max-w-2xl mx-auto aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-fuchsia-500/5 to-transparent rounded-full blur-[120px] scale-150 animate-pulse" />
              
              <svg className="absolute inset-0 w-full h-full opacity-30 select-none pointer-events-none" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="mandala-grad-shared" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <g className="origin-center" style={{ transformOrigin: 'center', animation: 'spin 120s linear infinite' }}>
                  <circle cx="100" cy="100" r="90" stroke="url(#mandala-grad-shared)" strokeWidth="0.2" fill="none" />
                  <circle cx="100" cy="100" r="75" stroke="url(#mandala-grad-shared)" strokeWidth="0.1" fill="none" strokeDasharray="1,2" />
                  <path d="M100 10 L177.9 145 L22.1 145 Z" stroke="white" strokeWidth="0.1" fill="none" opacity="0.4" />
                  <path d="M100 190 L177.9 55 L22.1 55 Z" stroke="white" strokeWidth="0.1" fill="none" opacity="0.4" />
                </g>
              </svg>

              {/* Orbs */}
              {coreSlides.map((slide, idx) => {
                const angles = [-90, 30, 150];
                const isActive = activeSlide === idx;
                const angle = angles[idx];
                
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className="absolute group z-20 outline-none transition-all duration-700"
                    style={{
                      top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 38}%)`,
                      left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 38}%)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {isActive && (
                      <div className="absolute h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 w-[150%] origin-left -z-10" style={{ transform: `rotate(${angle + 180}deg)`, left: '50%', top: '50%' }} />
                    )}

                    <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border-2 transition-all duration-700 ${isActive ? `bg-white/10 ${slide.borderColor} scale-110 shadow-[0_0_50px_rgba(168,85,247,0.3)]` : 'bg-black/40 border-white/5 hover:border-white/20 hover:scale-105'}`}>
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${slide.bgColor} transition-opacity duration-700 ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`} />
                      <span className={`relative text-4xl sm:text-5xl font-black mb-1 font-display tracking-tighter ${isActive ? 'text-white' : 'text-white/40'}`}>{slide.number}</span>
                      <span className="relative text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/50">{slide.title}</span>
                    </div>
                  </button>
                );
              })}

              {/* Hint Popup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[180%] z-30 pointer-events-none">
                <div className="relative">
                  <div className="bg-fuchsia-600/20 backdrop-blur-xl border border-fuchsia-500/40 px-4 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-bounce text-center whitespace-nowrap">
                    Click on number to know more ✨
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-fuchsia-500/40 mx-auto mt-[-4px]" />
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse blur-sm" />
                  <Sparkles className="absolute w-8 h-8 text-white/20" style={{ animation: 'spin 10s linear infinite' }} />
                </div>
              </div>
            </div>

            {/* Insights Panel */}
            <div className="w-full">
              <GlassCard className="p-8 sm:p-12 relative overflow-hidden ring-1 ring-white/10" glow="purple">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                         {coreSlides[activeSlide]?.icon}
                         <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">{coreSlides[activeSlide]?.subtitle}</span>
                      </div>
                      <h2 className={`text-4xl sm:text-5xl font-black font-display ${coreSlides[activeSlide]?.textColor}`}>
                         {coreSlides[activeSlide]?.title} {coreSlides[activeSlide]?.number}
                      </h2>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3 space-y-8">
                      <div>
                         <h4 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">The Cosmic Vibration</h4>
                         <p className="text-white/80 text-xl leading-relaxed font-light">
                           {coreSlides[activeSlide]?.description}
                         </p>
                      </div>
                      
                      <div className="p-8 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            {coreSlides[activeSlide]?.icon}
                         </div>
                         <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-6">Strategic Focus</h4>
                         <ul className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
                           {coreSlides[activeSlide]?.points?.map((point: string, idx: number) => (
                             <li key={idx} className="flex items-start gap-4">
                               <div className={`mt-1 w-2 h-2 rounded-full ${coreSlides[activeSlide]?.textColor.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
                               <span className="text-white/70 text-base leading-snug">{point}</span>
                             </li>
                           ))}
                         </ul>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                       {activeSlide === 0 && (
                         <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                               <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Core Strength</p>
                               <p className="text-white/80">{getLifePathStrength(data.numerology_data.life_path)}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                               <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Primary Challenge</p>
                               <p className="text-white/80">{getLifePathChallenge(data.numerology_data.life_path)}</p>
                            </div>
                         </div>
                       )}
                       {activeSlide === 1 && (
                         <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                               <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Life Purpose</p>
                               <p className="text-white/80">{getDestinyPurpose(data.numerology_data.destiny)}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                               <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Hidden Talent</p>
                               <p className="text-white/80">{getDestinyTalent(data.numerology_data.destiny)}</p>
                            </div>
                         </div>
                       )}
                       {activeSlide === 2 && (
                         <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                               <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Year Theme</p>
                               <p className="text-white/80">{getPersonalYearTheme(data.numerology_data.personal_year)}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                               <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Best Advice</p>
                               <p className="text-white/80">{getPersonalYearAdvice(data.numerology_data.personal_year)}</p>
                            </div>
                         </div>
                       )}
                       
                       <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 text-center shadow-2xl">
                          <p className="text-white/40 text-sm italic mb-4">Ready to discover your own details?</p>
                          <button 
                            className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] transition-transform shadow-xl"
                            onClick={() => navigate('/signup')}
                          >
                             Unlock My Reading
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-20 pb-12 text-center">
            <p className="text-white/20 text-xs font-bold uppercase tracking-[0.5em]">Powered by Astro AI Intelligence</p>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedNumerologyPage;
