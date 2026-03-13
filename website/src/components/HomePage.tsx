import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Hero Section with Background Images */}
      <div className="relative overflow-hidden">
        {/* Background Effects with Images */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-transparent to-amber-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,139,250,0.1)_0%,transparent_70%)]" />
          
          {/* Background Images - Blended with UI */}
          <div className="absolute inset-0">
            {/* First background layer */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/download.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(30px) brightness(0.8)'
              }}
            />
            
            {/* Second background layer */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/ast-compressed.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'top right',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(50px) brightness(0.9)'
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-slate-900 font-bold text-xl font-display">A</span>
              </div>
              <div>
                <div className="text-xl font-bold font-display bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                  AstroAI
                </div>
                <div className="text-xs text-white/70">Connect with Universe</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-sm font-medium transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 text-sm font-semibold transition-all duration-300 shadow-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-violet-500/20 border border-amber-400/30 px-6 py-3 text-sm text-amber-200 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ✨ Personalized cosmic insights in minutes
              </div>

              {/* Main Heading */}
              <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-tight">
                <span className="block bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                  Connect with
                </span>
                <span className="block bg-gradient-to-r from-amber-400 via-violet-400 to-amber-400 bg-clip-text text-transparent mt-2">
                  Universe
                </span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 text-white/90">
                  Explore Your Inner Self
                </span>
              </h1>

              {/* Description */}
              <p className="mt-8 text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                Unlock daily tarot readings, moon phase guidance, crystal ball insights, and personalized birth chart analysis to find clarity and reconnect with your intuition.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Start Your Journey
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-lg font-medium transition-all duration-300 backdrop-blur-sm"
                >
                  I Already Have an Account
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Image Gallery Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              Cosmic Gallery
            </h2>
            <p className="mt-4 text-lg text-white/70">Explore the mystical beauty of the cosmos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <img 
                  src="/download.jpg" 
                  alt="Cosmic background 1" 
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/50" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold">Stellar Gateway</h3>
                  <p className="text-white/70 text-sm">Journey through the stars</p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <img 
                  src="/download (1).jpg" 
                  alt="Cosmic background 2" 
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/50" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold">Nebula Dreams</h3>
                  <p className="text-white/70 text-sm">Where magic begins</p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <img 
                  src="/ast-compressed.jpg" 
                  alt="Cosmic background 3" 
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/50" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold">Cosmic Energy</h3>
                  <p className="text-white/70 text-sm">Universal connection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={(el) => (sectionRefs.current['features'] = el)}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              What Can You Explore?
            </h2>
            <p className="mt-4 text-xl text-white/70">Find clarity through every cosmic tool</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Birth Chart */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-amber-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6">
                  <span className="text-2xl">🔮</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Birth Chart</h3>
                <p className="text-white/70 leading-relaxed">
                  Discover your cosmic blueprint with detailed zodiac insights, planetary positions, and astrological wisdom.
                </p>
              </div>
            </div>

            {/* Numerology */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-violet-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mb-6">
                  <span className="text-2xl">🔢</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Numerology</h3>
                <p className="text-white/70 leading-relaxed">
                  Calculate your life path number, destiny number, and unlock hidden meanings behind your birth date.
                </p>
              </div>
            </div>

            {/* Reports */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-blue-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Reports</h3>
                <p className="text-white/70 leading-relaxed">
                  Generate comprehensive compatibility reports and track your spiritual growth with detailed analytics.
                </p>
              </div>
            </div>

            {/* AI Chat */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-amber-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-green-400/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold mb-3">AI Guidance</h3>
                <p className="text-white/70 leading-relaxed">
                  Chat with our AI astrologer for personalized insights and answers to your cosmic questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={(el) => (sectionRefs.current['testimonials'] = el)}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-white/5 transition-all duration-1000 ${
          isVisible['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
              Real Stories, Real Guidance
            </h2>
            <p className="mt-4 text-xl text-white/70">See what our community has discovered</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-white/60 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        ref={(el) => (sectionRefs.current['faq'] = el)}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-white/70">Everything you need to know about AstroAI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
                >
                  <span className="text-lg font-semibold pr-4">{faq.question}</span>
                  <span className={`text-2xl transition-transform duration-300 ${activeFaq === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-8 pb-6 text-white/70 leading-relaxed">
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
              <h3 className="text-xl font-bold font-display mb-4 bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                AstroAI
              </h3>
              <p className="text-white/70 leading-relaxed">
                Your cosmic companion for self-discovery and spiritual growth through astrology and numerology.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  <span>📧</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  <span>🐦</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  <span>📷</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Products</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/birth-chart')} className="text-white/70 hover:text-white transition-colors">Birth Chart Analysis</button></li>
                <li><button onClick={() => navigate('/numerology')} className="text-white/70 hover:text-white transition-colors">Numerology Reports</button></li>
                <li><button onClick={() => navigate('/reports')} className="text-white/70 hover:text-white transition-colors">Compatibility Reports</button></li>
                <li><button onClick={() => navigate('/ai-chat')} className="text-white/70 hover:text-white transition-colors">AI Guidance</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2">
                <li><button className="text-white/70 hover:text-white transition-colors">Astrology Guide</button></li>
                <li><button className="text-white/70 hover:text-white transition-colors">Numerology Basics</button></li>
                <li><button className="text-white/70 hover:text-white transition-colors">Blog & Articles</button></li>
                <li><button className="text-white/70 hover:text-white transition-colors">Video Tutorials</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><button className="text-white/70 hover:text-white transition-colors">Help Center</button></li>
                <li><button className="text-white/70 hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="text-white/70 hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="text-white/70 hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 text-sm">
                © 2024 AstroAI. All rights reserved. Made with ✨ and cosmic energy.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <button className="text-white/60 hover:text-white text-sm transition-colors">Privacy</button>
                <button className="text-white/60 hover:text-white text-sm transition-colors">Terms</button>
                <button className="text-white/60 hover:text-white text-sm transition-colors">Cookies</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
