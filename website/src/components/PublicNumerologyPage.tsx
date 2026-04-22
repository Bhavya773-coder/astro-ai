import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { SEO } from './SEO';
import { Hash, Calculator, Sparkles, ChevronRight, Target, Heart, Briefcase } from 'lucide-react';

const PublicNumerologyPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What is numerology and how does it work?',
      answer: 'Numerology is the study of numbers and their mystical significance in our lives. It works by analyzing the numerical values of your name and birth date to reveal insights about your personality, life path, and destiny. Each number (1-9, 11, 22, 33) carries specific vibrations and meanings.'
    },
    {
      question: 'What is a Life Path Number?',
      answer: 'Your Life Path Number is the most important number in numerology, calculated from your birth date. It reveals your core personality traits, natural talents, challenges, and the overall direction of your life journey. It\'s like your astrological sun sign in numerology.'
    },
    {
      question: 'How does AI enhance numerology readings?',
      answer: 'Our AI analyzes complex numerological patterns including your Life Path, Expression, Soul Urge, and Personality numbers. It synthesizes these calculations with modern insights to provide personalized guidance about career, relationships, and personal growth opportunities.'
    },
    {
      question: 'Can numerology predict my future?',
      answer: 'Numerology reveals patterns and tendencies based on your numbers, but it doesn\'t predict fixed future events. Instead, it shows potential opportunities, challenges, and optimal timing for decisions. Think of it as a roadmap highlighting the terrain ahead, not a predetermined destination.'
    },
    {
      question: 'What numbers are calculated in a full reading?',
      answer: 'A comprehensive numerology reading includes: Life Path Number (life purpose), Expression/Destiny Number (natural abilities), Soul Urge/Heart\'s Desire (inner motivations), Personality Number (outer expression), Birth Day Number (specific talents), and Personal Year cycles (timing).'
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
        title="Free Numerology Calculator | AI-Powered Life Path Reading | Astro AI"
        description="Discover your Life Path Number with our free AI numerology calculator. Get personalized insights about your destiny, personality, and future based on numerology."
        keywords="Free Numerology Calculator, Life Path Number, AI Numerology, Numerology Reading, Destiny Number"
        canonical="https://astroai4u.com/numerology-info"
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
              <Calculator className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">AI Numerology Calculator</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Life Path Number
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Uncover the hidden meaning of numbers in your life. Our AI-powered numerology 
              calculator reveals your destiny, personality traits, and cosmic vibrations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Calculate Your Numbers Free
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Your Numbers Reveal</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target className="w-8 h-8 text-violet-400" />,
                  title: 'Life Path Number',
                  description: 'Your core purpose and the journey you\'re meant to take in this lifetime. Reveals your natural strengths and the lessons you\'re here to learn.'
                },
                {
                  icon: <Heart className="w-8 h-8 text-fuchsia-400" />,
                  title: 'Soul Urge Number',
                  description: 'Your heart\'s deepest desires and what truly motivates you. Uncovers what you really want from life and relationships.'
                },
                {
                  icon: <Briefcase className="w-8 h-8 text-cyan-400" />,
                  title: 'Expression Number',
                  description: 'Your natural talents and how you express yourself to the world. Shows your potential for success and fulfillment.'
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

        {/* Numbers Grid */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">The Sacred Numbers</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={num} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all">
                  <div className="text-3xl font-bold text-violet-400 mb-2">{num}</div>
                  <p className="text-sm text-white/60">
                    {num === 1 && 'Leadership, Independence'}
                    {num === 2 && 'Harmony, Cooperation'}
                    {num === 3 && 'Creativity, Expression'}
                    {num === 4 && 'Stability, Structure'}
                    {num === 5 && 'Freedom, Adventure'}
                    {num === 6 && 'Love, Responsibility'}
                    {num === 7 && 'Wisdom, Spirituality'}
                    {num === 8 && 'Power, Abundance'}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-w-2xl mx-auto">
              {[9, 11, 22, 33].map((num) => (
                <div key={num} className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-fuchsia-400 mb-2">{num}</div>
                  <p className="text-sm text-white/60">
                    {num === 9 && 'Completion, Compassion'}
                    {num === 11 && 'Intuition, Illumination'}
                    {num === 22 && 'Master Builder'}
                    {num === 33 && 'Master Teacher'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">The Power of Numerology</h2>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Numerology is an ancient metaphysical science that studies the mystical relationship between numbers 
                and our lives. Dating back thousands of years to the teachings of Pythagoras, this practice reveals 
                how numbers influence our personality, relationships, career paths, and life events. Every number 
                carries a unique vibration that shapes our reality in profound ways.
              </p>
              
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                At the heart of numerology is the belief that the universe is mathematically precise and that numbers 
                are the universal language through which it communicates. Your birth date and name aren't random - 
                they're encoded with specific numerical patterns that describe your soul's journey. By understanding 
                these patterns, you gain insights into your strengths, challenges, opportunities, and optimal timing 
                for important decisions.
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Your Life Path Number is the cornerstone of numerological analysis. Calculated from your birth date, 
                it reveals the path you're meant to walk in this lifetime. Are you a natural leader (1), a diplomat (2), 
                a creative communicator (3), or a practical builder (4)? Each of the nine base numbers (1-9) and three 
                master numbers (11, 22, 33) carries distinct energies that influence every aspect of your existence.
              </p>

              <p className="text-white/70 text-lg leading-relaxed">
                At Astro AI, we combine traditional numerological wisdom with advanced artificial intelligence to 
                deliver readings that are both deeply personal and remarkably insightful. Our system analyzes multiple 
                numerological aspects - not just your Life Path, but also your Expression Number (derived from your 
                name), Soul Urge Number (your heart's desires), and Personality Number (how others see you). This 
                comprehensive approach gives you a complete picture of your numerological blueprint and helps you 
                navigate life with greater awareness and purpose.
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
              Decode Your Numerical Destiny
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Join thousands who have discovered their life path through the power of numbers.
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

export default PublicNumerologyPage;
