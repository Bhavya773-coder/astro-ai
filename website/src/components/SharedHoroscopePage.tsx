import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';

interface HoroscopeData {
  date: string;
  horoscope: string;
  insights: string;
  reason: string;
  actions: string;
}

interface SharedData {
  user_name: string;
  zodiac: string;
  horoscope_data: HoroscopeData;
  created_at: string;
}

const SharedHoroscopePage: React.FC = () => {
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
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const slides = [
    { id: 'horoscope', title: 'Daily Horoscope', content: data?.horoscope_data?.horoscope, color: 'fuchsia' },
    { id: 'insights', title: 'Insights', content: data?.horoscope_data?.insights, color: 'fuchsia' },
    { id: 'reason', title: 'Reason', content: data?.horoscope_data?.reason, color: 'violet' },
    { id: 'actions', title: 'Actions', content: data?.horoscope_data?.actions, color: 'purple' },
  ];

  useEffect(() => {
    if (shareId) {
      loadSharedHoroscope();
    }
  }, [shareId]);

  const loadSharedHoroscope = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/shared-horoscope/${shareId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load shared horoscope');
      }

      const data = await res.json();
      
      if (data?.success) {
        setData(data.data);
      } else {
        setError(data?.message || 'Shared horoscope not found');
      }
    } catch (err) {
      console.error('Error loading shared horoscope:', err);
      setError('Failed to load shared horoscope. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
            <h2 className="text-xl font-bold text-white mb-2">Horoscope Not Found</h2>
            <p className="text-white/70 mb-6">{error || 'This shared horoscope is no longer available.'}</p>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                <svg className="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-fuchsia-400 text-sm font-medium">Personalized Horoscope</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                <GradientText>For {data.user_name}</GradientText>
              </h2>
              <p className="text-white/60">
                {data.zodiac} • {data.horoscope_data?.date || new Date().toLocaleDateString()}
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
              {/* Slide content */}
              <div className="min-h-[180px] md:min-h-[160px]">
                {activeSlide === 0 && (
                  <>
                    <h4 className="text-fuchsia-400 font-semibold text-sm uppercase tracking-wide mb-3">Daily Horoscope</h4>
                    <p className="text-white/90 text-base leading-relaxed">{slides[0].content}</p>
                  </>
                )}
                {activeSlide === 1 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/30">
                        <svg className="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-fuchsia-400 font-semibold text-sm">Insights</h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{slides[1].content}</p>
                  </>
                )}
                {activeSlide === 2 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-violet-400 font-semibold text-sm">Reason</h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{slides[2].content}</p>
                  </>
                )}
                {activeSlide === 3 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-purple-400 font-semibold text-sm">Actions</h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{slides[3].content}</p>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Dots indicator */}
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeSlide 
                          ? 'w-6 bg-gradient-to-r from-fuchsia-500 to-violet-500' 
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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

export default SharedHoroscopePage;
