import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import { ChevronLeft, HelpCircle, Book, Search, Star } from 'lucide-react';

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How accurate are the AI's interpretations?",
      answer: "AstroAi4u combines centuries-old astrological calculations with sophisticated planetary algorithms. While it provides deep symbolic guidance, we recommend you use it as an interactive tool for self-reflection and personal insight."
    },
    {
      question: "Can I change my birth details later?",
      answer: "Yes. You can update your birth details, time, and location anytime via your Profile Settings. These updates will automatically recalibrate your entire cosmic dashboard."
    },
    {
      question: "How do I interpret my birth chart?",
      answer: "Our AI provides a step-by-step breakdown of your Moon sign, Rising sign, and major planetary aspects. We suggest starting with the AI Astrologer Chat for more personalized guidance."
    }
  ];

  return (
    <CosmicBackground className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <GlassCard className="p-8 sm:p-12 bg-black/60 border border-violet-500/30 backdrop-blur-xl" glow="purple">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Help Center</h1>
              <p className="text-fuchsia-400 font-medium">Find wisdom and guidance here.</p>
            </div>
          </div>

          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search cosmic wisdom..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Book className="w-5 h-5 text-fuchsia-400" />
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-violet-400" />
                  {faq.question}
                </h3>
                <p className="text-white/60 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default HelpCenterPage;
