import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './CosmicUI';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const features: Feature[] = [
  {
    id: 'dashboard',
    title: 'Welcome to Your Dashboard',
    description: 'Your personalized cosmic journey begins here. Get daily horoscopes, insights, and AI-powered guidance tailored just for you.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 'numerology',
    title: 'Discover Your Numbers',
    description: 'Explore the mystical world of numerology. Understand your Life Path, Destiny, and Soul numbers that shape your journey.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'birthchart',
    title: 'Your Birth Chart',
    description: 'Dive deep into your astrological blueprint. Discover how the planets positions at your birth influence your personality and destiny.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'aichat',
    title: 'AI Astrologer Chat',
    description: 'Have a conversation with your personal AI astrologer. Ask anything about your chart, get predictions, and receive guidance 24/7.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'reports',
    title: 'Detailed Reports',
    description: 'Generate comprehensive reports about your compatibility, yearly forecasts, and personalized recommendations.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'styler',
    title: 'Personal Dressing Styler',
    description: 'Get AI-powered outfit suggestions based on your astrology and numerology. Dress in harmony with your cosmic energy.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'from-purple-500 to-indigo-500',
  },
];

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureTour: React.FC<FeatureTourProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentSlide < features.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('astroai-feature-tour-seen', 'true');
    onClose();
    navigate('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('astroai-feature-tour-seen', 'true');
    onClose();
  };

  const currentFeature = features[currentSlide];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl animate-slide-up">
        <GlassCard className="p-6 sm:p-8" glow="purple">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {features.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${index <= currentSlide ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 'bg-white/20'
                  }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className={`text-center transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${currentFeature.color} mb-6 shadow-lg shadow-fuchsia-500/30`}>
              <div className="text-white">
                {currentFeature.icon}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {currentFeature.title}
            </h2>

            {/* Description */}
            <p className="text-white/70 text-base sm:text-lg max-w-lg mx-auto mb-8">
              {currentFeature.description}
            </p>

            {/* Feature counter */}
            <p className="text-white/50 text-sm mb-8">
              {currentSlide + 1} of {features.length}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${currentSlide === 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-fuchsia-500 w-6' : 'bg-white/30 hover:bg-white/50'
                    }`}
                />
              ))}
            </div>

            {currentSlide === features.length - 1 ? (
              <button
                onClick={handleGetStarted}
                className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all duration-300"
              >Finish
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all duration-300"
              >
                Next
              </button>
            )}
          </div>

          {/* Skip option */}
          <button
            onClick={handleSkip}
            className="w-full mt-4 text-white/50 hover:text-white/80 text-sm transition-colors"
          >
            Skip tour
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default FeatureTour;
