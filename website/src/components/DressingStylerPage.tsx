import React, { useState, useEffect } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { apiFetch } from '../api/client';
import {
  Shirt,
  Sparkles,
  Palette,
  Scissors,
  Clover,
  Star,
  Moon,
  Zap,
  Clock,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Settings2,
  X,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DressingSuggestion {
  headline: string;
  overview: string;
  color_palette: string;
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
  const [questionInput, setQuestionInput] = useState('');

  // Survey State
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyData, setSurveyData] = useState({
    work_setting: '',
    style_vibe: '',
    fit_preference: '',
    accessory_level: '',
    avoid_colors: ''
  });
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);

  const totalSlides = 4;
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

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
        setSuggestion(response.data);
        setHasGeneratedToday(true);
        setCurrentSlide(0);
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

  const handleSaveSurvey = async () => {
    setIsSavingSurvey(true);
    try {
      const response = await apiFetch('/api/profile/style-preferences', {
        method: 'POST',
        body: JSON.stringify(surveyData)
      });

      if (response?.success) {
        toast.success('Cosmic style profile updated!');
        setShowSurvey(false);
        // Refresh suggestion to use new data
        handleGenerate();
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Connection error');
    } finally {
      setIsSavingSurvey(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Prepare slide data for consistent rendering
  const dressingSlides = suggestion ? [
    {
      title: 'Cosmic Vibe',
      subtitle: 'Today\'s Style Essence',
      description: suggestion.overview,
      points: [
        'Zodiac-aligned energy',
        'Daily vibration booster',
        'Intuitive expression'
      ],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'violet',
      bgColor: 'bg-violet-600/20',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-300'
    },
    {
      title: 'Power Palette',
      subtitle: 'Color Alignment',
      description: suggestion.color_palette,
      points: [
        'Strategic color shielding',
        'Aura-compatible shades',
        'Magnetic attraction colors'
      ],
      icon: <Palette className="w-6 h-6" />,
      color: 'cyan',
      bgColor: 'bg-cyan-600/20',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-300'
    },
    {
      title: 'Cosmic Alignment',
      subtitle: 'Astrological Basis',
      description: suggestion.astrological_reason,
      points: [
        'Sun sign influence',
        'Current planetary transits',
        'Lunar cycle synchronization'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'fuchsia',
      bgColor: 'bg-fuchsia-600/20',
      borderColor: 'border-fuchsia-500/30',
      textColor: 'text-fuchsia-300'
    },
    {
      title: 'Daily Luck',
      subtitle: 'Luck & Energy',
      description: `Maximize your fortune today with specific items and mood alignment.`,
      points: [
        `Lucky Item: ${suggestion.lucky_item}`,
        `Energy Mood: ${suggestion.mood_energy}`,
        'Personal luck factor active'
      ],
      icon: <Clover className="w-6 h-6" />,
      color: 'amber',
      bgColor: 'bg-amber-600/20',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-300'
    }
  ] : [];

  const styleVibes = ['Minimalist', 'Bold & Vibrant', 'Classic / Professional', 'Bohemian', 'Avant-Garde', 'Streetwear'];
  const workSettings = ['Corporate Office', 'Creative Space', 'Home Office', 'Special Event', 'Formal Banquet', 'Casual Outing'];

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 lg:py-16">
              {/* Personalized Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-md mb-4 animate-fade-in group">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 group-hover:scale-125 transition-transform" />
                <span className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-widest">Personalized Alignment</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-display">StyleForcaster</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                Get daily cosmic style guidance based on your personal zodiac alignment and current planetary energies.
              </p>

              {/* Date & Refresh Badge Section */}
              {hasGeneratedToday && (
                <div className="flex flex-wrap items-center gap-3 mt-8 mb-4">
                  <div className="px-4 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-full text-[10px] sm:text-xs font-bold text-violet-300 uppercase tracking-widest">
                    {today}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-violet-500/20 rounded-full text-[9px] sm:text-xs text-violet-300 backdrop-blur-md">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium tracking-wide">Next Refresh: {countdown}</span>
                  </div>
                </div>
              )}



              {/* Main Content Area - Slide based like Numerology */}
              {suggestion && (
                <div className="mt-8 mb-12 space-y-8 animate-fade-in-up lg:max-w-2xl lg:mx-auto">

                  {/* Success Header Area */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                      "{suggestion.headline}"
                    </h2>
                    <p className="text-white/60 max-w-3xl mx-auto text-base sm:text-lg">
                      Your daily style alignment is ready. Scroll through your personal cosmic styling blueprint below.
                    </p>
                  </div>

                  <GlassCard 
                    className="py-6 px-4 sm:py-8 sm:px-10 relative overflow-hidden" 
                    glow="purple"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => onTouchEnd(handleNext, handlePrev)}
                  >
                    {/* Progress indicator */}
                    <div className="flex gap-2 mb-6">
                      {dressingSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${index <= currentSlide ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/20'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Active Slide Content */}
                    <div className="text-center">
                      {/* Big Icon Box */}
                      <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${dressingSlides[currentSlide]?.bgColor} mb-4 shadow-2xl border ${dressingSlides[currentSlide]?.borderColor} transform hover:scale-105 transition-transform duration-500`}>
                        <div className={`${dressingSlides[currentSlide]?.textColor} scale-150`}>
                          {dressingSlides[currentSlide]?.icon}
                        </div>
                      </div>

                      {/* Header Area */}
                      <div className="flex items-center justify-center gap-3 mb-1">
                        <h2 className={`text-2xl sm:text-3xl font-bold ${dressingSlides[currentSlide]?.textColor} font-display uppercase tracking-wider`}>
                          {dressingSlides[currentSlide]?.title}
                        </h2>
                      </div>
                      <p className="text-white/50 text-xs sm:text-xs font-bold uppercase tracking-[0.3em] mb-4">
                        {dressingSlides[currentSlide]?.subtitle}
                      </p>

                      {/* Main Description */}
                      <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
                        {dressingSlides[currentSlide]?.description}
                      </p>

                      {/* Points Box - key for mobile visibility */}
                      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 mb-6 text-left max-w-md mx-auto border border-white/5 shadow-inner">
                        <ul className="space-y-3">
                          {dressingSlides[currentSlide]?.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80 text-sm sm:text-base">
                              <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${dressingSlides[currentSlide]?.textColor.replace('text-', 'bg-')}`}></span>
                              <span className="leading-tight">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Slide Counter Indicator */}
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                        Blueprint Part {currentSlide + 1} of {totalSlides}
                      </p>
                    </div>

                    {/* Navigation Row */}
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <button
                        onClick={handlePrev}
                        disabled={currentSlide === 0}
                        className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${currentSlide === 0
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95'
                          } border border-white/10`}
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>

                      <div className="flex gap-2 sm:gap-3">
                        {dressingSlides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'bg-fuchsia-500 w-8 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-white/20 hover:bg-white/40 w-2.5'
                              }`}
                            aria-label={`Go to section ${index + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleNext}
                        disabled={currentSlide === totalSlides - 1}
                        className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${currentSlide === totalSlides - 1
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95'
                          } border border-white/10`}
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </GlassCard>

                  {/* Secondary Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-6 pt-6">
                    <button
                      onClick={() => {
                        setSurveyStep(1);
                        setShowSurvey(true);
                      }}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 hover:from-fuchsia-600/30 hover:to-violet-600/30 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold transition-all group shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    >
                      <Settings2 className="w-5 h-5 text-fuchsia-400 group-hover:rotate-90 transition-transform duration-500" />
                      <span>Refine My Style Profile</span>
                    </button>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-white/40 hover:text-white transition-colors text-sm font-medium"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* No Data / Initial CTA Area */}
              {!suggestion && !isGenerating && !hasGeneratedToday && (
                <div className="text-center py-16 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-fuchsia-400/20 rounded-full mb-8 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <Shirt className="w-9 h-9 text-fuchsia-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Reveal Your Cosmic Look</h2>
                  <p className="text-white/60 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    Synthesize your sun sign, planetary transits, and personal style profile into the perfect daily ensemble.
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Aligning Cosmic Vibe...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Style Reading</span>
                      </>
                    )}
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
                placeholder="Ask your cosmic stylist..."
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

          {/* STYLE REFINE MODAL (SURVEY) - Centered Popup */}
          {showSurvey && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-[0_0_60px_rgba(168,85,247,0.25)] max-h-[90vh] overflow-y-auto scrollbar-none">
                <button
                  onClick={() => setShowSurvey(false)}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Step Header */}
                  <div className="text-center pt-2 sm:pt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-fuchsia-500/10 rounded-full text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-2 sm:mb-3">
                      Step {surveyStep} of 5
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-display">Deep Style Profile</h2>
                  </div>

                  {/* Step Content */}
                  <div className="min-h-[200px] sm:min-h-[240px] md:min-h-[280px] flex flex-col justify-center animate-fade-in-up">

                    {surveyStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        <label className="block text-sm sm:text-base md:text-lg font-semibold text-center mb-3 sm:mb-4 md:mb-6">What is your primary setting today?</label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                          {workSettings.map(setting => (
                            <button
                              key={setting}
                              onClick={() => {
                                setSurveyData({ ...surveyData, work_setting: setting });
                                setSurveyStep(2);
                              }}
                              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border text-xs sm:text-sm transition-all ${surveyData.work_setting === setting
                                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                }`}
                            >
                              {setting}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        <label className="block text-sm sm:text-base md:text-lg font-semibold text-center mb-3 sm:mb-4 md:mb-6">Choose your preferred style aesthetic</label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                          {styleVibes.map(vibe => (
                            <button
                              key={vibe}
                              onClick={() => {
                                setSurveyData({ ...surveyData, style_vibe: vibe });
                                setSurveyStep(3);
                              }}
                              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border text-xs sm:text-sm transition-all ${surveyData.style_vibe === vibe
                                ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                }`}
                            >
                              {vibe}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 3 && (
                      <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        <label className="block text-sm sm:text-base md:text-lg font-semibold text-center mb-3 sm:mb-4 md:mb-6">How should your clothes fit today?</label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                          {['Oversized', 'Relaxed', 'Tailored', 'Slim Fit'].map(fit => (
                            <button
                              key={fit}
                              onClick={() => {
                                setSurveyData({ ...surveyData, fit_preference: fit });
                                setSurveyStep(4);
                              }}
                              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border text-xs sm:text-sm transition-all ${surveyData.fit_preference === fit
                                ? 'bg-fuchsia-600 border-fuchsia-500 text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 4 && (
                      <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        <label className="block text-sm sm:text-base md:text-lg font-semibold text-center mb-3 sm:mb-4 md:mb-6">Level of accessorizing?</label>
                        <div className="grid grid-cols-1 gap-2 sm:gap-2.5 md:gap-3">
                          {[
                            { id: 'None', desc: 'Keep it pure and simple' },
                            { id: 'Subtle', desc: 'Minimalist accents' },
                            { id: 'Statement', desc: 'Bold, expressive pieces' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSurveyData({ ...surveyData, accessory_level: item.id });
                                setSurveyStep(5);
                              }}
                              className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border text-left transition-all flex justify-between items-center ${surveyData.accessory_level === item.id
                                ? 'bg-violet-600 border-violet-500 text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                }`}
                            >
                              <div>
                                <div className="font-bold text-xs sm:text-sm md:text-base">{item.id}</div>
                                <div className="text-[10px] sm:text-xs opacity-60">{item.desc}</div>
                              </div>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 5 && (
                      <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        <label className="block text-sm sm:text-base md:text-lg font-semibold text-center mb-2 sm:mb-3 md:mb-4">Any colors or patterns to avoid?</label>
                        <textarea
                          autoFocus
                          value={surveyData.avoid_colors}
                          onChange={(e) => setSurveyData({ ...surveyData, avoid_colors: e.target.value })}
                          placeholder="e.g. Neon colors, animal prints, All black..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4 text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500/50 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] text-xs sm:text-sm md:text-base"
                        />
                        <button
                          onClick={handleSaveSurvey}
                          disabled={isSavingSurvey}
                          className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {isSavingSurvey ? <LoadingSpinner size="sm" /> : <><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> <span>Sync Cosmic Style</span></>}
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Navigation Footer - Responsive spacing */}
                  {surveyStep < 5 && (
                    <div className="flex justify-between items-center pt-2 sm:pt-3 md:pt-4">
                      {surveyStep > 1 ? (
                        <button onClick={() => setSurveyStep(prev => prev - 1)} className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-medium">
                          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back
                        </button>
                      ) : <div />}

                      <div className="flex gap-0.5 sm:gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === surveyStep ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(232,121,249,0.8)]' : 'bg-white/10'}`} />
                        ))}
                      </div>

                      <button
                        onClick={() => setSurveyStep(prev => prev + 1)}
                        className={`text-fuchsia-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-bold ${!surveyData[Object.keys(surveyData)[surveyStep - 1] as keyof typeof surveyData] ? 'opacity-30 pointer-events-none' : ''}`}
                      >
                        Skip <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </CosmicBackground>
  );
};

export default DressingStylerPage;
