import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicBackground from './CosmicBackground';
import { SEO } from './SEO';
import { Telescope, Hash, BarChart2, Bot, Mail, Camera, ChevronDown, ChevronUp, Sparkles, MessageSquare, Star } from 'lucide-react';

const OnboardingOverlay: React.FC<{ onComplete: (believer: boolean) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const question = "Do You believe in astrology?";

  useEffect(() => {
    // Lazy load delay
    const startTimeout = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let timeout: any;
    const targetText = step === 0
      ? question
      : userChoice
        ? "Ok then, let's start with Believer"
        : "Ok then, let's start with Non-Believer";

    if (displayedText.length < targetText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(targetText.slice(0, displayedText.length + 1));
      }, 40);
    } else if (step === 0) {
      const optionTimeout = setTimeout(() => setShowOptions(true), 500);
      return () => clearTimeout(optionTimeout);
    } else if (step === 1) {
      onComplete(userChoice!);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, step, isVisible, userChoice, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4">
      {/* Central glow for background readability */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10">
        {/* Question Bubble */}
        <div className="relative group pointer-events-auto animate-fade-in-up self-start">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl rounded-bl-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center border border-violet-500/30">
                <Star className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">Cosmic Insight</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed min-h-[3rem]">
              {displayedText}
              <span className="inline-block w-1.5 h-6 ml-1 bg-fuchsia-500 animate-pulse align-middle"></span>
            </h2>
          </div>
        </div>

        {/* Options Row - Now aligned to the RIGHT (end) */}
        {showOptions && step === 0 && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-in pointer-events-auto self-end">
            <button
              onClick={() => {
                setUserChoice(true);
                setStep(1);
                setDisplayedText('');
                setShowOptions(false);
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all transform hover:scale-105 active:scale-95 group flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 group-hover:animate-ping" />
              Yes, I do believe in it
            </button>
            <button
              onClick={() => {
                setUserChoice(false);
                setStep(1);
                setDisplayedText('');
                setShowOptions(false);
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all transform hover:scale-105 active:scale-95 group flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-red-400 group-hover:animate-ping" />
              No, I don't
            </button>
          </div>
        )}

        {/* User Choice Label Bubble */}
        {step === 1 && (
          <div className="self-end animate-fade-in pointer-events-auto">
            <div className="bg-violet-600/20 backdrop-blur-xl border border-violet-500/30 p-4 rounded-2xl rounded-br-sm text-sm font-medium text-violet-200 shadow-lg">
              {userChoice ? "Yes, I believe" : "No, I don't believe"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({
    features: null,
    testimonials: null,
    astrology: null,
    faq: null
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    Object.keys(sectionRefs.current).forEach((key) => {
      const element = sectionRefs.current[key];
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({ ...prev, [key]: true }));
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // FAQPage JSON-LD Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does AstroAI generate my readings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AstroAI uses advanced algorithms and traditional astrological calculations combined with AI-powered insights to generate personalized readings based on your birth chart and numerology data.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is AstroAI free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! AstroAI offers free daily horoscopes, basic numerology insights, and AI chat features. Premium plans unlock advanced birth chart analysis, compatibility reports, and detailed yearly forecasts.'
        }
      },
      {
        '@type': 'Question',
        name: 'How accurate are the predictions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI combines traditional astrology with modern data science for highly personalized insights. While astrology is for entertainment and self-reflection, users consistently report that our readings resonate with their life experiences.'
        }
      },
      {
        '@type': 'Question',
        name: 'What information do I need to provide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For basic features, just your zodiac sign. For detailed readings, provide your birth date, time, and location. This allows us to calculate your complete birth chart including sun, moon, and rising signs.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I share my readings with friends?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! You can share horoscopes, numerology insights, and chat responses via unique links. Friends can view shared content without creating an account.'
        }
      }
    ]
  };

  const faqs = [
    {
      question: "How does AstroAI generate my readings?",
      answer: "AstroAI uses advanced algorithms and traditional astrological calculations combined with AI-powered insights to generate personalized readings based on your birth chart and numerology data."
    },
    {
      question: "How accurate are AstroAI's readings?",
      answer: "Our readings are based on established astrological principles and numerology systems. While we strive for accuracy, astrology is interpretive and should be used as guidance for self-reflection."
    },
    {
      question: "What kind of questions can I ask AstroAI?",
      answer: "You can ask about career guidance, relationships, personal growth, life purpose, compatibility with others, and timing for important decisions."
    },
    {
      question: "Is AstroAI free to use?",
      answer: "AstroAI offers both free and premium features. Basic birth chart analysis and daily insights are free, while advanced reports and personalized consultations require a subscription."
    },
    {
      question: "Are my questions and data private?",
      answer: "Yes, we use bank-level encryption to protect your data. Your birth chart information and conversations are never shared with third parties and are stored securely."
    },
    {
      question: "Why do I sometimes get different results?",
      answer: "Readings may vary slightly based on the time of calculation, planetary transits, and the specific astrological system being used. This is normal and adds depth to your understanding."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Marketing Professional",
      content: "AstroAI helped me understand my life path number and make a successful career change. The insights were incredibly accurate!",
      rating: 5
    },
    {
      name: "James T.",
      role: "Software Developer",
      content: "The compatibility reports helped me improve my relationship. Understanding our cosmic connection brought us closer together.",
      rating: 5
    },
    {
      name: "Emily R.",
      role: "Yoga Instructor",
      content: "I use AstroAI daily for guidance. The birth chart analysis revealed aspects of myself I never knew existed.",
      rating: 5
    }
  ];

  return (
    <CosmicBackground>
      <SEO
        title="Astro AI | AI Astrology & Personalized Oracle | Astroai4u"
        description="Astro AI - Your Personal AI Astrologer & My Oracle. Get AI-powered astrology readings, daily horoscopes, personalized tarot, numerology insights, birth charts & face reading."
        keywords="Astro AI, Astroai4u, AI Astrology, Personalized AI, My Oracle, Astrology Using AI"
        canonical="https://astroai4u.com/"
        ogImage="https://astroai4u.com/og-image.jpg"
      />
      
      {/* FAQPage JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      {/* Hero Section with Video Background */}
      <div className="relative overflow-hidden" style={{ height: '100vh' }}>
        {/* Background Effects with Video */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-transparent to-fuchsia-900/30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1)_0%,transparent_70%)]" />

          {/* Video Background */}
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                filter: 'brightness(0.35) contrast(1.1) saturate(0.8)',
                transform: 'scale(1.05)'
              }}
              onLoadedData={() => setVideoLoaded(true)}
              onError={(e) => console.error('Video loading error:', e)}
            >
              <source src="/Astroai-Background.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Loading placeholder while video loads */}
            {!videoLoaded && (
              <div
                className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            )}

            {/* Minimal Overlay for text readability */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(3, 7, 30, 0.4) 0%, rgba(3, 7, 30, 0.2) 50%, rgba(3, 7, 30, 0.5) 100%)'
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/favicon.png" alt="AstroAI" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg" />
              <div className="px-3 sm:px-4 py-2 sm:py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <div className="text-lg sm:text-xl font-bold font-display bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                  AstroAI
                </div>
                <div className="text-xs sm:text-sm text-white/70 block sm:hidden">AI-Powered Intelligence</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-violet-500/30 text-white text-sm sm:text-sm font-medium transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm sm:text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)]"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </header>

        {/* Interactive Onboarding Overlay */}
        <OnboardingOverlay
          onComplete={(believer) => {
            setTimeout(() => navigate(`/signup?type=${believer ? 'believer' : 'non-believer'}`), 2500);
          }}
        />

        {/* Main Content - Minimal to showcase video */}
        <main className="relative z-10 flex items-center justify-center pointer-events-none" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="text-center">
            {/* Main Title Area moved lower/handled by onboarding */}
          </div>
        </main>
      </div>

      {/* Upcoming Features Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-white via-fuchsia-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              Coming Soon
            </h2>
            <p className="mt-4 text-lg text-violet-300 font-medium">Exciting new AI-powered features on the horizon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coffee Reading */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src="./coffee.jpg"
                    alt="Coffee Reading"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">Coffee Reading</h3>
                <p className="text-white/60 text-sm">Discover insights through the ancient art of coffee, powered by AI</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold border border-fuchsia-500/30">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Palm Reading */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src="./PalmReading.webp"
                    alt="Palm Reading"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">Palm Reading</h3>
                <p className="text-white/60 text-sm">Unveil your destiny through deep AI analysis of your hand</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Face Reading */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src="./face-reading.jpg"
                    alt="Face Reading"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Face Reading</h3>
                <p className="text-white/60 text-sm">Explore personality traits through facial analysis</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={(el) => (sectionRefs.current['features'] = el)}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-fuchsia-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              What Can You Explore?
            </h2>
            <p className="mt-4 text-xl text-violet-300 font-medium">Find clarity through an immersive AI experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Birth Chart */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <Telescope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-fuchsia-400 transition-colors">Birth Chart</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  Discover your cosmic blueprint with detailed zodiac insights, planetary positions, and AI-driven astrological wisdom.
                </p>
              </div>
            </div>

            {/* Numerology */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <Hash className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-violet-400 transition-colors">Numerology</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  Calculate your life path number, destiny number, and unlock hidden meanings behind your birth date.
                </p>
              </div>
            </div>

            {/* Reports */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Reports</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  Generate comprehensive compatibility reports and track your spiritual growth with detailed analytics.
                </p>
              </div>
            </div>

            {/* AI Chat */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] group-hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-fuchsia-400 transition-colors">AI Guidance</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  Chat with our ultra-smart AI astrologer for dynamic insights and answers to your cosmic questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Astrology Information Section */}
      <section
        ref={(el) => (sectionRefs.current['astrology'] = el)}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible['astrology'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-fuchsia-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              Discover the Wisdom of the Stars
            </h2>
            <p className="mt-4 text-xl text-violet-300 font-medium">Ancient knowledge meets state-of-the-art AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* The 12 Zodiac Signs */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all">
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                The 12 Zodiac Signs
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { sign: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19', traits: 'Courageous, energetic, pioneering' },
                  { sign: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20', traits: 'Reliable, patient, practical' },
                  { sign: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20', traits: 'Adaptable, curious, communicative' },
                  { sign: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22', traits: 'Intuitive, emotional, protective' },
                  { sign: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22', traits: 'Confident, generous, dramatic' },
                  { sign: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22', traits: 'Analytical, modest, hardworking' },
                  { sign: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22', traits: 'Diplomatic, fair, social' },
                  { sign: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21', traits: 'Passionate, resourceful, mysterious' },
                  { sign: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21', traits: 'Optimistic, philosophical, adventurous' },
                  { sign: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19', traits: 'Ambitious, disciplined, responsible' },
                  { sign: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18', traits: 'Innovative, humanitarian, independent' },
                  { sign: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20', traits: 'Compassionate, artistic, intuitive' }
                ].map((zodiac, index) => (
                  <div key={index} className="text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl mb-2">{zodiac.symbol}</div>
                    <h4 className="font-bold text-white mb-1">{zodiac.sign}</h4>
                    <p className="text-xs text-white/75 mb-2">{zodiac.dates}</p>
                    <p className="text-sm text-white/90">{zodiac.traits}</p>
                    <div className="mt-2 text-xs text-amber-300 font-semibold">
                      Element: {zodiac.element}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planetary Information */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                The Planets & Their Influence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { planet: 'Sun', symbol: '☉', influence: 'Core identity, vitality, life purpose', color: 'gold' },
                  { planet: 'Moon', symbol: '☽', influence: 'Emotions, intuition, subconscious', color: 'silver' },
                  { planet: 'Mercury', symbol: '☿', influence: 'Communication, intellect, learning', color: 'gray' },
                  { planet: 'Venus', symbol: '♀', influence: 'Love, beauty, relationships', color: 'pink' },
                  { planet: 'Mars', symbol: '♂', influence: 'Action, passion, conflict', color: 'red' },
                  { planet: 'Jupiter', symbol: '♃', influence: 'Growth, wisdom, expansion', color: 'orange' },
                  { planet: 'Saturn', symbol: '♄', influence: 'Discipline, limitations, structure', color: 'brown' }
                ].map((planet, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white/10 to-transparent rounded-2xl hover:from-white/20 transition-all duration-300">
                    <div className="text-3xl" style={{ color: planet.color }}>{planet.symbol}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{planet.planet}</h4>
                      <p className="text-sm text-white/90">{planet.influence}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Houses & Aspects */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                The 12 Houses & Aspects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-white mb-2">The Houses</h4>
                  <p className="text-sm text-white/90 leading-relaxed">
                    The 12 houses represent different areas of life, from self-identity to career, relationships, and spirituality. Each house is ruled by a zodiac sign and reveals insights about that life domain.
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-white/75">
                    <p>• 1st House: Self, appearance, identity</p>
                    <p>• 7th House: Partnerships, marriage, contracts</p>
                    <p>• 10th House: Career, public life, reputation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-white mb-2">Major Aspects</h4>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Planetary aspects reveal how planets interact with each other, creating harmonious or challenging energies that influence personality and life events.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-white/75">
                    <p>• Conjunction: Planets together, blended energy</p>
                    <p>• Opposition: Planets opposite, tension, growth</p>
                    <p>• Trine: Planets 120° apart, harmony, ease</p>
                    <p>• Square: Planets 90° apart, challenges, action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        ref={(el) => (sectionRefs.current['faq'] = el)}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-fuchsia-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-violet-300 font-medium">Everything you need to know about AstroAI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-colors">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
                >
                  <span className="text-lg font-semibold pr-4">{faq.question}</span>
                  <span className="text-2xl transition-transform duration-300 text-white/60">
                    {activeFaq === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-8 pb-6 text-white/85 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-[#000000] border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/favicon.png" alt="AstroAI" className="w-9 h-9 rounded-full object-cover shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h3 className="text-xl font-bold font-display bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  AstroAI
                </h3>
              </div>
              <p className="text-white/60 leading-relaxed text-sm">
                Your premium AI companion for self-discovery and spiritual growth.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  <Mail className="w-4 h-4 text-white/80" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  {/* X / Twitter icon */}
                  <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.832l4.258 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  <Camera className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Products</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/birth-chart')} className="text-white/80 hover:text-amber-300 transition-colors">Birth Chart Analysis</button></li>
                <li><button onClick={() => navigate('/numerology')} className="text-white/80 hover:text-amber-300 transition-colors">Numerology Reports</button></li>
                <li><button onClick={() => navigate('/reports')} className="text-white/80 hover:text-amber-300 transition-colors">Compatibility Reports</button></li>
                <li><button onClick={() => navigate('/ai-chat')} className="text-white/80 hover:text-amber-300 transition-colors">AI Guidance</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/horoscope')} className="text-white/90 hover:text-amber-300 transition-colors">Free Daily Horoscope</button></li>
                <li><button onClick={() => navigate('/birth-chart-info')} className="text-white/90 hover:text-amber-300 transition-colors">Birth Chart Guide</button></li>
                <li><button onClick={() => navigate('/numerology-info')} className="text-white/90 hover:text-amber-300 transition-colors">Numerology Basics</button></li>
                <li><button onClick={() => navigate('/ai-astrologer')} className="text-white/90 hover:text-amber-300 transition-colors">AI Astrologer</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/help-center')} className="text-white/80 hover:text-amber-300 transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/contact')} className="text-white/80 hover:text-amber-300 transition-colors">Contact Us</button></li>
                <li><button onClick={() => navigate('/privacy')} className="text-white/80 hover:text-amber-300 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="text-white/80 hover:text-amber-300 transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/75 text-sm">
                © 2026 AstroAI. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <button onClick={() => navigate('/privacy')} className="text-white/70 hover:text-amber-300 text-sm transition-colors">Privacy</button>
                <button onClick={() => navigate('/terms')} className="text-white/70 hover:text-amber-300 text-sm transition-colors">Terms</button>
                <button className="text-white/70 hover:text-amber-300 text-sm transition-colors">Cookies</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </CosmicBackground>
  );
};

export default HomePage;
