import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { SEO } from './SEO';
import { FileText, Sparkles, ChevronRight, Heart, Users, Calendar, Star } from 'lucide-react';

const PublicReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What types of astrology reports are available?',
      answer: 'We offer comprehensive reports including: Compatibility Analysis (relationship insights), Birth Chart Analysis (complete natal chart interpretation), Yearly Forecast (12-month predictions), Career Guidance Report, Love & Relationship Report, and Personal Growth Analysis. Each report is AI-generated based on your unique astrological data.'
    },
    {
      question: 'How accurate are AI-generated astrology reports?',
      answer: 'Our AI reports combine traditional astrological calculations with modern data analysis. They consider planetary positions, aspects, transits, and your birth chart to provide insights. While astrology is for entertainment and self-reflection purposes, users report high satisfaction with the relevance and accuracy of personalized insights.'
    },
    {
      question: 'What information do I need to generate a report?',
      answer: 'Most reports require your birth date, birth time, and birth location. For compatibility reports, you\'ll need this information for both people. The more accurate your birth time, the more precise your report will be, especially for timing-related predictions.'
    },
    {
      question: 'Can I download or share my reports?',
      answer: 'Yes! All reports can be viewed online, downloaded as PDF files for offline reading, and shared via unique links. You can also print them or save them to your device for future reference. Shared links let friends view your insights without accessing your account.'
    },
    {
      question: 'How often should I generate new reports?',
      answer: 'Birth chart analysis is timeless since it\'s based on your natal chart. However, forecast reports are time-sensitive - yearly forecasts are best regenerated annually, monthly forecasts monthly, and transit reports whenever you want current cosmic insights for specific decisions.'
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
        title="Free Astrology Reports | Compatibility & Forecasts | Astro AI"
        description="Generate free AI-powered astrology reports. Get compatibility analysis, yearly forecasts, birth chart insights, and personalized astrological reports."
        keywords="Free Astrology Reports, Compatibility Report, Birth Chart Report, Yearly Forecast, AI Astrology Report"
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
              <img src="/favicon.png" alt="AstroAI" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold font-display bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                AstroAI
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
              <span className="text-sm font-medium text-violet-300">AI-Powered Reports</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Your Personal{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Astrology Reports
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Generate comprehensive astrology reports powered by artificial intelligence. 
              Discover compatibility, yearly forecasts, birth chart analysis, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Free Report
              </button>
            </div>
          </div>
        </section>

        {/* Report Types */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Available Report Types</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Heart className="w-6 h-6 text-rose-400" />,
                  title: 'Compatibility Analysis',
                  description: 'Discover relationship dynamics, strengths, challenges, and long-term potential with partners, friends, or colleagues.',
                  features: ['Synastry Analysis', 'Composite Chart', 'Relationship Timing']
                },
                {
                  icon: <Star className="w-6 h-6 text-violet-400" />,
                  title: 'Birth Chart Analysis',
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
                  description: 'Provide your birth date, time, and location. The more accurate, the better your report.'
                },
                {
                  step: '02',
                  title: 'AI Analysis',
                  description: 'Our AI calculates your chart and analyzes planetary positions, aspects, and transits.'
                },
                {
                  step: '03',
                  title: 'Get Your Report',
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
            <h2 className="text-3xl font-bold mb-8">The Power of Astrological Reports</h2>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Astrology reports have guided people for centuries, providing insights into relationships, 
                career timing, personal growth, and life purpose. At Astro AI, we've transformed this ancient 
                practice by combining it with cutting-edge artificial intelligence to deliver personalized 
                reports that are both comprehensive and easy to understand.
              </p>
              
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Our compatibility reports go beyond simple sun sign matching. They analyze the complete 
                astrological charts of both individuals, examining planetary aspects, house overlays, 
                and elemental compatibility. You'll understand not just whether you're compatible, but 
                exactly how your energies interact - where you naturally connect, where you might clash, 
                and how to navigate challenges together.
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Yearly forecast reports provide a roadmap for the months ahead. Our AI analyzes upcoming 
                planetary transits and their impact on your specific birth chart. You'll know when 
                opportunities are likely to arise, when to be cautious, and how to make the most of 
                cosmic energies throughout the year. This isn't about predicting fixed events - it's 
                about understanding the energetic weather so you can sail smoothly through any conditions.
              </p>

              <p className="text-white/70 text-lg leading-relaxed">
                Every report is generated instantly and delivered as a beautifully formatted PDF 
                that you can read, share, or print. Whether you're seeking clarity about a relationship, 
                planning career moves, or simply curious about your cosmic blueprint, our AI-powered 
                reports provide the insights you need to navigate life with greater awareness and 
                confidence. The stars have wisdom to share - let us help you understand their message.
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
              Generate Your First Report Today
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Join thousands who have discovered cosmic insights through personalized astrology reports.
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
              <img src="/favicon.png" alt="AstroAI" className="w-8 h-8 rounded-lg" />
              <span className="font-bold">AstroAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-white/40">
              © 2024 AstroAI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </CosmicBackground>
  );
};

export default PublicReportsPage;
