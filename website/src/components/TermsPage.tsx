import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import { ChevronLeft, FileText, Gavel, CheckCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
              <p className="text-fuchsia-400 font-medium">Agreement for our cosmic journey together.</p>
            </div>
          </div>

          <div className="space-y-12">
            <section className="p-8 border border-white/5 bg-white/5 rounded-2xl relative">
              <Gavel className="absolute right-6 top-6 w-12 h-12 text-white/10" />
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-4">
                <CheckCircle className="w-6 h-6 text-fuchsia-400" />
                Agreement to Terms
              </h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                By accessing or using the AstroAi4u platform, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use our services.
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white border-l-4 border-violet-500 pl-4">1. Acceptance of Services</h3>
              <p className="text-white/65 leading-relaxed">
                AstroAi4u provides AI-generated astrological interpretations, numerology charts, and style recommendations for informational and entertainment purposes only. We do not provide financial, legal, or medical advice.
              </p>

              <h3 className="text-xl font-bold text-white border-l-4 border-fuchsia-500 pl-4">2. User Conduct</h3>
              <p className="text-white/65 leading-relaxed">
                You agree not to use our AI chat or platform for any unlawful purpose, or to upload any content that is harmful, offensive, or violates third-party rights.
              </p>

              <h3 className="text-xl font-bold text-white border-l-4 border-cyan-500 pl-4">3. Premium Subscriptions</h3>
              <p className="text-white/65 leading-relaxed">
                Certain features of AstroAi4u may requires a premium subscription. All fees are non-refundable unless stated otherwise.
              </p>
            </section>

            <div className="text-center italic text-white/30 text-sm py-8 border-t border-white/10">
              "To walk among the stars, we must first follow the laws of the Earth."<br />
              Last Updated: April 11, 2026
            </div>
          </div>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default TermsPage;
