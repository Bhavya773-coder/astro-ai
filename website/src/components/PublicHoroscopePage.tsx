import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { SEO } from './SEO';
import { Star, Calendar, Sparkles, ChevronRight } from 'lucide-react';

const PublicHoroscopePage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What is a daily horoscope?',
      answer: 'A daily horoscope is an astrological forecast based on the current positions of celestial bodies, personalized for your zodiac sign. It provides insights about love, career, health, and opportunities for the day.'
    },
    {
      question: 'How accurate are AI-generated horoscopes?',
      answer: 'Our AI combines traditional astrological wisdom with modern astronomical data to provide personalized readings. While astrology is for entertainment purposes, our users report high satisfaction with the relevance of our insights.'
    },
    {
      question: 'Do I need my exact birth time for horoscope readings?',
      answer: 'For daily horoscopes, your zodiac sign (based on birth date) is sufficient. For more detailed birth chart analysis, exact birth time and location provide the most accurate results.'
    },
    {
      question: 'What zodiac signs can get readings?',
      answer: 'All 12 zodiac signs can receive personalized readings: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces.'
    },
    {
      question: 'Can horoscopes predict the future?',
      answer: 'Horoscopes provide guidance based on astrological patterns and cosmic energies. They offer insights into potential opportunities and challenges, helping you make informed decisions rather than predicting fixed outcomes.'
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
        title="Free Daily Horoscope | AI-Powered Astrology Readings | Astro AI"
        description="Get your free daily horoscope powered by AI. Personalized astrological insights for all zodiac signs. Discover what the stars have in store for you today."
        keywords="Free Daily Horoscope, AI Horoscope, Zodiac Readings, Astrology Today, Daily Star Sign"
        canonical="https://astroai4u.com/horoscope"
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
              <Star className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">AI-Powered Astrology</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Your Daily{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Horoscope
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Discover personalized astrological insights powered by artificial intelligence. 
              Get accurate daily readings for your zodiac sign and unlock the wisdom of the cosmos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Already Have Account
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What You'll Get</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Star className="w-8 h-8 text-violet-400" />,
                  title: 'Daily Insights',
                  description: 'Receive personalized daily readings based on your zodiac sign and current planetary positions.'
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-fuchsia-400" />,
                  title: 'AI-Powered Analysis',
                  description: 'Our advanced AI combines traditional astrology with modern data science for accurate predictions.'
                },
                {
                  icon: <Calendar className="w-8 h-8 text-cyan-400" />,
                  title: 'Weekly & Monthly',
                  description: 'Get comprehensive weekly and monthly forecasts to plan your life with cosmic guidance.'
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

        {/* Content Section */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Understanding Your Daily Horoscope</h2>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Astrology has guided humanity for thousands of years, offering insights into our personalities, 
                relationships, and life paths. At Astro AI, we've revolutionized this ancient practice by combining 
                it with cutting-edge artificial intelligence to deliver personalized horoscopes that are both 
                accurate and deeply meaningful.
              </p>
              
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Your daily horoscope is calculated based on the current positions of celestial bodies - the Sun, 
                Moon, planets, and stars - in relation to your zodiac sign. Our AI system analyzes these cosmic 
                patterns alongside your unique astrological profile to provide guidance on love, career, health, 
                finances, and personal growth.
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Whether you're a passionate Aries, a practical Taurus, a curious Gemini, or any of the twelve 
                zodiac signs, our AI-powered horoscope system adapts to your unique cosmic fingerprint. Each 
                reading considers your sun sign, moon sign, and rising sign to deliver comprehensive insights 
                that resonate with your life situation.
              </p>

              <p className="text-white/70 text-lg leading-relaxed">
                Beyond daily predictions, Astro AI helps you understand the deeper patterns at play in your life. 
                Our system identifies favorable times for important decisions, warns about potential challenges, 
                and highlights opportunities you might otherwise miss. It's like having a personal astrologer 
                available 24/7, ready to provide wisdom whenever you need it.
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
              Ready to Discover Your Cosmic Path?
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Join thousands of users who trust Astro AI for their daily astrological guidance.
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

export default PublicHoroscopePage;
