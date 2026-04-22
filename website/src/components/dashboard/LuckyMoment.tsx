import React from 'react';
import { GlassCard } from '../CosmicUI';
import { Sparkles } from 'lucide-react';

interface LuckyMomentProps {
  luckyMoment?: {
    color: string;
    number: number;
    power_hour: string;
    avoid: string;
  };
}

const LuckyMoment: React.FC<LuckyMomentProps> = ({ luckyMoment }) => {
  const data = luckyMoment || {
    color: 'Deep Violet',
    number: 7,
    power_hour: '2:10 PM',
    avoid: 'Rushed decisions'
  };

  return (
    <GlassCard className="p-6 mb-4 border-amber-500/20 bg-amber-500/5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <span className="text-amber-400 text-sm uppercase tracking-wider font-medium">
          Your Cosmic Advantage Today
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-white/50 text-xs mb-1">Lucky Color</p>
          <p className="text-white font-medium">{data.color}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-white/50 text-xs mb-1">Lucky Number</p>
          <p className="text-white font-medium text-xl">{data.number}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-white/50 text-xs mb-1">Power Hour</p>
          <p className="text-white font-medium">{data.power_hour}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-white/50 text-xs mb-1">Avoid</p>
          <p className="text-red-400 font-medium">{data.avoid}</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default LuckyMoment;
