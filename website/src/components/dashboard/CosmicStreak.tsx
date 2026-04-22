import React from 'react';
import { Flame } from 'lucide-react';

interface CosmicStreakProps {
  streak: number;
}

const CosmicStreak: React.FC<CosmicStreakProps> = ({ streak }) => {
  if (streak <= 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
      <Flame className="w-4 h-4 text-orange-400" />
      <span className="text-orange-400 text-sm font-medium">
        {streak}-day streak
      </span>
    </div>
  );
};

export default CosmicStreak;
