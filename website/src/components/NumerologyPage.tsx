import React, { useState, useEffect } from 'react';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import Sidebar from './Sidebar';
import AstroNumerologyFlow from './AstroNumerologyFlow';
import toast from 'react-hot-toast';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { Sparkles, AlertTriangle, Target, Calendar, Telescope, Crosshair, LandPlot, Clock, Landmark, BarChart2, Triangle, Columns, Share2 } from 'lucide-react';
import AutoResizeTextarea from './AutoResizeTextarea';

interface NumerologyData {
  life_path: string;
  destiny: string;
  personal_year: string;
}

const NumerologyPage: React.FC = () => {
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

  const onTouchEnd = (onNext: () => void, onPrev: () => void) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    }
    if (isRightSwipe) {
      onPrev();
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

  const handleCoreNext = () => {
    if (coreSlide < 2) {
      setCoreSlide((prev) => prev + 1);
    }
  };

  const handleCorePrev = () => {
    if (coreSlide > 0) {
      setCoreSlide((prev) => prev - 1);
    }
  };

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
        await navigator.clipboard.writeText(res.data.shareUrl);
        toast.success('Numerology link copied to clipboard!');
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
      console.log('Fetching numerology data...');
      const response = await apiFetch('/api/numerology');
      console.log('Numerology API response:', response);

      if (response.success && response.numerology) {
        console.log('Setting numerology data:', response.numerology);
        setNumerology(response.numerology);
        setError(null);
        // Show welcome popup only if user hasn't seen it before
        const hasSeen = localStorage.getItem('astroai-numerology-welcome-seen');
        if (!hasSeen) {
          setTimeout(() => setShowWelcomePopup(true), 400);
        }
      } else if (response.success && !response.numerology) {
        console.log('No numerology data available');
        setNumerology(null);
        setError(null);
      } else {
        console.log('API returned error:', response.message);
        setError(response.message || 'Failed to load numerology data');
      }
    } catch (err: any) {
      console.error('Error fetching numerology:', err);
      setError(err.message || 'Failed to fetch numerology data');
      toast.error('Failed to load numerology insights');
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

  const getLifePathCareer = (lifePath: string) => {
    const careers: { [key: string]: string } = {
      '1': 'Leadership roles, entrepreneurship, management',
      '2': 'Counseling, diplomacy, mediation, arts',
      '3': 'Creative fields, communication, entertainment',
      '4': 'Building, engineering, administration, finance',
      '5': 'Travel, sales, marketing, public relations',
      '6': 'Teaching, healthcare, social work, service',
      '7': 'Research, spirituality, analysis, writing',
      '8': 'Business, finance, management, law',
      '9': 'Humanitarian work, arts, philosophy, healing',
      '11': 'Spiritual teaching, healing, intuitive work',
      '22': 'Large-scale projects, architecture, systems',
      '33': 'Teaching, healing, creative arts, leadership'
    };
    return careers[lifePath] || 'Fields utilizing your unique talents';
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

  const getDestinyLegacy = (destiny: string) => {
    const legacies: { [key: string]: string } = {
      '1': 'A legacy of pioneering and leadership',
      '2': 'A legacy of peace and cooperation',
      '3': 'A legacy of inspiration and creativity',
      '4': 'A legacy of stability and achievement',
      '5': 'A legacy of freedom and adventure',
      '6': 'A legacy of service and compassion',
      '7': 'A legacy of wisdom and truth',
      '8': 'A legacy of success and abundance',
      '9': 'A legacy of humanitarian service',
      '11': 'A legacy of spiritual enlightenment',
      '22': 'A legacy of lasting achievements',
      '33': 'A legacy of healing and teaching'
    };
    return legacies[destiny] || 'A meaningful and lasting impact';
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

  const getPersonalYearFocus = (personalYear: string) => {
    const focuses: { [key: string]: string } = {
      '1': 'Starting new projects and asserting independence',
      '2': 'Building relationships and partnerships',
      '3': 'Creative expression and social activities',
      '4': 'Discipline and practical achievements',
      '5': 'Adventure and personal freedom',
      '6': 'Family, home, and community service',
      '7': 'Spiritual study and inner work',
      '8': 'Career advancement and financial growth',
      '9': 'Completion and letting go',
      '11': 'Developing intuition and spiritual gifts',
      '22': 'Major achievements and recognition',
      '33': 'Teaching, healing, and service'
    };
    return focuses[personalYear] || 'Personal development goals';
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
          localStorage.setItem('astroai-numerology-welcome-seen', 'true');
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
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 lg:py-16">
              <h1 className="text-3xl md:text-4xl font-bold font-display">Numerology</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                Discover the ancient wisdom of numbers and how they reveal your life's purpose, personality, and destiny.
              </p>

              {/* Core Numbers Carousel - Permanent Display */}
              {numerology && !isLoading && !error && (
                <div className="mt-8 mb-12">
                  {/* Success Header - Now above carousel */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <h3 className="text-3xl font-bold text-white">Your Personal Numerology Blueprint</h3>
                      <button
                        onClick={shareNumerology}
                        disabled={isSharingNumerology}
                        className="p-2 rounded-full bg-white/10 hover:bg-fuchsia-500/20 text-white/70 hover:text-fuchsia-400 transition-all disabled:opacity-50"
                        title="Share numerology"
                      >
                        {isSharingNumerology ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <Share2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-white/60 max-w-3xl mx-auto text-lg">
                      Your unique numbers reveal the cosmic blueprint of your life. Each number carries specific energies and lessons that guide your journey through life.
                    </p>
                  </div>

                  <GlassCard 
                    className="p-6 sm:p-8 relative overflow-hidden" 
                    glow="purple"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => onTouchEnd(handleCoreNext, handleCorePrev)}
                  >
                    {/* Progress bar */}
                    <div className="flex gap-2 mb-6">
                      {coreSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCoreSlide(index)}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${index <= coreSlide ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 'bg-white/20'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Slide Content */}
                    <div className="text-center">
                      {/* Number Display */}
                      <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${coreSlides[coreSlide]?.bgColor} mb-4 shadow-lg border ${coreSlides[coreSlide]?.borderColor}`}>
                        <span className={`text-4xl sm:text-5xl font-bold ${coreSlides[coreSlide]?.textColor}`}>
                          {coreSlides[coreSlide]?.number}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {coreSlides[coreSlide]?.icon}
                        <h2 className={`text-xl sm:text-2xl font-bold ${coreSlides[coreSlide]?.textColor}`}>
                          {coreSlides[coreSlide]?.title}
                        </h2>
                      </div>
                      <p className="text-white/60 text-sm mb-4">{coreSlides[coreSlide]?.subtitle}</p>

                      {/* Description */}
                      <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto mb-4 leading-relaxed">
                        {coreSlides[coreSlide]?.description}
                      </p>

                      {/* Key Points */}
                      <div className="bg-black/40 rounded-xl p-4 mb-4 text-left max-w-md mx-auto">
                        <ul className="space-y-2">
                          {coreSlides[coreSlide]?.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-white/70 text-sm">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${coreSlides[coreSlide]?.textColor.replace('text-', 'bg-')}`}></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Slide counter */}
                      <p className="text-white/50 text-xs mb-4">
                        {coreSlide + 1} of {coreSlides.length}
                      </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={handleCorePrev}
                        disabled={coreSlide === 0}
                        className={`p-2 rounded-full transition-all duration-300 ${coreSlide === 0
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <div className="flex gap-2">
                        {coreSlides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCoreSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === coreSlide ? 'bg-fuchsia-500 w-6' : 'bg-white/30 hover:bg-white/50 w-2'
                              }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleCoreNext}
                        disabled={coreSlide === coreSlides.length - 1}
                        className={`p-2 rounded-full transition-all duration-300 ${coreSlide === coreSlides.length - 1
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* AI Conversational Onboarding Flow - Below Carousel */}
              {numerology && !isLoading && !error && (
                <AstroNumerologyFlow />
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-16 mt-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-400/20 rounded-full mb-6 animate-pulse">
                    <Sparkles className="w-7 h-7 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Loading Your Numerology Insights</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    We're retrieving your personalized numerology data...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-16 mt-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Unable to Load Insights</h3>
                  <p className="text-white/60 mb-8 max-w-md mx-auto">
                    {error}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleRetry}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-white/20"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleGettingStarted}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Generate Insights
                    </button>
                  </div>
                </div>
              )}

              {/* Generate Insights CTA - when no data */}
              {!numerology && !isLoading && !error && (
                <div className="text-center py-16 mt-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-400/20 rounded-full mb-8">
                    <Sparkles className="w-9 h-9 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Generate Your Insights to Unlock Numerology</h3>
                  <p className="text-white/60 mb-8 max-w-lg mx-auto text-lg">
                    Complete your profile to discover your life path, destiny number, and personal year insights. Your personalized numerology reading awaits.
                  </p>
                  <button
                    onClick={handleGettingStarted}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Generate Insights
                  </button>
                </div>
              )}



              <div className="mt-8">
              </div>
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
                placeholder="Ask AstroAI about your numbers..."
                maxRows={6}
                className="w-full bg-purple-800/90 hover:bg-purple-800 focus:bg-purple-800 backdrop-blur-xl border border-purple-600/50 hover:border-purple-500 focus:border-purple-500 rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-white placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg"
              />
              <button
                type="submit"
                disabled={!questionInput.trim()}
                className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:opacity-40 text-white rounded-xl transition-all disabled:cursor-not-allowed"
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
    </CosmicBackground>
  );
};

export default NumerologyPage;
