import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner } from './CosmicUI';
import { Sparkles, Star, Moon, Flame, Droplet, Wind, Mountain } from 'lucide-react';
import { interpretTarotCard } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { getCardImage } from '../data/tarotCardImages';

interface TarotCardData {
  name: string;
  name_short: string;
  type: string;
  suit: string | null;
  value: string;
  value_int: number;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  is_reversed: boolean;
}

type Phase = 'idle' | 'shuffling' | 'picking' | 'revealing' | 'done';

const TAROT_API = 'https://tarotapi.dev/api/v1/cards/random';
const CARD_COUNT = 9;

// ─── Ornate Card Back ───
const CardBackDesign: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-violet-950 via-fuchsia-950 to-violet-950 flex items-center justify-center relative border-2 border-amber-500/30 rounded-2xl overflow-hidden">
    <div className="absolute inset-3 border border-amber-500/15 rounded-xl" />
    <div className="absolute inset-6 border border-fuchsia-500/10 rounded-lg" />
    {/* Corner ornaments */}
    {['top-1 left-1', 'top-1 right-1 rotate-90', 'bottom-1 left-1 -rotate-90', 'bottom-1 right-1 rotate-180'].map((pos, i) => (
      <div key={i} className={`absolute ${pos} w-6 h-6`}>
        <svg viewBox="0 0 24 24" className="text-amber-500/50"><path d="M0 0L24 0L24 4L4 4L4 24L0 24Z" fill="currentColor" /></svg>
      </div>
    ))}
    {/* Center mystical symbol */}
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
        {[0, 72, 144, 216, 288].map(deg => (
          <div key={deg} className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/50" style={{ transform: `rotate(${deg}deg) translateY(-28px)` }} />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-400/70" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </div>
  </div>
);

const getCardVisuals = (card?: TarotCardData) => {
  if (!card) return { gradient: 'from-indigo-900/95 via-violet-900/95 to-fuchsia-900/95', Icon: Star, color: 'text-amber-300', bgGlow: 'bg-amber-500/20', border: 'border-amber-400/30' };

  if (card.type === 'major') {
    return {
      gradient: 'from-indigo-950 via-purple-900 to-fuchsia-950',
      Icon: Moon,
      color: 'text-fuchsia-300',
      bgGlow: 'bg-fuchsia-500/20',
      border: 'border-fuchsia-400/30'
    };
  }

  switch (card.suit) {
    case 'wands':
      return {
        gradient: 'from-red-950 via-orange-900 to-amber-950',
        Icon: Flame,
        color: 'text-orange-300',
        bgGlow: 'bg-orange-500/20',
        border: 'border-orange-400/30'
      };
    case 'cups':
      return {
        gradient: 'from-blue-950 via-cyan-900 to-teal-950',
        Icon: Droplet,
        color: 'text-cyan-300',
        bgGlow: 'bg-cyan-500/20',
        border: 'border-cyan-400/30'
      };
    case 'swords':
      return {
        gradient: 'from-slate-950 via-zinc-900 to-gray-950',
        Icon: Wind,
        color: 'text-slate-300',
        bgGlow: 'bg-slate-500/20',
        border: 'border-slate-400/30'
      };
    case 'pentacles':
      return {
        gradient: 'from-emerald-950 via-green-900 to-teal-950',
        Icon: Mountain,
        color: 'text-emerald-300',
        bgGlow: 'bg-emerald-500/20',
        border: 'border-emerald-400/30'
      };
    default:
      return {
        gradient: 'from-indigo-950 via-violet-900 to-fuchsia-950',
        Icon: Star,
        color: 'text-amber-300',
        bgGlow: 'bg-amber-500/20',
        border: 'border-amber-400/30'
      };
  }
};

// ─── Single Card Component ───
const TarotCard: React.FC<{
  card?: TarotCardData;
  isFlipped: boolean;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  index: number;
  total: number;
}> = ({ card, isFlipped, isSelected, onClick, disabled, index, total }) => {
  const visuals = getCardVisuals(card);
  const Icon = visuals.Icon;

  return (
    <div
      className={`relative shrink-0 cursor-pointer transition-all duration-500 ${disabled && !isSelected ? 'opacity-40 pointer-events-none scale-90' : ''} ${isSelected ? 'z-20 !opacity-100' : 'z-10'}`}
      style={{
        width: 'clamp(100px, 22vw, 160px)',
        aspectRatio: '2/3',
        perspective: '1000px',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={!disabled || isSelected ? onClick : undefined}
    >
      <div
        className={`relative w-full h-full rounded-2xl transition-all duration-500 ${isSelected && !isFlipped ? 'shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-110' : ''} ${!isSelected && !disabled ? 'hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <CardBackDesign />
        </div>
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {card && getCardImage(card.name_short) ? (
            <div className="w-full h-full relative rounded-2xl border-2 border-amber-500/40">
              <img
                src={getCardImage(card.name_short)!}
                alt={card.name}
                className={`w-full h-full object-cover rounded-2xl ${card.is_reversed ? 'rotate-180' : ''}`}
                loading="lazy"
              />
              {/* Name overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6 rounded-b-2xl">
                <h3 className="text-white font-bold text-[10px] text-center leading-tight drop-shadow-lg">{card.name}</h3>
                {card.is_reversed && <p className="text-red-300 text-[8px] text-center uppercase tracking-widest font-bold mt-0.5">↓ Reversed</p>}
              </div>
            </div>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${visuals.gradient} flex flex-col items-center justify-center p-3 border-2 border-white/20 rounded-2xl`}>
              <div className="absolute inset-2 border border-white/10 rounded-xl" />
              <div className={`w-10 h-10 rounded-full ${visuals.bgGlow} flex items-center justify-center mb-2 border ${visuals.border}`}>
                <Icon className={`w-5 h-5 ${visuals.color} fill-current/50`} />
              </div>
              <h3 className="text-white font-bold text-xs text-center leading-tight">{card?.name}</h3>
              {card?.is_reversed && <span className="text-[8px] uppercase tracking-widest text-red-300/80 mt-1 font-bold">↓ Reversed</span>}
              {card?.type === 'major' && <span className="text-[8px] uppercase tracking-widest text-fuchsia-300/60 mt-1">Major Arcana</span>}
              {card?.suit && <span className={`text-[8px] uppercase tracking-widest ${visuals.color} opacity-60 mt-1`}>{card.suit}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───
const TarotReadingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [spreadCards, setSpreadCards] = useState<TarotCardData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [aiInterpretation, setAiInterpretation] = useState<{ [key: number]: string }>({});
  const [interpretingIndex, setInterpretingIndex] = useState<number | null>(null);

  const handleShuffle = useCallback(async () => {
    setPhase('shuffling');
    setSelectedIndices([]);
    setFlippedIndices(new Set());
    setAiInterpretation({});
    setSpreadCards([]);

    // Shuffle animation delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      const response = await fetch(`${TAROT_API}?n=${CARD_COUNT}`);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      const cards: TarotCardData[] = data.cards.map((c: any) => ({
        ...c,
        is_reversed: Math.random() < 0.3,
      }));

      setSpreadCards(cards);
      setPhase('picking');
      toast.success('Choose 3 cards that call to you!');
    } catch (err) {
      toast.error('Failed to fetch cards. Trying again...');
      // Fallback — generate from hardcoded names
      const fallbackNames = [
        'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
        'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
        'Wheel of Fortune', 'Justice',
      ];
      const cards: TarotCardData[] = fallbackNames.map(name => ({
        name, name_short: name.toLowerCase().replace(/\s+/g, '_'),
        type: 'major', suit: null, value: '0', value_int: 0,
        meaning_up: 'Trust the journey and embrace new beginnings.',
        meaning_rev: 'Beware of recklessness and missed opportunities.',
        desc: 'A mystical card from the Major Arcana.',
        is_reversed: Math.random() < 0.3,
      }));
      setSpreadCards(cards);
      setPhase('picking');
    }
  }, []);

  const handleCardClick = useCallback((index: number) => {
    if (phase === 'picking') {
      if (selectedIndices.includes(index)) {
        setSelectedIndices(prev => prev.filter(i => i !== index));
        return;
      }
      if (selectedIndices.length >= 3) {
        toast('You can only select 3 cards!', { icon: '🃏' });
        return;
      }
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);

      if (newSelected.length === 3) {
        // Auto-reveal after selecting 3
        setPhase('revealing');
        setTimeout(() => {
          setFlippedIndices(new Set([newSelected[0]]));
          setTimeout(() => {
            setFlippedIndices(new Set([newSelected[0], newSelected[1]]));
            setTimeout(() => {
              setFlippedIndices(new Set(newSelected));
              setPhase('done');
            }, 600);
          }, 600);
        }, 400);
      }
    } else if (phase === 'done' && selectedIndices.includes(index)) {
      // Toggle flip on click in done state
      setFlippedIndices(prev => {
        const n = new Set(prev);
        if (n.has(index)) n.delete(index); else n.add(index);
        return n;
      });
    }
  }, [phase, selectedIndices]);

  const handleInterpret = useCallback(async (cardIndex: number) => {
    const card = spreadCards[cardIndex];
    if (!card) return;
    setInterpretingIndex(cardIndex);

    try {
      const position = ['Past', 'Present', 'Future'][selectedIndices.indexOf(cardIndex)];
      // Pass all 3 selected cards for cross-card context
      const allSelectedCards = selectedIndices.map(idx => ({
        name: spreadCards[idx].name,
        is_reversed: spreadCards[idx].is_reversed,
      }));
      const res = await interpretTarotCard({
        card_name: card.name,
        is_reversed: card.is_reversed,
        meaning_up: card.meaning_up,
        meaning_rev: card.meaning_rev,
        desc: card.desc,
        position,
        all_cards: allSelectedCards,
      });

      if (res.success) {
        setAiInterpretation(prev => ({ ...prev, [cardIndex]: res.interpretation }));
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: res.remaining_credits } }));
        toast.success('AI interpretation ready!');
      }
    } catch (err: any) {
      if (err.message?.includes('credits') || err.message?.includes('CREDITS')) {
        toast.error('Not enough credits for AI interpretation.');
      } else {
        toast.error('Failed to interpret. Try again.');
      }
    } finally {
      setInterpretingIndex(null);
    }
  }, [spreadCards, selectedIndices]);

  const positionLabels = ['Past', 'Present', 'Future'];

  return (
    <CosmicBackground>
      <style>{`
        @keyframes card-appear {
          0% { opacity: 0; transform: scale(0.2) rotateZ(var(--r, 0deg)) translateY(80px); }
          60% { opacity: 1; transform: scale(1.05) rotateZ(0deg) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) rotateZ(0deg) translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.6); }
        }
        .card-appear { animation: card-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
        .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="tarot-main">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 lg:py-12">

              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3 font-display">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 text-fuchsia-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="1" width="14" height="20" rx="2" />
                    <rect x="7" y="3" width="14" height="20" rx="2" />
                  </svg>
                  Tarot Reading
                </h1>
                {user?.is_believer && (
                  <div className="mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/50 text-[11px] font-bold text-violet-300 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    Based on Vedic Astrology
                  </div>
                )}
                <p className="text-white/50 text-sm md:text-base max-w-xl text-center">
                  {phase === 'idle' && 'Shuffle the deck and let the ancient cards reveal your cosmic path.'}
                  {phase === 'shuffling' && 'The cosmic energies are aligning...'}
                  {phase === 'picking' && `Select 3 cards that call to you (${selectedIndices.length}/3)`}
                  {phase === 'revealing' && 'The cards are being revealed...'}
                  {phase === 'done' && 'Your cards have been revealed! Click a card to flip it.'}
                </p>
                <span className="mt-2 text-[10px] uppercase tracking-widest text-fuchsia-400/60 font-bold">✦ Free — No credits required ✦</span>
              </div>

              {/* Shuffle button */}
              {(phase === 'idle' || phase === 'done') && (
                <div className="flex justify-center mb-10">
                  <button
                    onClick={handleShuffle}
                    className="py-4 px-10 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] text-white font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    {phase === 'done' ? 'Shuffle Again' : 'Shuffle the Deck'}
                  </button>
                </div>
              )}

              {/* Shuffling animation */}
              {phase === 'shuffling' && (
                <div className="flex justify-center items-center py-16 sm:py-24">
                  <div className="relative" style={{ width: 'clamp(100px, 28vw, 140px)', aspectRatio: '2/3' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-violet-950 via-fuchsia-950 to-violet-950 shadow-lg shadow-violet-900/40"
                        style={{
                          animation: `shuffle-fly-${i} 1.4s ease-in-out infinite`,
                          animationDelay: `${i * 0.12}s`,
                          zIndex: 5 - i,
                        }}
                      />
                    ))}
                    <style>{`
                      @keyframes shuffle-fly-0 { 0%,100%{transform:translateX(0) rotate(0)} 25%{transform:translateX(-60px) rotate(-12deg)} 75%{transform:translateX(60px) rotate(12deg)} }
                      @keyframes shuffle-fly-1 { 0%,100%{transform:translateX(0) rotate(0)} 25%{transform:translateX(60px) rotate(12deg)} 75%{transform:translateX(-60px) rotate(-12deg)} }
                      @keyframes shuffle-fly-2 { 0%,100%{transform:translateX(0) rotate(0)} 50%{transform:translateY(-50px) rotate(-10deg)} }
                      @keyframes shuffle-fly-3 { 0%,100%{transform:translateX(0) rotate(0)} 33%{transform:translateX(-40px) translateY(25px) rotate(8deg)} 66%{transform:translateX(40px) translateY(-25px) rotate(-8deg)} }
                      @keyframes shuffle-fly-4 { 0%,100%{transform:translateX(0) rotate(0)} 50%{transform:translateX(45px) translateY(-35px) rotate(-12deg)} }
                    `}</style>
                  </div>
                </div>
              )}

              {/* Card spread */}
              {spreadCards.length > 0 && phase !== 'shuffling' && (
                <div className="relative mb-10">
                  <div className="relative grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 justify-items-center gap-2 sm:gap-3 md:gap-4 py-6 sm:py-8" style={{ perspective: '1200px' }}>
                    {spreadCards.map((card, i) => (
                      <div key={i} className="card-appear" style={{ animationDelay: `${i * 0.08}s`, ['--r' as any]: `${(Math.random() - 0.5) * 30}deg` }}>
                        <TarotCard
                          card={card}
                          isFlipped={flippedIndices.has(i)}
                          isSelected={selectedIndices.includes(i)}
                          onClick={() => handleCardClick(i)}
                          disabled={phase !== 'picking' && !selectedIndices.includes(i)}
                          index={selectedIndices.includes(i) ? selectedIndices.indexOf(i) : i}
                          total={selectedIndices.length > 0 && phase !== 'picking' ? selectedIndices.length : spreadCards.length}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Selection indicator */}
                  {phase === 'picking' && (
                    <div className="flex justify-center gap-3 mt-4">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedIndices.length > i ? 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-300 glow-pulse' : 'border-white/20 text-white/30'}`}>
                          {selectedIndices.length > i ? '✓' : i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Card Results — only when done */}
              {phase === 'done' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white text-center mb-6">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400">Your Reading</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {selectedIndices.map((cardIdx, posIdx) => {
                      const card = spreadCards[cardIdx];
                      const borderColors = ['border-blue-500/30', 'border-violet-500/30', 'border-amber-500/30'];
                      const labelColors = ['text-blue-400', 'text-violet-400', 'text-amber-400'];

                      return (
                        <GlassCard key={cardIdx} className={`p-4 sm:p-5 ${borderColors[posIdx]}`}>
                          <div className="text-center mb-3">
                            <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${labelColors[posIdx]}`}>
                              {positionLabels[posIdx]}
                            </span>
                            <h4 className="text-base sm:text-lg font-bold text-white mt-1">{card.name}</h4>
                            {card.is_reversed && (
                              <span className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">↓ Reversed</span>
                            )}
                          </div>

                          {/* Free meaning from API */}
                          <div className="bg-white/5 rounded-xl p-3 mb-3">
                            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                              {card.is_reversed ? card.meaning_rev : card.meaning_up}
                            </p>
                          </div>

                          {/* AI interpretation (optional) */}
                          {aiInterpretation[cardIdx] ? (
                            <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 rounded-xl p-3 border border-fuchsia-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                                <span className="text-[10px] uppercase tracking-widest text-fuchsia-400 font-bold">Personalized AI Reading</span>
                              </div>
                              <p className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{aiInterpretation[cardIdx]}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInterpret(cardIdx)}
                              disabled={interpretingIndex !== null}
                              className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/50 hover:to-fuchsia-600/50 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {interpretingIndex === cardIdx ? (
                                <><LoadingSpinner size="sm" /> Interpreting your stars...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Interpret with AI (1 credit)</>
                              )}
                            </button>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default TarotReadingPage;
