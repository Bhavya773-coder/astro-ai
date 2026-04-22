import React, { useState } from 'react';
import { Compass, X, MessageCircle, Zap, Users, Frown, Star } from 'lucide-react';

interface LiveSituationProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSituation: (situation: string) => void;
}

const situationPrompts = {
  meeting: {
    icon: MessageCircle,
    label: 'I have a meeting',
    prompt: "I have a meeting in 30 minutes. Based on today's cosmic energy for my sign, what's my best approach?"
  },
  decision: {
    icon: Zap,
    label: "I'm making a decision",
    prompt: "I need to make an important decision today. What does today's energy say about decision-making for me?"
  },
  upset: {
    icon: Frown,
    label: 'Someone upset me',
    prompt: "Someone just upset me. How should I handle this according to my cosmic reading today?"
  },
  opportunity: {
    icon: Star,
    label: 'Big opportunity',
    prompt: "A big opportunity just came up. Is today a good day to say yes based on my chart?"
  }
};

const LiveSituation: React.FC<LiveSituationProps> = ({
  isOpen,
  onClose,
  onSelectSituation
}) => {
  const [customSituation, setCustomSituation] = useState('');

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 mb-4 sm:mb-0 bg-[#0b1026] border border-violet-500/30 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Compass className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-white font-medium">Live Situation</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Quick-tap scenarios */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {Object.entries(situationPrompts).map(([key, situation]) => {
            const Icon = situation.icon;
            return (
              <button
                key={key}
                onClick={() => onSelectSituation(situation.prompt)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 transition-all"
              >
                <Icon className="w-6 h-6 text-violet-400" />
                <span className="text-white text-sm text-center">{situation.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom input */}
        <div className="p-4 pt-0">
          <p className="text-white/50 text-sm mb-2">Or describe your situation:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSituation}
              onChange={(e) => setCustomSituation(e.target.value)}
              placeholder="I need to..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customSituation.trim()) {
                  onSelectSituation(customSituation);
                }
              }}
            />
            <button
              onClick={() => customSituation.trim() && onSelectSituation(customSituation)}
              disabled={!customSituation.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSituation;
