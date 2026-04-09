import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicBackground from './CosmicBackground';
import { Telescope, Hash, BarChart2, Bot, Mail, Camera, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

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
      {/* Hero Section with Video Background */}
      <div className="relative overflow-hidden" style={{ height: '100vh' }}>
        {/* Background Effects with Video */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-transparent to-amber-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,139,250,0.1)_0%,transparent_70%)]" />

          {/* Video Background */}
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                filter: 'brightness(0.7) contrast(1.1)',
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
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 100%)'
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/favicon.png" alt="AstroAI" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg" />
              <div className="px-3 sm:px-4 py-2 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-lg sm:text-xl font-bold font-display bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                  AstroAI
                </div>
                <div className="text-xs sm:text-sm text-white/90 block sm:hidden">Connect with Universe</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/referral', { state: { destination: '/login' } })}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-sm sm:text-sm font-medium transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/referral', { state: { destination: '/signup' } })}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 text-sm sm:text-sm font-semibold transition-all duration-300 shadow-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Minimal to showcase video */}
        <main className="relative z-10 flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center">

          </div>
        </main>
      </div>

      {/* Upcoming Features Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-white via-amber-200 to-violet-300 bg-clip-text text-transparent">
              Coming Soon
            </h2>
            <p className="mt-4 text-lg text-sky-300 font-medium">Exciting new features on the horizon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coffee Reading */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 hover:border-amber-400/30 transition-all duration-300">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src="./coffee.jpg"
                    alt="Coffee Reading"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Coffee Reading</h3>
                <p className="text-white/85 text-sm">Discover insights through the ancient art of coffee</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Palm Reading */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 hover:border-violet-400/30 transition-all duration-300">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src="./PalmReading.webp"
                    alt="Palm Reading"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Palm Reading</h3>
                <p className="text-white/85 text-sm">Unveil your destiny through the lines of your hand</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Face Reading */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 hover:border-cyan-400/30 transition-all duration-300">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src="./face-reading.jpg"
                    alt="Face Reading"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Face Reading</h3>
                <p className="text-white/85 text-sm">Explore personality traits through facial analysis</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
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
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-amber-200 to-violet-300 bg-clip-text text-transparent">
              What Can You Explore?
            </h2>
            <p className="mt-4 text-xl text-sky-300 font-medium">Find clarity through every cosmic tool</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Birth Chart */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-amber-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6">
                  <Telescope className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold mb-3">Birth Chart</h3>
                <p className="text-white/85 leading-relaxed">
                  Discover your cosmic blueprint with detailed zodiac insights, planetary positions, and astrological wisdom.
                </p>
              </div>
            </div>

            {/* Numerology */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-violet-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mb-6">
                  <Hash className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Numerology</h3>
                <p className="text-white/85 leading-relaxed">
                  Calculate your life path number, destiny number, and unlock hidden meanings behind your birth date.
                </p>
              </div>
            </div>

            {/* Reports */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-blue-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reports</h3>
                <p className="text-white/85 leading-relaxed">
                  Generate comprehensive compatibility reports and track your spiritual growth with detailed analytics.
                </p>
              </div>
            </div>

            {/* AI Chat */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-amber-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-green-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Guidance</h3>
                <p className="text-white/85 leading-relaxed">
                  Chat with our AI astrologer for personalized insights and answers to your cosmic questions.
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
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-amber-200 to-violet-300 bg-clip-text text-transparent">
              Discover the Wisdom of the Stars
            </h2>
            <p className="mt-4 text-xl text-sky-300 font-medium">Ancient knowledge meets modern insight</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* The 12 Zodiac Signs */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
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
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white via-amber-200 to-violet-300 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-sky-300 font-medium">Everything you need to know about AstroAI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
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
      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-black/50 to-transparent border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/favicon.png" alt="AstroAI" className="w-9 h-9 rounded-full object-cover" />
                <h3 className="text-xl font-bold font-display bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                  AstroAI
                </h3>
              </div>
              <p className="text-white/85 leading-relaxed">
                Your cosmic companion for self-discovery and spiritual growth through astrology and numerology.
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
                <li><button className="text-white/90 hover:text-amber-300 transition-colors">Astrology Guide</button></li>
                <li><button className="text-white/90 hover:text-amber-300 transition-colors">Numerology Basics</button></li>
                <li><button className="text-white/90 hover:text-amber-300 transition-colors">Blog & Articles</button></li>
                <li><button className="text-white/90 hover:text-amber-300 transition-colors">Video Tutorials</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><button className="text-white/80 hover:text-amber-300 transition-colors">Help Center</button></li>
                <li><button className="text-white/80 hover:text-amber-300 transition-colors">Contact Us</button></li>
                <li><button className="text-white/80 hover:text-amber-300 transition-colors">Privacy Policy</button></li>
                <li><button className="text-white/80 hover:text-amber-300 transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/75 text-sm">
                © 2024 AstroAI. All rights reserved. Made with <Sparkles className="w-4 h-4 inline text-violet-400" /> and cosmic energy.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <button className="text-white/70 hover:text-amber-300 text-sm transition-colors">Privacy</button>
                <button className="text-white/70 hover:text-amber-300 text-sm transition-colors">Terms</button>
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
