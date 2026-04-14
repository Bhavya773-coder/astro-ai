import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { Target, Calendar, Telescope } from 'lucide-react';

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

  const getLifePathMeaning = (number: string) => {
    const meanings: Record<string, string> = {
      '1': 'Natural leader, independent, ambitious. You have the drive to achieve great things.',
      '2': 'Diplomatic, sensitive, intuitive. You bring harmony and cooperation to relationships.',
      '3': 'Creative, expressive, optimistic. You inspire others with your artistic talents.',
      '4': 'Practical, disciplined, reliable. You build solid foundations for success.',
      '5': 'Adventurous, versatile, freedom-loving. You embrace change and new experiences.',
      '6': 'Nurturing, responsible, compassionate. You create harmony in family and community.',
      '7': 'Analytical, spiritual, introspective. You seek truth and deeper understanding.',
      '8': 'Ambitious, authoritative, successful. You have natural business acumen.',
      '9': 'Humanitarian, compassionate, wise. You serve others with selfless dedication.',
    };
    return meanings[number] || 'You have a unique path filled with special opportunities for growth.';
  };

  const getDestinyMeaning = (number: string) => {
    const meanings: Record<string, string> = {
      '1': 'Your destiny is to be a pioneer and leader in your chosen field.',
      '2': 'Your destiny involves bringing peace and cooperation to the world.',
      '3': 'Your destiny is to inspire and uplift others through creativity.',
      '4': 'Your destiny is to build lasting structures and systems.',
      '5': 'Your destiny involves embracing freedom and inspiring change.',
      '6': 'Your destiny is to nurture and heal others, creating beauty.',
      '7': 'Your destiny involves seeking wisdom and sharing knowledge.',
      '8': 'Your destiny is to achieve material and spiritual abundance.',
      '9': 'Your destiny is to serve humanity with compassion and wisdom.',
    };
    return meanings[number] || 'Your destiny holds unique opportunities for making a difference.';
  };

  const getPersonalYearAdvice = (year: string) => {
    const advice: Record<string, string> = {
      '1': 'A year of new beginnings. Start fresh projects and take initiative.',
      '2': 'Focus on partnerships and cooperation. Patience will bring rewards.',
      '3': 'Express creativity and socialize. Joy and optimism attract success.',
      '4': 'Build solid foundations. Hard work now creates future stability.',
      '5': 'Embrace change and new opportunities. Adventure calls this year.',
      '6': 'Focus on family and responsibilities. Create harmony in relationships.',
      '7': 'A year for introspection and spiritual growth. Seek inner wisdom.',
      '8': 'Professional and financial growth. Step into your power and authority.',
      '9': 'Completion and transformation. Release what no longer serves you.',
    };
    return advice[year] || 'Stay true to your authentic self and embrace the journey.';
  };

  const coreSlides = data?.numerology_data ? [
    {
      title: 'Life Path',
      number: data.numerology_data.life_path,
      subtitle: 'Your Core Identity',
      description: getLifePathMeaning(data.numerology_data.life_path),
      icon: <Telescope className="w-6 h-6 text-violet-400" />,
      bgColor: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-300',
    },
    {
      title: 'Destiny',
      number: data.numerology_data.destiny,
      subtitle: 'Your Life Purpose',
      description: getDestinyMeaning(data.numerology_data.destiny),
      icon: <Target className="w-6 h-6 text-fuchsia-400" />,
      bgColor: 'from-fuchsia-500/20 to-pink-500/20',
      borderColor: 'border-fuchsia-500/30',
      textColor: 'text-fuchsia-300',
    },
    {
      title: 'Personal Year',
      number: data.numerology_data.personal_year,
      subtitle: 'Current Cycle Energy',
      description: getPersonalYearAdvice(data.numerology_data.personal_year),
      icon: <Calendar className="w-6 h-6 text-cyan-400" />,
      bgColor: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-300',
    },
  ] : [];

  useEffect(() => {
    if (shareId) {
      loadSharedNumerology();
    }
  }, [shareId]);

  const loadSharedNumerology = async () => {
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

      const data = await res.json();
      
      if (data?.success) {
        setData(data.data);
      } else {
        setError(data?.message || 'Shared numerology not found');
      }
    } catch (err) {
      console.error('Error loading shared numerology:', err);
      setError('Failed to load shared numerology. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen py-8 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Astro AI" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-white">Astro AI</h1>
              <p className="text-white/60 text-sm">Your Personal AI Astrologer</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-6 md:p-8 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            {/* Personalized Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4">
                <svg className="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 3.666V14m-3 4.333V14m-7 5h16a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-fuchsia-400 text-sm font-medium">Personalized Numerology</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                <GradientText>For {data.user_name}</GradientText>
              </h2>
              <p className="text-white/60">
                Your Cosmic Number Blueprint
              </p>
            </div>

            {/* Carousel */}
            <div 
              className="glass-card p-5 md:p-6 bg-black/40 border border-violet-500/30 backdrop-blur-md select-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Swipe hint for mobile */}
              <div className="md:hidden flex justify-center mb-4">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <span>Swipe to navigate</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex gap-2 mb-6">
                {coreSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      index <= activeSlide 
                        ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' 
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Slide Content */}
              <div className="text-center">
                {/* Number Display */}
                <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${coreSlides[activeSlide]?.bgColor} mb-4 shadow-lg border ${coreSlides[activeSlide]?.borderColor}`}>
                  <span className={`text-4xl sm:text-5xl font-bold ${coreSlides[activeSlide]?.textColor}`}>
                    {coreSlides[activeSlide]?.number}
                  </span>
                </div>

                {/* Title */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {coreSlides[activeSlide]?.icon}
                  <h2 className={`text-xl sm:text-2xl font-bold ${coreSlides[activeSlide]?.textColor}`}>
                    {coreSlides[activeSlide]?.title} Number
                  </h2>
                </div>
                <p className="text-white/60 text-sm mb-4">{coreSlides[activeSlide]?.subtitle}</p>

                {/* Description */}
                <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                  {coreSlides[activeSlide]?.description}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                    disabled={activeSlide === 0}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Dots */}
                  <div className="flex gap-2">
                    {coreSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`rounded-full transition-all duration-300 ${
                          index === activeSlide 
                            ? 'h-2 w-6 bg-gradient-to-r from-fuchsia-500 to-purple-500' 
                            : 'h-2 w-2 bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveSlide(prev => Math.min(coreSlides.length - 1, prev + 1))}
                    disabled={activeSlide === coreSlides.length - 1}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
              >
                Get Your Own Reading
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedNumerologyPage;
