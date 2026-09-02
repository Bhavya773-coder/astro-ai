import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import { Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';
import AutoResizeTextarea from './AutoResizeTextarea';
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
  const [questionInput, setQuestionInput] = useState('');
  const [activeQuestion, setActiveQuestion] = useState('');
  const [answer, setAnswer] = useState<typeof ANSWERS[number] | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleAsk = (qToAsk?: string) => {
    const q = (qToAsk || questionInput).trim();
    if (q.length < 3) {
      toast.error('Please type a clear yes/no question first');
      return;
    }

    setActiveQuestion(q);
    if (qToAsk) {
      setQuestionInput(qToAsk);
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
    setQuestionInput('');
    setActiveQuestion('');
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
              <div className="relative my-4 flex flex-col items-center justify-center">
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
                    if (questionInput) handleAsk();
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
                          Ask Below & Shake
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Guidance Card */}
              {answer && (
                <GlassCard className="w-full max-w-xl my-4 p-6 border-fuchsia-500/30 text-center animate-fadeIn">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: answer.tone }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Oracle Response for: "{activeQuestion}"
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

              {/* Suggested Questions Quick Chips */}
              <div className="w-full max-w-xl my-2">
                <span className="text-[11px] font-semibold text-white/50 block mb-2 text-center">
                  Or pick a common question:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(sug)}
                      className="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING CHAT INPUT - Consistent ChatGPT-style asking bar across all website pages */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (questionInput.trim()) {
                handleAsk();
              }
            }}
            className="w-full px-4 py-4 md:py-6"
          >
            <div className="max-w-3xl mx-auto relative flex items-end">
              <AutoResizeTextarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (questionInput.trim()) {
                      handleAsk();
                    }
                  }
                }}
                placeholder="Ask the Cosmic 8-Ball any yes or no dilemma..."
                maxRows={6}
                className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20"
              />
              <button
                type="submit"
                disabled={!questionInput.trim() || isShaking}
                className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:opacity-50 text-purple-900 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg border-2 border-purple-300"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white/30 text-xs mt-2">AstroAi4u can make mistakes. Consider checking important information.</p>
          </form>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default Astrology8BallPage;
