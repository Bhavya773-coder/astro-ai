import React from 'react';
import { GlassCard, GradientText } from '../CosmicUI';
import { Zap, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface Trait {
  icon: string;
  text: string;
  type: 'positive' | 'warning' | 'neutral';
}

interface EnergyHeaderProps {
  energyLabel?: string;
  traits?: Trait[];
  onWhatShouldIDo: () => void;
  onShowPrediction: () => void;
  onRegenerate: () => void;
  zodiac?: string;
  isLoading?: boolean;
  isGeneratingAction?: boolean;
  isGeneratingPrediction?: boolean;
  shouldAnimateWhatShouldIDo?: boolean;
}

const EnergyHeader: React.FC<EnergyHeaderProps> = ({
  energyLabel,
  traits,
  onWhatShouldIDo,
  onShowPrediction,
  onRegenerate,
  isLoading,
  zodiac,
  isGeneratingAction,
  isGeneratingPrediction,
  shouldAnimateWhatShouldIDo
}) => {
  const getTraitStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-violet-500/10 border-violet-500/30 text-violet-400';
    }
  };

  return (
    <div className="mb-20 animate-fade-in" id="energy-header">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <p className="text-fuchsia-400 text-[10px] uppercase tracking-[0.4em] font-black mb-3">Today's Celestial Vibration</p>
        <h3 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
          <GradientText>{energyLabel || `${zodiac || 'Cosmic'} Energy`}</GradientText>
        </h3>
        
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent mb-8" />
      </div>

      <GlassCard className="p-8 border-none bg-white/[0.02] backdrop-blur-2xl shadow-none relative overflow-hidden" glow="purple">
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/20 hover:text-white disabled:opacity-50"
            title="Refresh reading"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      {/* Traits */}
      <div className="flex flex-wrap gap-4 justify-center mb-10">
        {isLoading ? (
          <>
            <div className="h-4 w-32 bg-white/5 rounded-full animate-pulse" />
            <div className="h-4 w-36 bg-white/5 rounded-full animate-pulse" />
          </>
        ) : (
          traits?.map((trait, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <span className="text-xl">{trait.icon}</span>
              <span className="text-white/80 text-[11px] uppercase tracking-wider font-semibold">
                {trait.text}
              </span>
            </div>
          )) || (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-white/80 text-[11px] uppercase tracking-wider font-semibold">Energy flowing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span className="text-white/80 text-[11px] uppercase tracking-wider font-semibold">Focus sharp</span>
              </div>
            </>
          )
        )}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <button
          onClick={onWhatShouldIDo}
          disabled={isGeneratingAction}
          className={`
            flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50
            ${shouldAnimateWhatShouldIDo ? 'shadow-[0_0_30px_rgba(168,85,247,0.8)] ring-2 ring-white/20' : 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'}
          `}
        >
          {isGeneratingAction ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {shouldAnimateWhatShouldIDo && <Sparkles className="w-4 h-4 text-white animate-pulse" />}
              <span>What should I do today?</span>
            </>
          )}
        </button>
        <button
          onClick={onShowPrediction}
          disabled={isGeneratingPrediction}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-transparent hover:bg-white/5 text-white border border-white/10 rounded-full font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50"
        >
          {isGeneratingPrediction ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Show my prediction</span>
            </>
          )}
        </button>
      </div>
    </GlassCard>
  </div>
  );
};

export default EnergyHeader;
