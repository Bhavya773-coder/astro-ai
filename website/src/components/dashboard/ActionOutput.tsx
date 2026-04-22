import React from 'react';
import { GlassCard, Skeleton } from '../CosmicUI';
import { CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, Briefcase, Heart, Brain, Wallet, Sparkles } from 'lucide-react';

interface DailyAction {
  do: string[];
  avoid: string[];
  luck_window: string;
}

interface ActionOutputProps {
  selectedFocus: 'work' | 'love' | 'mind' | 'money' | null;
  dailyActions?: {
    work: DailyAction;
    love: DailyAction;
    mind: DailyAction;
    money: DailyAction;
  };
  onReaction: (reaction: 'accurate' | 'not_me') => void;
  userReaction?: 'accurate' | 'not_me' | null;
  focusAction?: string | null;
  isLoading?: boolean;
}



const ActionOutput: React.FC<ActionOutputProps> = ({
  selectedFocus,
  dailyActions,
  onReaction,
  userReaction,
  focusAction,
  isLoading
}) => {
  if (!selectedFocus) {
    return null;
  }

  // Handle case where dailyActions might not be loaded yet
  const action = dailyActions ? dailyActions[selectedFocus] : null;

  if (!focusAction && !isLoading && !action) {
    return null;
  }
  
  const focusLabels = {
    work: { label: 'Work mode', icon: Briefcase, color: 'text-blue-400' },
    love: { label: 'Love mode', icon: Heart, color: 'text-rose-400' },
    mind: { label: 'Mind mode', icon: Brain, color: 'text-violet-400' },
    money: { label: 'Money mode', icon: Wallet, color: 'text-amber-400' }
  };

  const FocusIcon = focusLabels[selectedFocus].icon;

  return (
    <GlassCard className="p-6 mb-4" glow="purple" id="action-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
        <FocusIcon className={`w-5 h-5 ${focusLabels[selectedFocus].color}`} />
        <h3 className="text-white font-semibold">YOUR MOVE TODAY</h3>
        <span className={`text-sm ${focusLabels[selectedFocus].color}`}>
          [{focusLabels[selectedFocus].label}]
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-6 mb-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          {/* Drastic focus action if exists */}
          {focusAction && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <span className="text-fuchsia-400 font-bold uppercase text-[10px] tracking-widest">Aura Insight</span>
              </div>
              <p className="text-white text-xl font-bold leading-relaxed italic">
                {focusAction.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i % 3 === 0 ? "text-fuchsia-400" : ""}>{word} </span>
                ))}
              </p>
            </div>
          )}

          {/* DO THIS */}
          {action && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold uppercase text-sm tracking-wider">
                  Do This
                </span>
              </div>
              <ul className="space-y-2 pl-7">
                {action.do.slice(0, 2).map((item: string, index: number) => (
                  <li key={index} className="text-white/80 text-sm">
                    • {item}
                  </li>
                ))}
                {action.do.length === 0 && (
                  <li className="text-white/60 text-sm">• Take confident steps forward</li>
                )}
              </ul>
            </div>
          )}

          {/* AVOID */}
          {action && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold uppercase text-sm tracking-wider">
                  Avoid
                </span>
              </div>
              <ul className="space-y-2 pl-7">
                {action.avoid.slice(0, 2).map((item: string, index: number) => (
                  <li key={index} className="text-white/80 text-sm">
                    • {item}
                  </li>
                ))}
                {action.avoid.length === 0 && (
                  <li className="text-white/60 text-sm">• Rushed decisions</li>
                )}
              </ul>
            </div>
          )}

          {/* LUCK WINDOW */}
          {action && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-semibold uppercase text-sm tracking-wider">
                  Luck Window
                </span>
              </div>
              <p className="text-white/80 text-lg font-medium pl-7">
                {action.luck_window || '11:30 AM – 2:00 PM'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Reaction Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onReaction('accurate')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border transition-all
            ${userReaction === 'accurate'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'border-white/20 text-white/60 hover:border-emerald-500/50 hover:text-emerald-400'
            }
          `}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">Accurate</span>
        </button>
        <button
          onClick={() => onReaction('not_me')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border transition-all
            ${userReaction === 'not_me'
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : 'border-white/20 text-white/60 hover:border-red-500/50 hover:text-red-400'
            }
          `}
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="text-sm">Not me</span>
        </button>
      </div>
    </GlassCard>
  );
};

export default ActionOutput;
