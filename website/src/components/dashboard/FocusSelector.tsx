import React from 'react';
import { GlassCard } from '../CosmicUI';
import { Briefcase, Heart, Brain, Wallet, Check } from 'lucide-react';

type FocusArea = 'work' | 'love' | 'mind' | 'money' | null;

interface FocusSelectorProps {
  selectedFocus: FocusArea;
  onSelectFocus: (focus: FocusArea) => void;
}

const FocusSelector: React.FC<FocusSelectorProps> = ({
  selectedFocus,
  onSelectFocus
}) => {
  const focusAreas = [
    {
      id: 'work' as const,
      label: 'Work',
      icon: Briefcase,
      color: 'text-blue-400'
    },
    {
      id: 'love' as const,
      label: 'Love',
      icon: Heart,
      color: 'text-rose-400'
    },
    {
      id: 'mind' as const,
      label: 'Mind',
      icon: Brain,
      color: 'text-violet-400'
    },
    {
      id: 'money' as const,
      label: 'Money',
      icon: Wallet,
      color: 'text-amber-400'
    }
  ];

  return (
    <GlassCard className="p-6 mb-4">
      <h3 className="text-white font-medium mb-4">Pick your focus today:</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {focusAreas.map((area) => {
          const isSelected = selectedFocus === area.id;
          const Icon = area.icon;
          
          return (
            <button
              key={area.id}
              onClick={() => onSelectFocus(isSelected ? null : area.id)}
              className={`
                relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                transition-all duration-200
                ${isSelected 
                  ? 'border-2 border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-violet-400" />
                </div>
              )}
              <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-400' : area.color}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                {area.label}
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default FocusSelector;
