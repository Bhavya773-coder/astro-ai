import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicBackground from './CosmicBackground';
import { SEO } from './SEO';
import { 
  Telescope, 
  Hash, 
  BarChart2, 
  Bot, 
  Mail, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  MessageSquare, 
  Star, 
  Hand, 
  Coffee, 
  X, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Clock,
  Lock,
  Info,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Feature Data Definition ─── */
interface FeatureItem {
  id: string;
  title: string;
  shortDescription: string;
  howItWorks: string;
  image: string;
  altText: string;
  route: string;
  ctaLabel: string;
  accent: string;
  recommendedFor: string[];
  freeToTry: boolean;
}

const featuresData: FeatureItem[] = [
  {
    id: 'birth-chart',
    title: 'Birth Chart Analysis',
    shortDescription: 'Discover your cosmic blueprint with detailed zodiac insights, planetary positions, and AI-driven astrological wisdom.',
    howItWorks: 'Enter your exact birth date, time, and location to calculate placements.',
    image: '/birth-chart-preview.png',
    altText: 'Elegant astrological birth chart config showing planetary placements',
    route: '/birth-chart',
    ctaLabel: 'Create My Birth Chart',
    accent: 'from-cosmic-purple to-cosmic-pink',
    recommendedFor: ['personality', 'career'],
    freeToTry: true
  },
  {
    id: 'palm-reading',
    title: 'AI Palm Reading',
    shortDescription: 'Unveil your destiny, traits, and life line patterns through computer vision and biometric hand analysis.',
    howItWorks: 'Upload a clear photograph of your palm to map the major lines.',
    image: '/palm-reading-preview.png',
    altText: 'Premium palm photograph showing scanned biometric contour lines',
    route: '/palm-reading',
    ctaLabel: 'Read My Palm',
    accent: 'from-cosmic-cyan to-cosmic-purple',
    recommendedFor: ['personality', 'future'],
    freeToTry: true
  },
  {
    id: 'face-reading',
    title: 'AI Face Reading',
    shortDescription: 'Explore personality indicators, emotional symmetry, and behavioral traits from facial structures.',
    howItWorks: 'Upload a neutral portrait selfie to map key facial landmarks.',
    image: '/face-reading-preview.png',
    altText: 'High-quality face-mapping preview highlighting facial structure analysis',
    route: '/face-reading',
    ctaLabel: 'Try Face Reading',
    accent: 'from-cosmic-pink to-cosmic-purple',
    recommendedFor: ['personality', 'future'],
    freeToTry: true
  },
  {
    id: 'coffee-reading',
    title: 'Coffee Grounds Reading',
    shortDescription: 'Decode symbols and pattern predictions in your coffee cup grounds via advanced visual models.',
    howItWorks: 'Take photographs of the cup interior and bottom to scan shapes.',
    image: '/coffee-reading-preview.png',
    altText: 'Overhead view of coffee cup grounds showing symbolic prediction shapes',
    route: '/coffee-reading',
    ctaLabel: 'Read My Coffee Cup',
    accent: 'from-cosmic-purple to-cosmic-pink',
    recommendedFor: ['future'],
    freeToTry: false
  },
  {
    id: 'tarot-reading',
    title: 'AI Tarot Reading',
    shortDescription: 'Gain immediate perspective on questions, decisions, or relationships through three-card spreads.',
    howItWorks: 'Select three cards from the digital deck after concentrating on your query.',
    image: '/tarot-reading-preview.png',
    altText: 'Cinematic layout of three glowing tarot cards on dark space',
    route: '/ai-chat?topic=tarot',
    ctaLabel: 'Draw Tarot Cards',
    accent: 'from-cosmic-purple to-cosmic-pink',
    recommendedFor: ['relationships', 'future'],
    freeToTry: true
  },
  {
    id: 'ai-chat',
    title: 'AI Astrology Chat',
    shortDescription: 'Interact in real-time with an intelligent AI Astrologer configured with transit charts.',
    howItWorks: 'Ask questions about your transits, compatibility, or daily guidance.',
    image: '/ai-chat-preview.png',
    altText: 'Clean chat conversation window displaying cosmic advice and forecasts',
    route: '/ai-chat',
    ctaLabel: 'Start AI Chat',
    accent: 'from-cosmic-cyan to-cosmic-purple',
    recommendedFor: ['relationships', 'career'],
    freeToTry: true
  },
  {
    id: 'smart-reports',
    title: 'Kundli',
    shortDescription: 'Generate your comprehensive Vedic birth chart, planetary layouts, and personalized cosmic life guides.',
    howItWorks: 'Generate a detailed Kundli package based on your chart transits.',
    image: '/smart-reports-preview.png',
    altText: 'Sophisticated Kundli dashboard layout displaying planetary charts and transit graphs',
    route: '/reports',
    ctaLabel: 'View a Sample Kundli',
    accent: 'from-cosmic-purple to-cosmic-pink',
    recommendedFor: ['career', 'future'],
    freeToTry: false
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Carousel States
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);

  // Guided Discovery States
  const [discoveryCategory, setDiscoveryCategory] = useState<string | null>(null);

  // Sample Modal States
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleType, setSampleType] = useState<'birth' | 'palm' | 'face'>('birth');

  // Accessibility
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Intersection observers for section fade-in
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Mobile scrolling sync ref
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check reduced motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    // Autoplay carousel rotation
    if (isHovered || isDragging || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuresData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, isDragging, prefersReducedMotion]);

  useEffect(() => {
    // Pause carousel rotation when document is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Intersection observer setup
    const observers: IntersectionObserver[] = [];
    Object.keys(sectionRefs.current).forEach((key) => {
      const el = sectionRefs.current[key];
      if (el) {
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [key]: true }));
          }
        }, { threshold: 0.1 });
        obs.observe(el);
        observers.push(obs);
      }
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Handle modal backdrop scroll freeze
  useEffect(() => {
    if (showSampleModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSampleModal]);

  // Keyboard navigation for Carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + featuresData.length) % featuresData.length);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % featuresData.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag Gesture Handlers for Desktop
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStartX.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragOffset) > 60) {
      if (dragOffset > 0) {
        setActiveIndex((prev) => (prev - 1 + featuresData.length) % featuresData.length);
      } else {
        setActiveIndex((prev) => (prev + 1) % featuresData.length);
      }
    }
    setDragOffset(0);
  };

  // Sync index from mobile scroll snap
  const handleMobileScroll = () => {
    const container = mobileScrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.72 + 16; // Width (72vw) + Gap (16px)
    const index = Math.round(scrollLeft / cardWidth);
    if (index >= 0 && index < featuresData.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollIntoSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // FAQPage JSON-LD Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does AstroAi4u generate my readings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AstroAi4u uses advanced algorithms and traditional astrological calculations combined with AI-powered insights to generate personalized readings based on your birth chart and numerology data.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is AstroAi4u free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! AstroAi4u offers free daily horoscopes, basic numerology insights, and AI chat features. Premium plans unlock advanced birth chart analysis, compatibility Kundlis, and detailed yearly forecasts.'
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
      question: "How does AstroAi4u generate my readings?",
      answer: "AstroAi4u uses advanced algorithms and traditional astrological calculations combined with AI-powered insights to generate personalized readings based on your birth chart and numerology data."
    },
    {
      question: "How accurate are AstroAi4u's readings?",
      answer: "Our readings are based on established astrological principles and numerology systems. While we strive for accuracy, astrology is interpretive and should be used as guidance for self-reflection."
    },
    {
      question: "What kind of questions can I ask AstroAi4u?",
      answer: "You can ask about career guidance, relationships, personal growth, life purpose, compatibility with others, and timing for important decisions."
    },
    {
      question: "Is AstroAi4u free to use?",
      answer: "AstroAi4u offers both free and premium features. Basic birth chart analysis and daily insights are free, while advanced Kundlis and personalized consultations require a subscription."
    },
    {
      question: "Are my questions and data private?",
      answer: "Yes, we use secure, encrypted storage protocols to protect your files. Your photographs and data are processed privately and are never sold or shared."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Marketing Professional",
      content: "AstroAi4u helped me understand my life path number and make a successful career change. The insights were incredibly accurate!",
      rating: 5
    },
    {
      name: "James T.",
      role: "Software Developer",
      content: "The compatibility Kundlis helped me improve my relationship. Understanding our cosmic connection brought us closer together.",
      rating: 5
    },
    {
      name: "Emily R.",
      role: "Yoga Instructor",
      content: "I use AstroAi4u daily for guidance. The birth chart analysis revealed aspects of myself I never knew existed.",
      rating: 5
    }
  ];

  const activeFeature = featuresData[activeIndex];
  const radius = 320; // 3D radius for desktop

  return (
    <CosmicBackground className="bg-cosmic-deep-space">
      <SEO
        title="AstroAi4u | AI Astrology & Personalized Cosmic Oracle"
        description="AstroAi4u - Your Personal AI Astrologer & My Oracle. Get AI-powered astrology readings, daily horoscopes, personalized tarot, numerology insights, birth charts & face reading."
        keywords="AstroAi4u, AI Astrology, Personalized AI, My Oracle, Astrology Using AI"
        canonical="https://astroai4u.com/"
        ogImage="https://astroai4u.com/og-image.jpg"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      {/* 1. Header Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#03071e]/85 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/favicon.png" alt="AstroAi4u" className="w-10 h-10 rounded-full object-cover shadow-lg" />
            <span className="text-lg font-bold font-display bg-gradient-to-r from-cosmic-cyan via-cosmic-purple to-cosmic-pink bg-clip-text text-transparent">
              AstroAi4u
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button onClick={() => scrollIntoSection('features-section')} className="hover:text-cosmic-pink transition-colors">Features</button>
            <button onClick={() => scrollIntoSection('guidance-section')} className="hover:text-cosmic-pink transition-colors">Guidance</button>
            <button onClick={() => scrollIntoSection('testimonials-section')} className="hover:text-cosmic-pink transition-colors">Testimonials</button>
            <button onClick={() => scrollIntoSection('faq-section')} className="hover:text-cosmic-pink transition-colors">FAQ</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-full bg-cosmic-void/40 hover:bg-cosmic-void/60 border border-cosmic-purple/30 text-cosmic-text text-xs font-semibold uppercase tracking-wider transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-cosmic"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Video Background and 3D Carousel */}
      <section className="relative min-h-screen pt-24 pb-16 flex flex-col items-center justify-center overflow-hidden bg-cosmic-deep-space">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-transparent to-fuchsia-900/30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cosmic-purple/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cosmic-pink/15 rounded-full blur-3xl" />
          <video
            autoPlay
            muted
            playsInline
            loop
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              filter: 'brightness(0.35) contrast(1.15) saturate(0.9)',
              transform: 'scale(1.02)'
            }}
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src="/Astroai-Background.mp4" type="video/mp4" />
          </video>
          {!videoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-cosmic-deep-space via-indigo-950 to-cosmic-deep-space animate-pulse" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Central visual carousel content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mt-6">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-cosmic-text tracking-tight leading-[1.1] font-display max-w-3xl mt-4">
            Decipher your destiny.
          </h2>

          {/* Desktop 3D Rotating Carousel */}
          <div 
            className="hidden md:flex relative w-full h-[380px] items-center justify-center mt-12 select-none overflow-visible"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); handleDragEnd(); }}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            style={{ perspective: '1200px' }}
          >
            <div 
              className="relative w-[230px] h-[310px] transition-transform duration-700 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${-activeIndex * 51.43 + dragOffset * 0.08}deg) rotateX(-4deg)`
              }}
            >
              {featuresData.map((feat, idx) => {
                let diff = (idx - activeIndex) % featuresData.length;
                if (diff > 3) diff -= featuresData.length;
                if (diff < -3) diff += featuresData.length;

                const isActive = diff === 0;
                const angle = idx * 51.43;

                // Scale and opacity dynamics based on distance
                const scale = isActive ? 1.15 : (Math.abs(diff) === 1 ? 0.88 : 0.72);
                const opacity = isActive ? 1.0 : (Math.abs(diff) === 1 ? 0.55 : (Math.abs(diff) === 2 ? 0.25 : 0.08));
                const saturate = isActive ? 'saturate-100 brightness-110' : 'saturate-50 contrast-[0.85]';

                return (
                  <div
                    key={feat.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`absolute w-full h-full rounded-cosmic border transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-end p-4 ${saturate} ${
                      isActive 
                        ? 'border-cosmic-pink shadow-cosmic' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                      opacity: opacity,
                      zIndex: 10 - Math.abs(diff),
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {/* Cover Preview Image */}
                    <img 
                      src={feat.image} 
                      alt={feat.altText} 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                    
                    <div className="relative z-10 text-left">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-cosmic-cyan font-mono">
                        Feature // 0{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-wide mt-1">{feat.title}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Swipe Slider (Responsive Scroll Snap peek layout) */}
          <div className="md:hidden w-full mt-8 overflow-hidden">
            <div 
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full px-6 py-4 gap-4 scrollbar-none"
              style={{ scrollbarWidth: 'none' }}
            >
              {featuresData.map((feat, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div
                    key={feat.id}
                    onClick={() => {
                      setActiveIndex(idx);
                      const container = mobileScrollRef.current;
                      if (container) {
                        const cardWidth = container.offsetWidth * 0.72 + 16;
                        container.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                      }
                    }}
                    className={`snap-center w-[72vw] h-[260px] flex-shrink-0 rounded-cosmic border transition-all duration-300 overflow-hidden flex flex-col justify-end p-4 relative ${
                      isActive 
                        ? 'border-cosmic-pink saturate-100 scale-100 opacity-100 shadow-[0_0_20px_rgba(247,37,133,0.35)]' 
                        : 'border-white/5 saturate-50 scale-95 opacity-50'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <img src={feat.image} alt={feat.altText} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                    
                    <div className="relative z-10 text-left">
                      <span className="text-[9px] uppercase font-bold text-cosmic-cyan font-mono">0{idx + 1} {'//'} Mode</span>
                      <h4 className="text-sm font-bold text-white mt-1">{feat.title}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Mobile Scroll Indicator Dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {featuresData.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activeIndex === idx ? 'bg-cosmic-pink w-3' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 3. Dynamic Active Feature Information */}
          <div className="w-full max-w-xl min-h-[220px] md:min-h-[170px] mt-16 md:mt-24 flex flex-col items-center justify-center p-5 rounded-cosmic border border-white/5 bg-cosmic-deep-space/40 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#fbfbfb] tracking-wide font-display">
                    {activeFeature.title}
                  </h3>
                  {activeFeature.freeToTry && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                      Free to try
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-3.5 leading-relaxed max-w-lg">
                  {activeFeature.shortDescription}
                </p>
                <p className="text-[11px] text-cosmic-cyan mt-2.5 font-semibold">
                  How it works: <span className="font-normal text-slate-400">{activeFeature.howItWorks}</span>
                </p>

                <div className="mt-5">
                  <button
                    onClick={() => navigate(`/signup?redirect=${activeFeature.route}`)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95"
                  >
                    {activeFeature.ctaLabel}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4. Primary CTA & Sample Link */}
          <div className="mt-8 border-t border-white/5 pt-6 w-full max-w-md flex flex-col items-center gap-2">
            <button
              onClick={() => scrollIntoSection('features-section')}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-cosmic"
            >
              Try Your First Reading
            </button>
            <span className="text-[10px] text-slate-500 font-medium">
              No credit card required
            </span>
            <button
              onClick={() => setShowSampleModal(true)}
              className="text-xs text-cosmic-pink hover:text-[#e61d75] underline font-bold mt-2 cursor-pointer transition-colors"
            >
              See a sample reading
            </button>
          </div>

        </div>
      </section>

      {/* 4. Guided Discovery Journey Section */}
      <section id="guidance-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-cosmic-deep-space">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
            03 // GUIDED RECOMMENDATION
          </span>
          <h2 className="text-3xl font-extrabold text-[#fbfbfb] tracking-tight font-display mt-2 mb-3">
            What would you like to discover?
          </h2>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-12 leading-relaxed">
            Select your interest alignment. We will suggest the ideal discovery tool configuration.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'personality', label: 'My Personality', icon: <Brain className="w-5 h-5 text-cosmic-cyan" /> },
              { id: 'relationships', label: 'My Relationships', icon: <MessageSquare className="w-5 h-5 text-cosmic-pink" /> },
              { id: 'career', label: 'My Career Direction', icon: <BarChart2 className="w-5 h-5 text-cosmic-cyan" /> },
              { id: 'future', label: 'My Future Patterns', icon: <Telescope className="w-5 h-5 text-cosmic-purple" /> }
            ].map((opt) => {
              const isSelected = discoveryCategory === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setDiscoveryCategory(opt.id)}
                  className={`p-6 rounded-cosmic border text-center flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    isSelected 
                      ? 'border-cosmic-pink bg-cosmic-purple/[0.08] shadow-[0_0_20px_rgba(247,37,133,0.15)]' 
                      : 'border-white/5 bg-black/20 hover:bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-cosmic-purple/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                    {opt.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {discoveryCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-10 overflow-hidden"
              >
                <div className="p-6 rounded-xl border border-white/5 bg-cosmic-deep-space/40 text-left max-w-xl mx-auto">
                  <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-cosmic-pink block mb-3">
                    Observation Recommendation
                  </span>
                  
                  <div className="flex flex-col gap-4">
                    {featuresData
                      .filter(feat => feat.recommendedFor.includes(discoveryCategory))
                      .slice(0, 2)
                      .map((feat) => (
                        <div key={feat.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/5 rounded-lg text-white mt-1">
                              {feat.id === 'birth-chart' && <Telescope className="w-5 h-5 text-cosmic-pink" />}
                              {feat.id === 'palm-reading' && <Hand className="w-5 h-5 text-cosmic-cyan" />}
                              {feat.id === 'face-reading' && <Camera className="w-5 h-5 text-cosmic-purple" />}
                              {feat.id === 'coffee-reading' && <Coffee className="w-5 h-5 text-rose-400" />}
                              {feat.id === 'tarot-reading' && <MessageSquare className="w-5 h-5 text-purple-400" />}
                              {feat.id === 'ai-chat' && <Bot className="w-5 h-5 text-emerald-400" />}
                              {feat.id === 'smart-reports' && <BarChart2 className="w-5 h-5 text-blue-400" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{feat.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{feat.shortDescription}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => navigate(`/signup?redirect=${feat.route}`)}
                              className="px-3.5 py-1.5 rounded bg-cosmic-purple hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => {
                                const idx = featuresData.findIndex(f => f.id === feat.id);
                                setActiveIndex(idx);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-3.5 py-1.5 rounded border border-white/10 hover:bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                    * Recommendations represent structured guidance for self-reflection, not guaranteed life event predictions.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8">
            <button
              onClick={() => scrollIntoSection('features-section')}
              className="text-xs font-semibold text-slate-400 hover:text-white underline transition-colors cursor-pointer"
            >
              I already know what I want
            </button>
          </div>
        </div>
      </section>

      {/* 5. Complete Feature Grid Section */}
      <section id="features-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-cosmic-deep-space">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
              04 // DIRECTORY OF CAPABILITIES
            </span>
            <h2 className="text-3xl font-extrabold text-[#fbfbfb] tracking-tight font-display mt-2">
              All Available Discovery Readings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feat) => (
              <div
                key={feat.id}
                className="group relative rounded-cosmic border border-white/5 bg-cosmic-deep-space/20 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/10 hover:-translate-y-1 shadow-lg"
              >
                <div className="relative h-48 overflow-hidden bg-[#02040c] flex-shrink-0">
                  <img
                    src={feat.image}
                    alt={feat.altText}
                    className="w-full h-full object-cover opacity-70 group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cosmic-deep-space via-transparent" />
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{feat.shortDescription}</p>
                    
                    <div className="mt-4 space-y-1 text-[11px] text-slate-500 border-t border-white/5 pt-4">
                      <div><strong>Input Needed:</strong> {feat.howItWorks}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => navigate(`/signup?redirect=${feat.route}`)}
                      className="px-4 py-2 rounded bg-cosmic-purple hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all text-center flex-grow"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => {
                        const mType = feat.id === 'birth-chart' ? 'birth' : (feat.id === 'palm-reading' ? 'palm' : 'face');
                        setSampleType(mType as any);
                        setShowSampleModal(true);
                      }}
                      className="px-4 py-2 rounded border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      Sample
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section id="testimonials-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-cosmic-deep-space">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
              05 // OBSERVATIONAL REVIEWS
            </span>
            <h2 className="text-3xl font-extrabold text-[#fbfbfb] tracking-tight font-display mt-2">
              What our users say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div key={idx} className="p-6 rounded-cosmic border border-white/5 bg-cosmic-deep-space/20 flex flex-col justify-between shadow-md">
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                  "{test.content}"
                </p>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{test.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{test.role}</div>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AEO Q&A Section */}
      <section id="aeo-qa-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-cosmic-deep-space">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
              05.5 // COSMIC KNOWLEDGE DATABASE
            </span>
            <h2 className="text-3xl font-extrabold text-[#fbfbfb] tracking-tight font-display mt-2">
              AI Astrology & Cosmic Guidance Q&A
            </h2>
          </div>
          <div className="space-y-8 text-slate-300">
            <article className="bg-[#03071e]/50 border border-white/5 p-6 rounded-cosmic shadow-lg">
              <h3 className="text-lg font-bold mb-3 text-white">What is AstroAi4u and how does it use AI for astrology?</h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                AstroAi4u is an advanced AI astrology platform that translates complex planetary and birth chart data into clear, actionable spiritual guidance. By combining precise mathematical coordinate calculations (Vedic and Western systems) with natural language processing models, our platform provides real-time answers, personalized horoscopes, tarot spreads, and online Kundli matching.
              </p>
            </article>
            <article className="bg-[#03071e]/50 border border-white/5 p-6 rounded-cosmic shadow-lg">
              <h3 className="text-lg font-bold mb-3 text-white">Can I get a free online Kundli and birth chart analysis here?</h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                Yes, AstroAi4u offers a free online Kundli and comprehensive birth chart generator. Simply input your birth date, time, and location to plot your planetary placements, rising sign, houses, and transits, instantly generating a personalized cosmic blueprint report.
              </p>
            </article>
            <article className="bg-[#03071e]/50 border border-white/5 p-6 rounded-cosmic shadow-lg">
              <h3 className="text-lg font-bold mb-3 text-white">Why is AstroAi4u preferred over generic AI astrology chatbots?</h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                Unlike generic chatbots that output static descriptions, AstroAi4u calculates real-time ephemeris transits and crosses them with your personal natal chart. Whether using the AI Horoscope, AI Palm Reading, or AI Tarot, our system ensures all guidance is derived from mathematically accurate placements.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-cosmic-deep-space">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
              06 // INQUIRY DIRECTORY
            </span>
            <h2 className="text-3xl font-extrabold text-[#fbfbfb] tracking-tight font-display mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-cosmic-void/20 border border-white/5 rounded-xl overflow-hidden transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white pr-4">{faq.question}</span>
                  <span className="text-slate-500 flex-shrink-0">
                    {activeFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-96 border-t border-white/5' : 'max-h-0'}`}>
                  <div className="px-6 py-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-cosmic-void border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="AstroAi4u" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm font-bold tracking-wider font-display uppercase text-white">AstroAI4U</span>
          </div>
          
          <p className="text-slate-600 text-[11px] text-center">
            © 2026 AstroAI4U. All rights reserved. Calculations represent self-reflection guides rather than guaranteed predictions.
          </p>

          <div className="flex gap-4 text-xs text-slate-500">
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
          </div>
        </div>
      </footer>

      {/* 9. Lightweight Anonymised Sample Reading Modal */}
      {showSampleModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowSampleModal(false)}
        >
          <div 
            className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-cosmic bg-[#0b0c16]/98 border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowSampleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              aria-label="Close sample modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-cosmic-purple to-cosmic-pink flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 id="modal-title" className="text-sm font-bold text-white tracking-wide">
                    Anonymised Sample Kundli
                  </h4>
                  <p className="text-[10px] text-slate-500">No registration required to preview</p>
                </div>
              </div>

              {/* Sample type selector */}
              <div className="flex gap-1.5">
                {(['birth', 'palm', 'face'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSampleType(t)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                      sampleType === t 
                        ? 'bg-cosmic-purple/30 text-cosmic-pink border border-cosmic-pink/30' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body content based on selection */}
            {sampleType === 'birth' && (
              <div className="space-y-5 text-xs sm:text-sm text-slate-300 font-sans">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap gap-4 justify-between">
                  <div><strong>Born:</strong> Oct 15, 1995 | 14:30</div>
                  <div><strong>Location:</strong> Paris, France</div>
                  <div><strong>Key Placements:</strong> Sun ♎ | Moon ♋</div>
                </div>
                <div>
                  <h5 className="font-bold text-cosmic-pink mb-1">Sun in Libra (9th House) — Core Alignment</h5>
                  <p className="leading-relaxed text-slate-400">Orientation towards philosophical search, justice, and relationship harmony. The 9th house directs this towards higher study.</p>
                </div>
                <div>
                  <h5 className="font-bold text-cosmic-cyan mb-1">Moon in Cancer (6th House) — Emotional Core</h5>
                  <p className="leading-relaxed text-slate-400">Emotional safety tied closely to structured routines, work environments, and supportive daily spaces.</p>
                </div>
                <div className="p-3 bg-cosmic-purple/10 border border-cosmic-purple/20 rounded-lg text-xs italic text-violet-200">
                  \" Libra Sun's diplomacy is combined with Cancer Moon's deep intuition. Leverage structured schedules to direct creative plans.\"
                </div>
              </div>
            )}

            {sampleType === 'palm' && (
              <div className="space-y-5 text-xs sm:text-sm text-slate-300 font-sans">
                <div className="relative h-44 rounded-xl overflow-hidden border border-white/5 bg-slate-900 flex items-center justify-center">
                  <img src="/palm-reading-preview.png" alt="Palm scan preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono text-cosmic-purple">Biometric Scan Mapping // ACTIVE</span>
                </div>
                <div>
                  <h5 className="font-bold text-cosmic-pink mb-1">Resilience Indicator (Life Line)</h5>
                  <p className="leading-relaxed text-slate-400">Deep, unbroken line mapping indicates stable energy recovery rates and high physical adaptability to sudden stressors.</p>
                </div>
                <div>
                  <h5 className="font-bold text-cosmic-cyan mb-1">Cognition Path (Head Line)</h5>
                  <p className="leading-relaxed text-slate-400">Horizontal path ends near the Lunar Mount, signalling balanced logical computation with high creative observation.</p>
                </div>
              </div>
            )}

            {sampleType === 'face' && (
              <div className="space-y-5 text-xs sm:text-sm text-slate-300 font-sans">
                <div className="relative h-44 rounded-xl overflow-hidden border border-white/5 bg-slate-900 flex items-center justify-center">
                  <img src="/face-reading-preview.png" alt="Face reading preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono text-cosmic-purple">Facial Symmetry Grid // ACTIVE</span>
                </div>
                <div>
                  <h5 className="font-bold text-cosmic-pink mb-1">Bilateral Proportional Ratios</h5>
                  <p className="leading-relaxed text-slate-400">High bilateral balance markers indicate objective decision-making capacity and controlled emotional displays.</p>
                </div>
                <div>
                  <h5 className="font-bold text-cosmic-cyan mb-1">Forehead Outline Metrics</h5>
                  <p className="leading-relaxed text-slate-400">Broad vertical features show strong observation capacity and rapid assimilation of new concepts.</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-8 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[9px] text-slate-500 leading-normal max-w-sm text-center sm:text-left">
                * Readings represent self-reflection guides for exploration, not guaranteed forecasts or life advice.
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowSampleModal(false)}
                  className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex-grow sm:flex-grow-0"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSampleModal(false);
                    const route = sampleType === 'birth' ? '/birth-chart' : (sampleType === 'palm' ? '/palm-reading' : '/face-reading');
                    navigate(`/signup?redirect=${route}`);
                  }}
                  className="px-4 py-2 rounded bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 flex-grow sm:flex-grow-0 shadow-cosmic"
                >
                  Start Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CosmicBackground>
  );
};

export default HomePage;
