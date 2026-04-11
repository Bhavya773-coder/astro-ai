import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import { ChevronLeft, LifeBuoy, MessageCircle, HelpCircle } from 'lucide-react';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

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
              <LifeBuoy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Support</h1>
              <p className="text-fuchsia-400 font-medium">We're here to guide you through the stars.</p>
            </div>
          </div>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-fuchsia-400" />
                Technical Support
              </h2>
              <p>
                Encountering technical glitches in the cosmic matrix? Our team is standing by to resolve any issues with your profile, birth chart generation, or AI chat interactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-fuchsia-400" />
                Account Guidance
              </h2>
              <p>
                Need help managing your celestial subscription or updating your birth details? Reach out for personalized assistance with your account settings and preferences.
              </p>
            </section>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-center italic">
                "The universe is vast, but you are never alone on your journey."
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default SupportPage;
