import React from 'react';
import { GlassCard } from '../CosmicUI';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WhyThisProps {
  reason?: string;
  showReason: boolean;
  onToggle: () => void;
}

const WhyThis: React.FC<WhyThisProps> = ({
  reason,
  showReason,
  onToggle
}) => {
  return (
    <GlassCard className="mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium flex items-center gap-2">
          {showReason ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          Why this reading?
        </span>
      </button>
      
      {showReason && (
        <div className="px-6 pb-6 border-t border-white/10">
          <p className="text-white/70 text-sm leading-relaxed mt-4">
            {reason || 'The planetary alignment supports your zodiac sign with positive vibrations today.'}
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default WhyThis;
