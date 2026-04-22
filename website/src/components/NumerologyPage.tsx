import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import Sidebar from './Sidebar';
import AstroNumerologyFlow from './AstroNumerologyFlow';
import toast from 'react-hot-toast';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { Sparkles, AlertTriangle, Target, Calendar, Crosshair, Share2 } from 'lucide-react';
import AutoResizeTextarea from './AutoResizeTextarea';

interface NumerologyData {
  life_path: string;
  destiny: string;
  personal_year: string;
}

const NumerologyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [numerology, setNumerology] = useState<NumerologyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');

  // First-time welcome popup state
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [welcomeSlide, setWelcomeSlide] = useState(0);

  // Core numbers carousel state (permanent display)
  const [coreSlide, setCoreSlide] = useState(0);

  // Share state
  const [isSharingNumerology, setIsSharingNumerology] = useState(false);

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
      setCoreSlide((prev) => Math.min(2, prev + 1));
    }
    if (isRightSwipe) {
      setCoreSlide((prev) => Math.max(0, prev - 1));
    }
  };

  // Create a dashboard chat and navigate
  const createDashboardChatAndNavigate = async (message: string) => {
    try {
      const res = await apiFetch('/api/ai-chat/list');
      let dashboardChatNumber = 1;

      if (res?.success && Array.isArray(res?.data)) {
        const dashboardChats = res.data.filter((chat: any) =>
          chat.title?.startsWith('Dashboard Chat')
        );
        dashboardChatNumber = dashboardChats.length + 1;
      }

      const createRes = await apiFetch('/api/ai-chat/create', {
        method: 'POST',
        body: JSON.stringify({ title: `Dashboard Chat ${dashboardChatNumber}` })
      });

      if (createRes?.success && createRes?.data) {
        const newChat = createRes.data;
        navigate(`/ai-chat?chatId=${newChat._id}`, {
          state: { initialMessage: message }
        });
      } else {
        navigate('/ai-chat', { state: { initialMessage: message } });
      }
    } catch (err) {
      console.error('Failed to create dashboard chat:', err);
      navigate('/ai-chat', { state: { initialMessage: message } });
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    await createDashboardChatAndNavigate(questionInput.trim());
  };

  // Fetch data on page load
  useEffect(() => {
    fetchNumerologyData();
  }, []);

  // Share numerology function
  const shareNumerology = async () => {
    if (!numerology) return;
    
    setIsSharingNumerology(true);
    try {
      // Get user profile for name
      const profileRes = await apiFetch('/api/profile');
      const userName = profileRes?.data?.full_name || 'Anonymous';
      
      const res = await apiFetch('/api/share/numerology', {
        method: 'POST',
        body: JSON.stringify({
          user_name: userName,
          numerology_data: {
            life_path: numerology.life_path,
            destiny: numerology.destiny,
            personal_year: numerology.personal_year
          }
        })
      });

      if (res?.success && res?.data?.shareUrl) {
        let finalUrl = res.data.shareUrl;
        // Temporary override for local testing
        if (window.location.hostname === 'localhost') {
          finalUrl = finalUrl.replace(/https?:\/\/[^/]+/, 'http://localhost:3000');
        }
        await navigator.clipboard.writeText(finalUrl);
        toast.success(`Link copied! (${window.location.hostname === 'localhost' ? 'Localhost' : 'Live'})`);
      } else {
        toast.error('Failed to share numerology');
      }
    } catch (err) {
      console.error('Error sharing numerology:', err);
      toast.error('Failed to share numerology');
    } finally {
      setIsSharingNumerology(false);
    }
  };

  // Main data fetch
  const fetchNumerologyData = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/numerology');

      if (response.success && response.numerology) {
        setNumerology(response.numerology);
        setError(null);
        // Show welcome popup only if user hasn't seen it before
        const hasSeen = localStorage.getItem('AstroAi4u-numerology-welcome-seen');
        if (!hasSeen) {
          setTimeout(() => setShowWelcomePopup(true), 400);
        }
      } else if (response.success && !response.numerology) {
        setNumerology(null);
        setError(null);
      } else {
        setError(response.message || 'Failed to load numerology data');
      }
    } catch (err: any) {
      console.error('Error fetching numerology:', err);
      setError(err.message || 'Failed to fetch numerology data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Helper functions for detailed number analysis
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

  // Core numbers carousel slides data
  const coreSlides = numerology ? [
    {
      title: 'Life Path',
      number: numerology.life_path,
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
      icon: <Crosshair className="w-5 h-5 text-violet-400" />
    },
    {
      title: 'Destiny Number',
      number: numerology.destiny,
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
      number: numerology.personal_year,
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

  return (
    <CosmicBackground>
      {/* =========== FIRST-TIME NUMEROLOGY WELCOME POPUP =========== */}
      {showWelcomePopup && numerology && (() => {
        const slides = [
          {
            label: 'Life Path Number',
            number: numerology.life_path,
            gradient: 'from-violet-600 to-purple-600',
            borderColor: 'border-violet-500/40',
            textColor: 'text-violet-300',
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            ),
            desc: 'The path you are destined to walk in this lifetime — your core mission and natural talents.',
          },
          {
            label: 'Destiny Number',
            number: numerology.destiny,
            gradient: 'from-fuchsia-600 to-pink-600',
            borderColor: 'border-fuchsia-500/40',
            textColor: 'text-fuchsia-300',
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ),
            desc: 'Your life\'s ultimate purpose — the opportunities that will come your way to fulfill your potential.',
          },
          {
            label: 'Personal Year',
            number: numerology.personal_year,
            gradient: 'from-cyan-600 to-blue-600',
            borderColor: 'border-cyan-500/40',
            textColor: 'text-cyan-300',
            icon: (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            desc: 'The energy shaping your current year — the themes and opportunities that 2025–2026 holds for you.',
          },
        ];
        const slide = slides[welcomeSlide];
        const isLast = welcomeSlide === slides.length - 1;

        const dismissPopup = () => {
          localStorage.setItem('AstroAi4u-numerology-welcome-seen', 'true');
          setShowWelcomePopup(false);
          setWelcomeSlide(0);
        };

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={dismissPopup} />

            {/* Modal */}
            <div className="relative w-full max-w-lg animate-slide-up">
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                {/* Close */}
                <button
                  onClick={dismissPopup}
                  className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Progress */}
                <div className="flex gap-2 mb-6">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setWelcomeSlide(i)}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= welcomeSlide ? `bg-gradient-to-r ${slide.gradient}` : 'bg-white/20'
                        }`}
                    />
                  ))}
                </div>

                {/* Welcome label */}
                <p className="text-center text-white/50 text-sm mb-5">✨ Your Numerology Blueprint</p>

                {/* Big number */}
                <div className="flex flex-col items-center mb-6">
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]`}>
                    <span className="text-5xl font-bold text-white">{slide.number}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${slide.textColor}`}>
                    {slide.icon}
                    <h2 className={`text-2xl font-bold ${slide.textColor}`}>{slide.label}</h2>
                  </div>
                </div>

                <p className="text-white/70 text-center text-base leading-relaxed mb-6">{slide.desc}</p>

                {/* Dot nav */}
                <div className="flex justify-center gap-2 mb-6">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setWelcomeSlide(i)}
                      className={`rounded-full transition-all duration-300 ${i === welcomeSlide ? `h-2 w-6 bg-gradient-to-r ${slide.gradient}` : 'h-2 w-2 bg-white/30 hover:bg-white/50'
                        }`}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setWelcomeSlide(prev => Math.max(0, prev - 1))}
                    disabled={welcomeSlide === 0}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium disabled:opacity-30 hover:bg-white/20 transition-all"
                  >
                    Previous
                  </button>
                  {isLast ? (
                    <button
                      onClick={dismissPopup}
                      className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${slide.gradient} text-white font-semibold hover:shadow-lg transition-all`}
                    >
                      Explore Your Numbers 🌟
                    </button>
                  ) : (
                    <button
                      onClick={() => setWelcomeSlide(prev => Math.min(slides.length - 1, prev + 1))}
                      className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${slide.gradient} text-white font-semibold hover:shadow-lg transition-all`}
                    >
                      Next
                    </button>
                  )}
                </div>

                {/* Skip */}
                <button
                  onClick={dismissPopup}
                  className="w-full mt-3 text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  Skip intro
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar" 
            id="main-content"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 lg:py-16">
              
              {/* Header section with minimal design */}
              <div className="mb-12">
                <GradientText className="text-4xl md:text-6xl font-black font-display mb-4">
                  Numerology
                </GradientText>
                <p className="text-white/60 text-lg max-w-xl border-l-2 border-fuchsia-500/30 pl-6 py-2">
                  Decoding the cosmic frequencies of your life through the ancient sacred science of numbers.
                </p>
              </div>

              {/* DRASTIC NEW DESIGN: The Trinity Mandala */}
              {numerology && !isLoading && !error && (
                <div className="space-y-16 animate-in fade-in duration-1000">
                  
                  {/* Central Interactive Mandala */}
                  <div className="relative w-full max-w-2xl mx-auto aspect-square flex items-center justify-center">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-fuchsia-500/5 to-transparent rounded-full blur-[120px] scale-150 animate-pulse" />
                    
                    {/* Sacred Geometry SVG */}
                    <svg className="absolute inset-0 w-full h-full opacity-30 select-none pointer-events-none" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="mandala-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <g className="origin-center" style={{ transformOrigin: 'center', animation: 'spin 120s linear infinite' }}>
                        <circle cx="100" cy="100" r="90" stroke="url(#mandala-grad)" strokeWidth="0.2" fill="none" />
                        <circle cx="100" cy="100" r="75" stroke="url(#mandala-grad)" strokeWidth="0.1" fill="none" strokeDasharray="1,2" />
                        <path d="M100 10 L177.9 145 L22.1 145 Z" stroke="white" strokeWidth="0.1" fill="none" opacity="0.4" />
                        <path d="M100 190 L177.9 55 L22.1 55 Z" stroke="white" strokeWidth="0.1" fill="none" opacity="0.4" />
                        {[0, 60, 120, 180, 240, 300].map(a => (
                          <line key={a} x1="100" y1="100" x2={100 + 90 * Math.cos(a * Math.PI / 180)} y2={100 + 90 * Math.sin(a * Math.PI / 180)} stroke="white" strokeWidth="0.05" opacity="0.2" />
                        ))}
                      </g>
                    </svg>

                    {/* Interactive Orbs */}
                    {coreSlides.map((slide, idx) => {
                      const angles = [-90, 30, 150];
                      const isActive = coreSlide === idx;
                      const angle = angles[idx];
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setCoreSlide(idx)}
                          className="absolute group z-20 outline-none transition-all duration-700"
                          style={{
                            top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 38}%)`,
                            left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 38}%)`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          {/* Active connection line to center */}
                          {isActive && (
                            <div 
                              className="absolute h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 w-[150%] origin-left -z-10"
                              style={{ 
                                transform: `rotate(${angle + 180}deg)`,
                                left: '50%',
                                top: '50%'
                              }} 
                            />
                          )}

                          <div className={`
                            relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center
                            backdrop-blur-xl border-2 transition-all duration-700
                            ${isActive 
                              ? `bg-white/10 ${slide.borderColor} scale-110 shadow-[0_0_50px_rgba(168,85,247,0.3)]` 
                              : 'bg-black/40 border-white/5 hover:border-white/20 hover:scale-105'
                            }
                          `}>
                            {/* Inner Pulsing Glow */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${slide.bgColor} transition-opacity duration-700 ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`} />
                            
                            <span className={`relative text-4xl sm:text-5xl font-black mb-1 font-display tracking-tighter ${isActive ? 'text-white' : 'text-white/40'}`}>
                              {slide.number}
                            </span>
                            <span className="relative text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                              {slide.title}
                            </span>

                            {isActive && (
                              <div className="absolute -inset-2">
                                <Sparkles className="absolute top-0 right-0 w-5 h-5 text-fuchsia-400 animate-pulse" />
                                <Sparkles className="absolute bottom-0 left-0 w-5 h-5 text-violet-400 animate-pulse" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Floating hint popup */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[180%] z-30 pointer-events-none">
                      <div className="relative">
                        <div className="bg-fuchsia-600/20 backdrop-blur-xl border border-fuchsia-500/40 px-4 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-bounce text-center whitespace-nowrap whitespace-pre">
                          Click on number to know more ✨
                        </div>
                        {/* Arrow indicator */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-fuchsia-500/40 mx-auto mt-[-4px]" />
                      </div>
                    </div>

                    {/* Central Nexus Orb */}
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
                               {coreSlides[coreSlide]?.icon}
                               <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">{coreSlides[coreSlide]?.subtitle}</span>
                            </div>
                            <h2 className={`text-4xl sm:text-5xl font-black font-display ${coreSlides[coreSlide]?.textColor}`}>
                               {coreSlides[coreSlide]?.title} {coreSlides[coreSlide]?.number}
                            </h2>
                          </div>
                          <button
                            onClick={shareNumerology}
                            disabled={isSharingNumerology}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group disabled:opacity-50"
                          >
                            <span className="text-sm font-semibold">Share Blueprint</span>
                            {isSharingNumerology ? (
                              <LoadingSpinner />
                            ) : (
                              <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            )}
                          </button>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-12">
                          <div className="lg:col-span-3 space-y-8">
                            <div>
                               <h4 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">The Cosmic Vibration</h4>
                               <p className="text-white/80 text-xl leading-relaxed font-light">
                                 {coreSlides[coreSlide]?.description}
                               </p>
                            </div>
                            
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  {coreSlides[coreSlide]?.icon}
                               </div>
                               <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-6">Strategic Focus</h4>
                               <ul className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
                                 {coreSlides[coreSlide]?.points.map((point: string, idx: number) => (
                                   <li key={idx} className="flex items-start gap-4">
                                     <div className={`mt-1 w-2 h-2 rounded-full ${coreSlides[coreSlide]?.textColor.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
                                     <span className="text-white/70 text-base leading-snug">{point}</span>
                                   </li>
                                 ))}
                               </ul>
                            </div>
                          </div>

                          <div className="lg:col-span-2 space-y-6">
                             {/* Specific details based on the selected number */}
                             {coreSlide === 0 && (
                               <div className="space-y-4">
                                  <div className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                                     <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Core Strength</p>
                                     <p className="text-white/80">{getLifePathStrength(numerology.life_path)}</p>
                                  </div>
                                  <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                     <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Primary Challenge</p>
                                     <p className="text-white/80">{getLifePathChallenge(numerology.life_path)}</p>
                                  </div>
                               </div>
                             )}
                             {coreSlide === 1 && (
                               <div className="space-y-4">
                                  <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                     <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Life Purpose</p>
                                     <p className="text-white/80">{getDestinyPurpose(numerology.destiny)}</p>
                                  </div>
                                  <div className="p-6 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                                     <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Hidden Talent</p>
                                     <p className="text-white/80">{getDestinyTalent(numerology.destiny)}</p>
                                  </div>
                               </div>
                             )}
                             {coreSlide === 2 && (
                               <div className="space-y-4">
                                  <div className="p-6 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                                     <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Year Theme</p>
                                     <p className="text-white/80">{getPersonalYearTheme(numerology.personal_year)}</p>
                                  </div>
                                  <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                                     <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Best Advice</p>
                                     <p className="text-white/80">{getPersonalYearAdvice(numerology.personal_year)}</p>
                                  </div>
                               </div>
                             )}
                             <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 text-center shadow-2xl">
                                <p className="text-white/40 text-sm italic mb-4">Want a deeper look into your vibrations?</p>
                                <button className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] transition-transform shadow-xl" onClick={() => navigate('/ai-chat')}>
                                   Ask AstroAI
                                </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  <AstroNumerologyFlow />
                </div>
              )}

              {/* States: Loading / Error / Empty (Drastically redesigned) */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                   <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-fuchsia-500 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-fuchsia-500 animate-pulse" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2">Attuning to the Cosmos</h3>
                   <p className="text-white/50">Consulting the universal ledger for your unique vibration...</p>
                </div>
              )}

              {error && !isLoading && (
                 <div className="max-w-md mx-auto text-center py-20 p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
                   <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">Signal Interrupted</h3>
                   <p className="text-white/60 mb-8">{error}</p>
                   <button onClick={handleRetry} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                      Retry Connection
                   </button>
                 </div>
              )}

              {user && !numerology && !isLoading && !error && (
                <div className="max-w-2xl mx-auto text-center py-16">
                  <div className="relative w-32 h-32 mx-auto mb-10">
                     <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl animate-pulse" />
                     <div className="relative w-full h-full bg-black/40 border border-white/10 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-violet-400" />
                     </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-6">Your Blueprint awaits Generation</h3>
                  <p className="text-white/60 text-lg mb-10 leading-relaxed">
                    We haven't mapped your numerical frequency yet. Complete your profile to unlock the secrets hidden in your birth numbers.
                  </p>
                  <button
                    onClick={handleGettingStarted}
                    className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-lg shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                       Generate Insights <Target className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    </span>
                  </button>
                </div>
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
                      handleAskQuestion(e as any);
                    }
                  }
                }}
                placeholder="Ask AstroAi4u about your numbers..."
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
            <p className="text-center text-white/30 text-xs mt-2">AstroAi4u can make mistakes. Consider checking important information.</p>
          </form>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default NumerologyPage;

