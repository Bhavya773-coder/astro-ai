import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import { ChevronLeft, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

const PrivacyPage: React.FC = () => {
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
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-fuchsia-400 font-medium">Protecting your data across the digital cosmos.</p>
            </div>
          </div>

          <div className="space-y-12">
            <section className="p-8 bg-white/5 border border-white/10 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-violet-400" />
                Your Privacy at the Center
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                At AstroAI, we believe your personal data—especially your birth details and life insights—is sacred. Our platform is built on a foundation of "Privacy by Design." We do not sell your personal information to third parties.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 border border-fuchsia-500/20 bg-fuchsia-500/5 rounded-xl">
                  <EyeOff className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-sm font-medium">No Data Selling</span>
                </div>
                <div className="flex items-center gap-4 p-4 border border-violet-500/20 bg-violet-500/5 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-violet-400" />
                  <span className="text-sm font-medium">Encrypted Storage</span>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Informational Matrix</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-violet-500/40 pl-6 space-y-2">
                  <h3 className="text-lg font-bold text-white">Cosmic Data We Collect</h3>
                  <p className="text-white/60 text-sm">We only collect the data necessary for generating your astrology chart: name, birth date, time, and city.</p>
                </div>
                <div className="border-l-2 border-fuchsia-500/40 pl-6 space-y-2">
                  <h3 className="text-lg font-bold text-white">How Your Data is Used</h3>
                  <p className="text-white/60 text-sm">Your information is used to personalize our AI-driven insights, dressing style recommendations, and chat experiences.</p>
                </div>
                <div className="border-l-2 border-cyan-500/40 pl-6 space-y-2">
                  <h3 className="text-lg font-bold text-white">Your Control</h3>
                  <p className="text-white/60 text-sm">You have the absolute right to delete your profile and all associated cosmic history at any time through your dashboard.</p>
                </div>
              </div>
            </section>

            <div className="text-center italic text-white/30 text-sm py-8 border-t border-white/10">
              Last Updated: April 11, 2026<br />
              "Your information is stored in the cloud, protected by the stars."
            </div>
          </div>
        </GlassCard>
      </div>
    </CosmicBackground>
  );
};

export default PrivacyPage;
