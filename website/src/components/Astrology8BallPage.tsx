import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import { Sparkles, RotateCcw, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const ANSWERS = [
  { verdict: 'YES', tone: '#10B981', title: 'Move with confidence', advice: 'Do it, but keep the first step small and reversible.' },
  { verdict: 'YES', tone: '#8B5CF6', title: 'The signal is supportive', advice: 'Proceed if your facts are checked and your intention is clean.' },
  { verdict: 'WAIT', tone: '#F59E0B', title: 'Let the sky settle', advice: 'Do not force it yet. Sleep on it, then choose the next small step.' },
  { verdict: 'NO', tone: '#EF4444', title: 'Protect your energy', advice: 'Do not do it now. The cost is louder than the signal.' },
  { verdict: 'MAYBE', tone: '#6366F1', title: 'Ask for one sign', advice: 'Move only if you get a practical confirmation, not just excitement.' },
  { verdict: 'YES', tone: '#EC4899', title: 'Heart first, plan second', advice: 'Say yes, then set a boundary so the choice does not drain you.' },
  { verdict: 'WAIT', tone: '#A855F7', title: 'Observe one more thing', advice: 'Gather one more real-world clue before acting.' },
  { verdict: 'NO', tone: '#64748B', title: 'Not this version', advice: 'Decline this path. A cleaner option is likely nearby.' },
];

const SUGGESTIONS = [
  'Should I initiate this conversation today?',
  'Is it a favorable time to make this purchase?',
  'Should I focus on rest rather than starting a new project?',
  'Is this opportunity aligned with my growth?'
];

const Astrology8BallPage: React.FC = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<typeof ANSWERS[number] | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleAsk = (qToAsk?: string) => {
    const q = (qToAsk || question).trim();
    if (q.length < 4) {
      toast.error('Please type a clear yes/no question first');
      return;
    }

    if (qToAsk) {
      setQuestion(qToAsk);
    }

    setAnswer(null);
    setIsShaking(true);

    const daySeed = new Date().getDate();
    const seed = q.split('').reduce((sum, char) => sum + char.charCodeAt(0), daySeed);

    setTimeout(() => {
      setIsShaking(false);
      const chosen = ANSWERS[seed % ANSWERS.length];
      setAnswer(chosen);
    }, 1100);
  };

  const handleReset = () => {
    setQuestion('');
    setAnswer(null);
    setIsShaking(false);
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16 flex flex-col items-center">
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3 font-display">
                  <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-fuchsia-400" />
                  Astrology 8-Ball
                </h1>
                {user?.is_believer && (
                  <div className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/50 text-[11px] font-bold text-violet-300 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    Instant Celestial Oracle
                  </div>
                )}
                <p className="text-white/60 text-lg max-w-2xl text-center">
                  Ask any pressing yes/no dilemma. The cosmic oracle channels planetary archetypes for instant directional guidance.
                </p>
              </div>

              {/* 3D Celestial Oracle Ball */}
              <div className="relative my-6 flex flex-col items-center justify-center">
                {/* Ambient Glow */}
                <div
                  className={`absolute w-72 h-72 md:w-96 md:h-96 rounded-full transition-all duration-700 blur-3xl pointer-events-none ${
                    answer
                      ? 'opacity-40 scale-110'
                      : isShaking
                      ? 'opacity-60 scale-125 bg-fuchsia-600/30'
                      : 'opacity-20 scale-100 bg-violet-600/20'
                  }`}
                  style={{
                    backgroundColor: answer?.tone ? `${answer.tone}40` : undefined
                  }}
                />

                {/* Sphere */}
                <div
                  onClick={() => {
                    if (question) handleAsk();
                  }}
                  className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none shadow-[inset_0_-20px_40px_rgba(0,0,0,0.9),0_25px_50px_rgba(0,0,0,0.8)] border border-white/10 transition-transform duration-300 ${
                    isShaking ? 'animate-bounce scale-105' : 'hover:scale-[1.02]'
                  }`}
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, #3b2d54 0%, #171026 45%, #07050d 85%)',
                  }}
                >
                  <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-black/70 border-2 border-fuchsia-500/30 shadow-[inset_0_0_30px_rgba(217,70,239,0.3)] flex flex-col items-center justify-center p-4 backdrop-blur-md">
                    {isShaking ? (
                      <div className="space-y-2 text-center animate-pulse">
                        <Sparkles className="w-8 h-8 text-fuchsia-400 mx-auto animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">
                          Aligning Stars...
                        </span>
                      </div>
                    ) : answer ? (
                      <div className="space-y-1.5 text-center">
                        <span
                          className="text-2xl md:text-3xl font-black tracking-wider block"
                          style={{ color: answer.tone }}
                        >
                          {answer.verdict}
                        </span>
                        <span className="text-[11px] font-semibold text-white/90 block line-clamp-2">
                          {answer.title}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center opacity-80">
                        <span className="text-4xl font-black text-white/50 block">8</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">
                          Ask & Shake
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Card */}
              {answer && (
                <GlassCard className="w-full max-w-xl my-4 p-6 border-fuchsia-500/30 text-center animate-fadeIn">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: answer.tone }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Cosmic Oracle Guidance
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{answer.title}</h3>
                  <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-md mx-auto">
                    "{answer.advice}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Ask Another Question
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* Question Input */}
              <GlassCard className="w-full max-w-xl mt-4 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      Type Your Yes / No Question
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g., Should I take action on this proposal today?"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAsk();
                        }}
                        className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none transition shadow-inner"
                      />
                      {question && (
                        <button
                          onClick={() => setQuestion('')}
                          className="absolute right-3 top-3.5 text-xs text-white/40 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAsk()}
                    disabled={isShaking || question.trim().length < 4}
                    className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isShaking ? 'Consulting the Heavens...' : 'Ask the Cosmic 8-Ball'}
                  </button>

                  {/* Suggestions */}
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-white/50 block mb-2">
                      Or select a suggested query:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAsk(sug)}
                          className="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-left transition"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default Astrology8BallPage;
