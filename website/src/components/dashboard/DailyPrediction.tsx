import React, { useState } from 'react';
import { GlassCard, Skeleton } from '../CosmicUI';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';

interface DailyPredictionProps {
  prediction?: string;
  onReaction: (reaction: 'accurate' | 'not_me') => void;
  userReaction?: 'accurate' | 'not_me' | null;
  onNavigateToChat: () => void;
  personalizedPrediction?: string | null;
  isLoading?: boolean;
}



const DailyPrediction: React.FC<DailyPredictionProps> = ({
  prediction,
  onReaction,
  userReaction,
  onNavigateToChat,
  personalizedPrediction,
  isLoading
}) => {
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleAccurate = () => {
    onReaction('accurate');
    setShowFollowUp(true);
  };

  const handleNotMe = () => {
    onReaction('not_me');
    setShowFollowUp(false);
  };

  if (!personalizedPrediction && !prediction && !isLoading) {
    return null;
  }

  return (
    <GlassCard className="p-6 mb-4" id="prediction-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-fuchsia-400" />
        <span className="text-white/60 text-sm uppercase tracking-wider font-medium">
          {personalizedPrediction ? "Your Personalized Insight:" : "Today might trigger this:"}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 mb-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-4/6" />
        </div>
      ) : (
        <>
          {/* Prediction Text */}
          <p className="text-white text-lg font-medium mb-6 leading-relaxed">
            {personalizedPrediction ? (
               <span>
                 {personalizedPrediction.split(' ').map((word: string, i: number) => (
                   <span key={i} className={i % 4 === 0 ? "text-fuchsia-400 font-bold" : ""}>{word} </span>
                 ))}
               </span>
            ) : (
              `"${prediction || 'Someone will challenge an idea you share today'}"`
            )}
          </p>
        </>
      )}

      {/* Reaction Buttons */}
      {!userReaction ? (
        <div className="flex gap-3">
          <button
            onClick={handleAccurate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">That's accurate</span>
          </button>
          <button
            onClick={handleNotMe}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">No chance</span>
          </button>
        </div>
      ) : userReaction === 'accurate' && showFollowUp ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
          <span className="text-white/80 text-sm">Here's how to handle it →</span>
          <button
            onClick={onNavigateToChat}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            Get advice
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 rounded-xl bg-white/5">
          <span className="text-white/60 text-sm">Let's see 😄</span>
        </div>
      )}
    </GlassCard>
  );
};

export default DailyPrediction;
