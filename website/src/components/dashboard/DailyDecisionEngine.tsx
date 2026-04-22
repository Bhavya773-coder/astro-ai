import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Heart, Briefcase, Coins, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import { GlassCard, LoadingSpinner } from '../CosmicUI';
import { getDailyDecisionData } from '../../api/client';
import toast from 'react-hot-toast';

interface Quadrant {
  moves: { optionA: string; optionB: string };
  actions: { do: string[]; avoid: string[] };
  timing: { powerWindow: string; cautionWindow: string };
  predictions: string[];
  insight: string;
}

interface DecisionData {
  hook: string;
  signals: {
    focus: 'High' | 'Low';
    emotion: 'Stable' | 'Unstable';
  };
  quadrants: {
    work: Quadrant;
    love: Quadrant;
    mind: Quadrant;
    money: Quadrant;
  };
}

interface DailyDecisionEngineProps {
  zodiac: string;
  streak: number;
}

const DailyDecisionEngine: React.FC<DailyDecisionEngineProps> = ({ zodiac, streak }) => {
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFocus, setSelectedFocus] = useState<'work' | 'love' | 'mind' | 'money'>('work');
  const [selectedMove, setSelectedMove] = useState<'optionA' | 'optionB' | null>(null);
  const [predictionStates, setPredictionStates] = useState<Record<number, 'hit' | 'miss'>>({});
  const [showInsight, setShowInsight] = useState(true);

  useEffect(() => {
    if (zodiac) fetchData();
  }, [zodiac]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDailyDecisionData(zodiac);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch decision data:', err);
      toast.error('Cosmic engine is stabilizing...');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/50 animate-pulse font-medium tracking-widest uppercase text-[10px]">Consulting the Oracle...</p>
      </div>
    );
  }

  if (!data) return null;

  // Derive current quadrant content
  const q = data.quadrants[selectedFocus] || data.quadrants.work;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SECTION 1: HOOK */}
      <motion.div 
        key="hook-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-4"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white px-4 leading-tight">
          "{data.hook}"
        </h1>
        
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <Zap className={`w-4 h-4 ${data.signals.focus === 'High' ? 'text-yellow-400' : 'text-gray-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Focus: {data.signals.focus}</span>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className={`w-4 h-4 ${data.signals.emotion === 'Stable' ? 'text-green-400' : 'text-fuchsia-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Mood: {data.signals.emotion}</span>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: FOCUS SELECTION */}
      <div className="space-y-4">
        <p className="text-center text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Pick Your Focus Today</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
          {[
            { id: 'work', label: 'Work', icon: Briefcase, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { id: 'love', label: 'Love', icon: Heart, color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30' },
            { id: 'mind', label: 'Mind', icon: Brain, color: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-500/30' },
            { id: 'money', label: 'Money', icon: Coins, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = selectedFocus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedFocus(item.id as any);
                  setSelectedMove(null); // Reset move when switching focus
                }}
                className={`relative group p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-2 ${isActive ? `${item.border} bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]` : 'border-white/5 bg-black/40 hover:border-white/20'}`}
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40'}`} />
                </div>
                <span className={`text-xs font-bold tracking-widest uppercase ${isActive ? 'text-white' : 'text-white/40'}`}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFocus}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* SECTION 3: YOUR MOVE */}
          <GlassCard className="p-6 border-white/10 overflow-hidden relative" glow="purple">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-center">Your Move in {selectedFocus}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'optionA', text: q.moves.optionA },
                { id: 'optionB', text: q.moves.optionB },
              ].map((move) => (
                <button
                  key={move.id}
                  onClick={() => setSelectedMove(move.id as any)}
                  className={`p-4 rounded-2xl border transition-all relative h-full flex items-center justify-center text-center ${selectedMove === move.id ? 'bg-white/10 border-white/40 scale-105 shadow-xl' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                >
                  <p className={`text-sm font-medium leading-relaxed ${selectedMove === move.id ? 'text-white' : 'text-white/60'}`}>{move.text}</p>
                  {selectedMove === move.id && (
                    <div className="absolute -top-2 -right-2 bg-white text-black p-1 rounded-full shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* SECTION 4 & 5: ACTION & TIMING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-green-400 text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Do This
                  </p>
                  <ul className="space-y-3">
                    {q.actions.do.map((item, i) => (
                      <li key={i} className="text-white/80 text-sm font-medium border-l-2 border-green-500/20 pl-3">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Avoid This
                  </p>
                  <ul className="space-y-3">
                    {q.actions.avoid.map((item, i) => (
                      <li key={i} className="text-white/80 text-sm font-medium border-l-2 border-red-500/20 pl-3">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-center">
              <div className="space-y-8">
                <div className="relative pl-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-transparent rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Power Window</p>
                  <p className="text-xl font-bold text-white tracking-widest uppercase">{q.timing.powerWindow}</p>
                </div>
                <div className="relative pl-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-transparent rounded-full shadow-[0_0_10px_rgba(217,70,239,0.3)]" />
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Avoid After</p>
                  <p className="text-xl font-bold text-white tracking-widest uppercase">{q.timing.cautionWindow}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* SECTION 6: PREDICTION */}
          <GlassCard className="p-6">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-center">Outcome Predictions</p>
            <div className="space-y-4">
              {q.predictions.map((p, i) => (
                <div key={i} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-white/90 text-sm font-medium">{p}</p>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => setPredictionStates(prev => ({ ...prev, [i]: 'hit' }))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${predictionStates[i] === 'hit' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                      Happened
                    </button>
                    <button 
                      onClick={() => setPredictionStates(prev => ({ ...prev, [i]: 'miss' }))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${predictionStates[i] === 'miss' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                      Didn't
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* SECTION 7: INSIGHT */}
          <div className="px-2">
            <button 
              onClick={() => setShowInsight(!showInsight)}
              className="w-full py-4 border-y border-white/5 flex items-center justify-between group"
            >
              <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold group-hover:text-white/60 transition-colors">Why this decision?</span>
              {showInsight ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
            </button>
            <AnimatePresence>
              {showInsight && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="py-6 text-white/60 text-sm leading-relaxed font-serif italic">
                    {q.insight}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* SECTION 9: STREAK */}
      <div className="text-center pt-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
           <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
           <div className="text-left">
              <p className="text-white font-bold leading-none text-sm">{streak}-Day Pattern</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Refining your AI model</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDecisionEngine;
