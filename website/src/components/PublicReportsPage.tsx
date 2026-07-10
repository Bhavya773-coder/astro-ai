import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { SEO } from './SEO';
import { FileText, Sparkles, ChevronRight, Heart, Users, Calendar, Star } from 'lucide-react';

const PublicReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What is a Kundli and what types are available?',
      answer: 'A Kundli is a Vedic birth chart mapping the planetary alignments at the exact moment of your birth. We offer comprehensive Kundli readings and compatibility analysis (Kundli Matching), birth chart interpretations, yearly forecast guides, career direction, and personal development guides. Each analysis is AI-generated based on your birth coordinates.'
    },
    {
      question: 'How accurate are AI-generated Kundlis and astrological reports?',
      answer: 'Our AI calculations combine traditional Vedic and Western astrological math with advanced language models. They consider exact degrees, aspects, house placements, and transits to provide self-reflection insights. Users report highly relevant and accurate readings that align with their life journeys.'
    },
    {
      question: 'What information do I need to calculate a Kundli?',
      answer: 'To calculate a precise Kundli, you need your birth date, birth time (down to the minute, if possible), and birth city. For Kundli Matching (compatibility), you will need these birth details for both individuals.'
    },
    {
      question: 'Can I download or share my Kundli analysis?',
      answer: 'Yes! All Kundli charts and astrological readings can be viewed online, downloaded as PDF files, or shared via secure unique links with friends or family.'
    },
    {
      question: 'How often should I generate new Kundlis or transits?',
      answer: 'Your natal Kundli birth chart is lifetime-valid because it maps your birth moment. However, transit forecast charts are time-sensitive - yearly forecasts are calculated annually, and monthly transits monthly to keep track of planetary movements.'
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
        title="Free Kundli Online | Compatibility & Astrology Forecasts | AstroAi4u"
        description="Generate free AI-powered Kundli and compatibility reports. Get detailed birth chart matching, yearly forecasts, and personalized Vedic astrological insights."
        keywords="Free Kundli Online, Kundli Matching, Vedic Horoscope, Natal Chart, AstroAi4u"
        canonical="https://astroai4u.com/reports-info"
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
              <FileText className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">AI-Powered Kundli</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Your Personal{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Online Kundli
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Generate comprehensive Kundli and compatibility matching powered by artificial intelligence. 
              Discover Vedic forecasts, natal chart analysis, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Free Kundli
              </button>
            </div>
          </div>
        </section>

        {/* Kundli Types */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Available Kundli Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Heart className="w-6 h-6 text-rose-400" />,
                  title: 'Kundli Matching & Compatibility',
                  description: 'Discover relationship dynamics, strengths, challenges, and long-term potential with partners, friends, or colleagues.',
                  features: ['Synastry Analysis', 'Composite Chart', 'Relationship Timing']
                },
                {
                  icon: <Star className="w-6 h-6 text-violet-400" />,
                  title: 'Vedic Birth Chart (Kundli)',
                  description: 'Complete interpretation of your natal chart including planetary placements, aspects, houses, and life themes.',
                  features: ['Planetary Positions', 'House Analysis', 'Aspect Interpretations']
                },
                {
                  icon: <Calendar className="w-6 h-6 text-cyan-400" />,
                  title: 'Yearly Forecast',
                  description: '12-month prediction report with major transits, opportunities, challenges, and optimal timing for decisions.',
                  features: ['Major Transits', 'Opportunity Windows', 'Challenge Periods']
                },
                {
                  icon: <Users className="w-6 h-6 text-fuchsia-400" />,
                  title: 'Career Guidance Report',
                  description: 'Professional insights based on your chart including ideal career paths, timing for changes, and success strategies.',
                  features: ['Career Strengths', 'Optimal Timing', 'Success Strategies']
                }
              ].map((report, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      {report.icon}
                    </div>
                    <h3 className="text-xl font-bold">{report.title}</h3>
                  </div>
                  <p className="text-white/60 mb-4">{report.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {report.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-violet-500/10 text-violet-300 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Enter Your Details',
                  description: 'Provide your birth date, time, and location. The more accurate, the better your Kundli.'
                },
                {
                  step: '02',
                  title: 'AI Analysis',
                  description: 'Our AI calculates your chart and analyzes planetary positions, aspects, and transits.'
                },
                {
                  step: '03',
                  title: 'Get Your Kundli',
                  description: 'Receive a comprehensive PDF report with personalized insights you can read anytime.'
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-violet-400 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">The Power of AI Kundli Charts</h2>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Kundli charts have guided seekers for centuries, providing insights into relationships, 
                career timing, personal growth, and life purpose. At AstroAi4u, we've transformed this ancient 
                practice by combining it with cutting-edge artificial intelligence to deliver personalized 
                interpretations that are both comprehensive and easy to understand.
              </p>
              
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Our compatibility Kundlis go beyond simple sun sign matching. They analyze the complete 
                astrological charts of both individuals, examining planetary aspects, house overlays, 
                and elemental compatibility. You'll understand not just whether you're compatible, but 
                exactly how your energies interact - where you naturally connect, where you might clash, 
                and how to navigate challenges together.
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Yearly forecast Kundlis provide a roadmap for the months ahead. Our AI analyzes upcoming 
                planetary transits and their impact on your specific birth chart. You'll know when 
                opportunities are likely to arise, when to be cautious, and how to make the most of 
                cosmic energies throughout the year. This isn't about predicting fixed events - it's 
                about understanding the energetic weather so you can sail smoothly through any conditions.
              </p>

              <p className="text-white/70 text-lg leading-relaxed">
                Every Kundli is generated instantly and delivered as a beautifully formatted PDF 
                that you can read, share, or print. Whether you're seeking clarity about a relationship, 
                planning career moves, or simply curious about your cosmic blueprint, our AI-powered 
                system provides the insights you need to navigate life with greater awareness and 
                confidence. The stars have wisdom to share - let us help you understand their message.
              </p>
            </div>
          </div>
        </section>

        {/* AEO Q&A Section */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Vedic Kundli & Astrology Q&A
            </h2>
            <div className="space-y-8 text-white/85">
              <article className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-3 text-white">What is a Kundli and how is it used in astrology?</h3>
                <p className="leading-relaxed">
                  A Kundli (also known as a Janam Kundli or birth chart) is an astrological map of the cosmos at the exact time and location of an individual's birth. Used widely in Vedic astrology, it diagrams the positioning of the Sun, Moon, and planets across the 12 houses to outline personality traits, career paths, relationship compatibility, and future life events.
                </p>
              </article>
              <article className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-3 text-white">How does AstroAi4u provide Kundli matching?</h3>
                <p className="leading-relaxed">
                  AstroAi4u performs digital Kundli matching by cross-analyzing the birth charts of two individuals. The system evaluates key planetary aspects, emotional alignment (Moon signs), and overall compatibility metrics in real-time, providing immediate guidance to help partners understand how their celestial energies interact.
                </p>
              </article>
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
              Generate Your First Kundli Today
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Join thousands who have discovered cosmic insights through personalized Kundli charts.
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

export default PublicReportsPage;
