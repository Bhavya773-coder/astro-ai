import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './CosmicUI';
import { Coins, Sparkles } from 'lucide-react';

interface PaywallOverlayProps {
  featureName: string;
  previewContent?: React.ReactNode;
}

const PaywallOverlay: React.FC<PaywallOverlayProps> = ({
  featureName,
  previewContent
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Blurred preview content */}
      {previewContent && (
        <div className="blur-[8px] opacity-50 pointer-events-none">
          {previewContent}
        </div>
      )}

      {/* Centered paywall card */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <GlassCard className="p-8 max-w-md mx-4 text-center bg-black/80 backdrop-blur-xl border border-fuchsia-500/30 shadow-[0_0_40px_rgba(217,70,239,0.3)]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Coins className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Insufficient Credits
          </h3>

          <p className="text-white/70 mb-2">
            {featureName} requires 1 credit per reading
          </p>

          <p className="text-fuchsia-400 mb-6">
            Get 100 credits for just ?99 or 300 credits for ?199
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/pro')}
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Buy Credits
            </button>

            <button
              onClick={() => navigate('/pro')}
              className="w-full py-3 px-6 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              View Credit Packs
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default PaywallOverlay;
