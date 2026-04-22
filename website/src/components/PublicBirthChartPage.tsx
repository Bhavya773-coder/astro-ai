import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { SEO } from './SEO';
import { Moon, Star, Sparkles, ChevronRight, Sun, MapPin, Clock } from 'lucide-react';

const PublicBirthChartPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What is a birth chart (natal chart)?',
      answer: 'A birth chart, also called a natal chart, is a map of where all the planets were in their journey around the Sun at the exact moment you were born. It reveals your personality traits, strengths, challenges, and life purpose.'
    },
    {
      question: 'What information do I need for a birth chart reading?',
      answer: 'To generate an accurate birth chart, you need your exact birth date, birth time (as precise as possible), and birth location (city, state/country). The birth time is crucial for determining your rising sign and house placements.'
    },
    {
      question: 'How is AI used in birth chart analysis?',
      answer: 'Our AI system interprets complex astrological data including planet positions, aspects, houses, and transits. It synthesizes this information into personalized insights about your personality, relationships, career path, and life events.'
    },
    {
      question: 'What can I learn from my birth chart?',
      answer: 'Your birth chart reveals your sun sign (core identity), moon sign (emotional nature), rising sign (outward personality), planetary positions in houses (life areas), and aspects (relationships between planets). This provides insights into career, love, strengths, and growth areas.'
    },
    {
      question: 'Is Vedic or Western astrology used?',
      answer: 'Astro AI primarily uses Western astrology with tropical zodiac calculations. However, we incorporate elements from various astrological traditions to provide comprehensive insights that resonate with modern life.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <CosmicBackground>
      <SEO
        title="Free Birth Chart Analysis | AI-Powered Natal Chart | Astro AI"
        description="Get your free AI-powered birth chart analysis. Discover your cosmic blueprint, sun sign, moon sign, rising sign, and personalized astrological insights."
        keywords="Free Birth Chart, Natal Chart Analysis, AI Astrology Birth Chart, Vedic Birth Chart, Sun Moon Rising Signs"
        canonical="https://astroai4u.com/birth-chart-info"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="min-h-screen text-white">
        {/* Header */}
        <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="AstroAi4u" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold font-display bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                AstroAi4u
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Moon className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Free Natal Chart Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Cosmic Blueprint
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Generate your personalized birth chart with AI-powered analysis. 
              Uncover the secrets of your sun, moon, and rising signs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Create Your Free Chart
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What's In Your Birth Chart</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sun className="w-8 h-8 text-yellow-400" />,
                  title: 'Sun Sign',
                  description: 'Your core identity, ego, and conscious self. Represents your basic personality and what drives you at a fundamental level.'
                },
                {
                  icon: <Moon className="w-8 h-8 text-violet-400" />,
                  title: 'Moon Sign',
                  description: 'Your emotional nature, instincts, and subconscious patterns. Reveals how you process feelings and your inner world.'
                },
                {
                  icon: <Star className="w-8 h-8 text-cyan-400" />,
                  title: 'Rising Sign (Ascendant)',
                  description: 'Your outward personality, first impressions, and approach to life. The mask you wear and how others perceive you.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Grid */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-fuchsia-400" />
                  <h3 className="text-xl font-bold">Why Birth Time Matters</h3>
                </div>
                <p className="text-white/60 leading-relaxed">
                  Your exact birth time determines your rising sign and the placement of planets in the 12 astrological houses. 
                  Even a few minutes can change your rising sign and significantly alter your chart interpretation. 
                  The more precise your birth time, the more accurate your astrological insights will be.
                </p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold">Location Significance</h3>
                </div>
                <p className="text-white/60 leading-relaxed">
                  Your birthplace determines the planetary house placements in your chart. 
                  Different locations on Earth have unique perspectives of the sky, 
                  affecting which planets appear in which life areas (houses). 
                  This geographical context personalizes your astrological blueprint.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Understanding Birth Chart Astrology</h2>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                A birth chart is like a cosmic fingerprint - unique to you and you alone. It's calculated based on 
                the exact position of the Sun, Moon, planets, and other celestial bodies at the moment you took 
                your first breath. This celestial snapshot creates a map that astrologers have used for millennia 
                to understand human nature and destiny.
              </p>
              
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Your birth chart consists of multiple layers of meaning. The zodiac signs show the "how" - the style 
                and approach of planetary energies. The planets represent the "what" - different forces and drives in 
                your psyche. The houses indicate the "where" - which life areas these energies manifest. Finally, 
                aspects (angles between planets) describe how these energies interact and create your unique personality.
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                At Astro AI, we combine this ancient wisdom with modern artificial intelligence. Our system analyzes 
                thousands of astrological patterns and their real-world correlations to provide insights that are both 
                deeply personal and remarkably accurate. Whether you're exploring your career path, seeking relationship 
                guidance, or understanding your spiritual journey, your birth chart offers a roadmap to self-discovery.
              </p>

              <p className="text-white/70 text-lg leading-relaxed">
                The three most important elements in any birth chart are the Sun (your core self), Moon (your emotional 
                nature), and Rising sign (your outer personality). Together, these form what's called the "Big Three" 
                in astrology - providing a foundation for understanding who you are, what you need, and how you appear 
                to the world. Our AI-powered analysis goes deeper, examining all planetary placements to give you 
                comprehensive insights into your strengths, challenges, and opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-violet-400" />
                    {faq.question}
                  </h3>
                  <p className="text-white/60 pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unlock Your Astrological Blueprint
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Join thousands who have discovered deeper self-understanding through their birth chart.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
            >
              Get Started Free
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="AstroAi4u" className="w-8 h-8 rounded-lg" />
              <span className="font-bold">AstroAi4u</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-white/40">
              © 2024 AstroAi4u. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </CosmicBackground>
  );
};

export default PublicBirthChartPage;
