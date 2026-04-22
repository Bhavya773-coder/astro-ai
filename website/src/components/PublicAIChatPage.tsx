import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { SEO } from './SEO';
import { MessageSquare, Sparkles, ChevronRight, Brain, Zap, Shield } from 'lucide-react';

const PublicAIChatPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What is the AI Astrologer Chat?',
      answer: 'The AI Astrologer Chat is an advanced conversational AI trained in astrological knowledge. It combines traditional astrology with modern AI to answer your questions about horoscopes, birth charts, numerology, relationships, career guidance, and cosmic timing - all in real-time conversation.'
    },
    {
      question: 'How does the AI know about astrology?',
      answer: 'Our AI has been trained on extensive astrological texts, birth chart interpretations, planetary transits, and cosmic patterns. It understands zodiac signs, houses, aspects, and can synthesize this knowledge with your personal profile data to give contextual readings.'
    },
    {
      question: 'Can I ask any type of question?',
      answer: 'Yes! You can ask about daily horoscopes, relationship compatibility, career timing, personal growth, planetary transits, and general astrological guidance. The AI adapts to your questions and provides insights based on your zodiac sign and astrological profile.'
    },
    {
      question: 'Is the AI astrologer available 24/7?',
      answer: "Absolutely! Unlike human astrologers who have limited availability, our AI astrologer is available around the clock. Whether it's 3 AM or 3 PM, you can get instant astrological guidance whenever you need it."
    },
    {
      question: 'How is this different from generic AI chatbots?',
      answer: 'Unlike generic chatbots, our AI is specifically trained in astrological sciences and integrated with your personal birth chart data. It understands astrological terminology, interprets planetary positions, and provides insights that are personalized to your unique cosmic profile.'
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
        title="AI Astrologer Chat | Free AI-Powered Astrology | Astro AI"
        description="Chat with our AI astrologer 24/7. Get instant personalized astrological guidance, horoscope readings, birth chart insights, and cosmic advice powered by artificial intelligence."
        keywords="AI Astrologer Chat, AI Astrology, Chat with Astrologer, AI Horoscope, Astrology AI Bot"
        canonical="https://astroai4u.com/ai-astrologer"
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
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">24/7 AI Astrologer</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Chat With Your{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                AI Astrologer
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Get instant, personalized astrological guidance anytime. Our AI astrologer 
              combines ancient wisdom with modern technology to answer your cosmic questions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start Chatting Free
              </button>
            </div>
          </div>
        </section>

        {/* Chat Preview */}
        <section className="relative z-10 py-16 px-4 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Astro AI</h3>
                  <p className="text-xs text-white/60">Your Personal AI Astrologer</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-white/60">Online</span>
                </div>
              </div>

              {/* Chat Messages Preview */}
              <div className="space-y-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                    <p className="text-sm text-white/90">
                      Hello! I'm your AI astrologer. I can help you with horoscope readings, 
                      birth chart insights, relationship compatibility, and answer any 
                      cosmic questions you have. What would you like to know today?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl rounded-tr-sm p-4 max-w-[80%]">
                    <p className="text-sm text-white">
                      What does my birth chart say about my career path?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                    <p className="text-sm text-white/90">
                      Based on your Leo Sun in the 10th house, you have natural leadership 
                      abilities that shine in your career. Your Capricorn Moon suggests you 
                      value stability and long-term success. Consider roles that let you 
                      lead while building something lasting...
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 text-sm">
                  Type your cosmic question...
                </div>
                <button className="px-4 py-2 bg-violet-600/50 rounded-xl text-white/50 cursor-not-allowed">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Chat With AI Astrologer?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Brain className="w-8 h-8 text-violet-400" />,
                  title: 'Expert Knowledge',
                  description: 'Trained on extensive astrological texts, our AI understands zodiac signs, planetary transits, birth charts, and cosmic patterns to provide accurate insights.'
                },
                {
                  icon: <Zap className="w-8 h-8 text-fuchsia-400" />,
                  title: 'Instant Responses',
                  description: 'No waiting for appointments or email responses. Get immediate answers to your astrological questions any time of day or night.'
                },
                {
                  icon: <Shield className="w-8 h-8 text-cyan-400" />,
                  title: 'Private & Secure',
                  description: 'Your conversations are private and secure. Ask personal questions about relationships, career, or life decisions with complete confidentiality.'
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
            <h2 className="text-3xl font-bold mb-8">The Future of Astrological Guidance</h2>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Imagine having a personal astrologer available to you 24 hours a day, 7 days a week - 
                someone who knows your birth chart intimately, understands the current cosmic weather, 
                and can provide instant guidance whenever you need it. That's exactly what our AI 
                Astrologer Chat offers.
              </p>
              
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Traditional astrology consultations can be expensive and time-consuming. You need to 
                book appointments, wait for availability, and often pay premium rates for each session. 
                Our AI astrologer democratizes access to astrological wisdom, making it available 
                instantly and affordably to everyone who seeks cosmic guidance.
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-6">
                The AI doesn't just recite generic horoscope statements. It analyzes your complete 
                astrological profile - your sun sign, moon sign, rising sign, and the current planetary 
                transits affecting your chart. When you ask about your love life, career, or personal 
                growth, the AI considers your unique cosmic blueprint to provide personalized insights 
                that actually resonate with your situation.
              </p>

              <p className="text-white/70 text-lg leading-relaxed">
                Whether you're facing a major decision, seeking clarity about a relationship, wondering 
                about timing for important events, or simply curious about what the stars have to say 
                today, the AI Astrologer is here to help. It combines the wisdom of traditional astrology 
                with the speed and accessibility of modern AI technology. No judgment, no waiting - just 
                pure cosmic insight whenever you need it.
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
              Start Your Cosmic Conversation
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Join thousands who get instant astrological guidance from our AI astrologer.
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

export default PublicAIChatPage;
