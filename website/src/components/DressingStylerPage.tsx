import React, { useState, useEffect } from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { apiFetch, getCredits, generateStyleLook, updateStyleInteraction, shareStyleLook } from '../api/client';
import {
  Shirt,
  Sparkles,
  Palette,
  Clock,
  Settings2,
  X,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
  Target,
  Flame,
  IceCream,
  Coffee,
  Briefcase,
  Utensils,
  PartyPopper,
  Smile,
  ShieldCheck,
  MousePointer2,
  Share2,
  MessageSquare,
  Trophy,
  Star,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StyleResult {
  headline: string;
  outfit_description: string;
  colors: string[];
  color_names: string[];
  image_base64: string | null;
  astrological_reason: string;
  mood_energy: string;
  date: string;
  interactive_state?: {
    selected_context: string;
    selected_modifier: string;
    vibe_selection: string | null;
    outfit_score: {
      style: number;
      confidence: number;
      attention: number;
    };
  };
}

const DressingStylerPage: React.FC = () => {
  const navigate = useNavigate();
  const [styleResult, setStyleResult] = useState<StyleResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const [countdown, setCountdown] = useState<string>('');
  const [questionInput, setQuestionInput] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Interaction State
  const [selectedModifier, setSelectedModifier] = useState('Standard');
  const [selectedContext, setSelectedContext] = useState('Casual');
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [outfitScore, setOutfitScore] = useState({ style: 85, confidence: 90, attention: 75 });
  const [activePart, setActivePart] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchCredits();
      await checkTodaySuggestion();
    };
    init();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await getCredits();
      if (res?.success) setCredits(res.credits);
    } catch (e) { }
  };

  const checkTodaySuggestion = async () => {
    try {
      const response = await apiFetch('/api/dressing-styler/today');
      if (response?.success && response.data) {
        const data = response.data;
        setStyleResult(data);
        setHasGeneratedToday(true);
        if (data.interactive_state) {
           setSelectedModifier(data.interactive_state.selected_modifier);
           setSelectedContext(data.interactive_state.selected_context);
           setSelectedVibe(data.interactive_state.vibe_selection);
           setOutfitScore(data.interactive_state.outfit_score);
        }
      }
    } catch (error) {
      console.error('Error checking today suggestion:', error);
    }
  };

  const handleInteraction = async (type: 'modifier' | 'context' | 'vibe' | 'score', value: any) => {
    // Optimistic Update
    if (type === 'modifier') setSelectedModifier(value);
    if (type === 'context') setSelectedContext(value);
    if (type === 'vibe') setSelectedVibe(value);
    if (type === 'score') setOutfitScore(value);

    // Backend sync
    try {
      await updateStyleInteraction({
        selected_modifier: type === 'modifier' ? value : undefined,
        selected_context: type === 'context' ? value : undefined,
        vibe_selection: type === 'vibe' ? value : undefined,
        outfit_score: type === 'score' ? value : undefined,
      });
    } catch (e) {
      console.error('Failed to sync interaction:', e);
    }
  };

  const handleGenerate = async (force = false) => {
    setIsGenerating(true);
    setError('');
    setImageLoaded(false);

    try {
      const response = await generateStyleLook(force);
      if (response?.success) {
        setStyleResult(response.data);
        setCredits(response.credits_remaining);
        setHasGeneratedToday(true);
        toast.success(force ? 'Completely New Look Generated! (5 credits)' : 'Today\'s Look Revealed!');
      } else {
        setError(response?.message || 'Failed to generate');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate');
      toast.error(err.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!styleResult) return;
    setIsSharing(true);
    try {
      console.log('[handleShare] Starting share process...');
      // Get user profile for name
      let userName = 'Anonymous';
      try {
        const profileRes = await apiFetch('/api/profile');
        userName = profileRes?.data?.full_name || 'Anonymous';
      } catch (pErr) {
        console.warn('[handleShare] Profile fetch failed, using default name', pErr);
      }

      console.log('[handleShare] Requesting share link from API...');
      const res = await shareStyleLook({
        user_name: userName,
        style_data: {
          headline: styleResult.headline,
          outfit_description: styleResult.outfit_description,
          colors: styleResult.colors,
          color_names: styleResult.color_names,
          astrological_reason: styleResult.astrological_reason,
          selected_context: selectedContext,
          selected_modifier: selectedModifier,
          image_base64: styleResult.image_base64
        }
      });

      console.log('[handleShare] API Response:', res);

      if (res?.success && res?.data?.shareUrl) {
         let finalUrl = res.data.shareUrl;
         // Handle localhost override for testing
         if (window.location.hostname === 'localhost') {
           finalUrl = finalUrl.replace(/https?:\/\/[^/]+/, 'http://localhost:3000');
         }
         
         try {
           await navigator.clipboard.writeText(finalUrl);
           toast.success('Link copied! Share your look with the world ✨');
         } catch (clipErr) {
           console.error('[handleShare] Clipboard failed:', clipErr);
           toast.success(`Share Link: ${finalUrl}`, { duration: 6000 });
           toast('Link generated but could not copy automatically. Please copy manually.', { icon: '📋' });
         }
      } else {
         const errorMsg = res?.message || 'Failed to generate share link';
         toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('[handleShare] Error sharing style:', err);
      const errorMessage = err?.message || 'Check your connection and try again';
      toast.error(`Failed to share: ${errorMessage}`);
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (!hasGeneratedToday) return;
    const interval = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasGeneratedToday]);

  const StyleSkeleton = () => (
    <div className="mt-8 space-y-8 animate-pulse lg:max-w-xl lg:mx-auto">
      <div className="h-8 bg-white/5 rounded-2xl w-3/4 mx-auto" />
      <div className="aspect-[3/4] bg-white/5 rounded-3xl" />
    </div>
  );

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-none pb-24">
            <div className="max-w-2xl mx-auto px-4 pt-8 pb-12 space-y-8">
              
              {/* 1. HEADER */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <GradientText className="text-3xl font-bold tracking-tight">StyleForecaster</GradientText>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/20 font-mono mt-1">v1.2</span>
                </div>
                {styleResult ? (
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                    {selectedModifier} Look for {styleResult.date} • Refresh in {countdown}
                  </p>
                ) : (
                  <p className="text-white/40 text-sm">Your daily cosmic outfit awaits.</p>
                )}
              </div>

              {isGenerating ? <StyleSkeleton /> : styleResult ? (
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* 2. MAIN IMAGE (STATIC) */}
                  <div className="relative group">
                    <GlassCard className="p-0 overflow-hidden border-violet-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
                      <div className="aspect-[3/4] relative">
                         {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                               <LoadingSpinner size="lg" />
                            </div>
                         )}
                         <img 
                           src={`data:image/png;base64,${styleResult.image_base64}`} 
                           alt="Your look"
                           onLoad={() => setImageLoaded(true)}
                           className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                         />
                         
                         {/* CLICKABLE OVERLAYS */}
                         <div className="absolute inset-0 z-10">
                            {/* Part Overlays */}
                            <button 
                              onClick={() => setActivePart('top')}
                              className="absolute top-[20%] left-[25%] w-[50%] h-[30%] group/part"
                            >
                               <div className="absolute inset-0 bg-white/0 group-hover/part:bg-white/5 transition-colors rounded-full blur-xl" />
                               {activePart === 'top' && (
                                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-bold rounded-full shadow-lg z-20">
                                   Top: Structured
                                 </motion.div>
                               )}
                            </button>
                            <button 
                              onClick={() => setActivePart('bottom')}
                              className="absolute top-[50%] left-[25%] w-[50%] h-[35%] group/part"
                            >
                               <div className="absolute inset-0 bg-white/0 group-hover/part:bg-white/5 transition-colors rounded-full blur-xl" />
                               {activePart === 'bottom' && (
                                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-bold rounded-full shadow-lg z-20">
                                   Bottom: Relaxed
                                 </motion.div>
                               )}
                            </button>
                         </div>

                         {/* TAG OVERLAYS */}
                         <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white tracking-widest uppercase">Structured</span>
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white/70 tracking-widest uppercase">Muted</span>
                         </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* 3. QUICK STYLE MODIFIERS */}
                  <div className="space-y-4">
                    <p className="text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">Adjust This Look</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'Bolder', icon: Flame, color: 'text-orange-400' },
                        { id: 'Minimal', icon: IceCream, color: 'text-blue-400' },
                        { id: 'Sharper', icon: Target, color: 'text-fuchsia-400' },
                        { id: 'Relaxed', icon: Coffee, color: 'text-emerald-400' },
                      ].map(mod => {
                        const Icon = mod.icon;
                        const isActive = selectedModifier === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleInteraction('modifier', mod.id)}
                            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${isActive ? 'bg-white/10 border-white/30 shadow-lg' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                          >
                            <Icon className={`w-5 h-5 ${isActive ? mod.color : 'text-white/30'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/40'}`}>{mod.id}</span>
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={selectedModifier}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center text-xs text-white/60 italic"
                      >
                        {selectedModifier === 'Bolder' && "Emphasizing contrast and statement accessories..."}
                        {selectedModifier === 'Minimal' && "Stripping down to essentials and tonal harmony..."}
                        {selectedModifier === 'Sharper' && "Refining lines and fit for a professional edge..."}
                        {selectedModifier === 'Relaxed' && "Softening textures and loosening the silhouette..."}
                        {selectedModifier === 'Standard' && "Balanced alignment for today's forecast."}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* 4. CONTEXT SWITCH */}
                  <GlassCard className="p-6 space-y-4">
                     <p className="text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">Where are you going?</p>
                     <div className="flex justify-center gap-4 flex-wrap">
                        {[
                          { id: 'Office', icon: Briefcase },
                          { id: 'Dinner', icon: Utensils },
                          { id: 'Casual', icon: Smile },
                          { id: 'Event', icon: PartyPopper },
                        ].map(ctx => {
                          const Icon = ctx.icon;
                          const isActive = selectedContext === ctx.id;
                          return (
                            <button
                              key={ctx.id}
                              onClick={() => handleInteraction('context', ctx.id)}
                              className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isActive ? 'bg-fuchsia-600 border-fuchsia-500 text-white scale-105 shadow-xl' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}`}
                            >
                               <Icon className="w-4 h-4" />
                               <span className="text-xs font-bold uppercase tracking-widest">{ctx.id}</span>
                            </button>
                          );
                        })}
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xs text-white/70 leading-relaxed text-center">
                           <span className="font-bold text-fuchsia-400">Pro Tip for {selectedContext}:</span> {
                             selectedContext === 'Office' ? 'Add the blazer for authority; keep the colors muted.' :
                             selectedContext === 'Dinner' ? 'Untuck the shirt and add a leather accessory for flair.' :
                             selectedContext === 'Casual' ? 'Roll up the sleeves and pair with your favorite white sneakers.' :
                             'Make it a statement—emphasize the geometric lines.'
                           }
                        </p>
                     </div>
                  </GlassCard>

                  {/* 5. THIS vs THAT */}
                  <div className="space-y-4">
                     <p className="text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">Choose Your Vibe</p>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleInteraction('vibe', 'optionA')}
                          className={`p-6 rounded-3xl border transition-all space-y-3 ${selectedVibe === 'optionA' ? 'bg-violet-600/20 border-violet-500 shadow-xl scale-105' : 'bg-black/40 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'}`}
                        >
                           <div className="text-center space-y-2">
                              <span className="text-lg font-bold">Formal</span>
                              <p className="text-[10px] text-white/50 uppercase leading-none">Clean • Tucked • Classic</p>
                           </div>
                        </button>
                        <button 
                          onClick={() => handleInteraction('vibe', 'optionB')}
                          className={`p-6 rounded-3xl border transition-all space-y-3 ${selectedVibe === 'optionB' ? 'bg-fuchsia-600/20 border-fuchsia-500 shadow-xl scale-105' : 'bg-black/40 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'}`}
                        >
                           <div className="text-center space-y-2">
                              <span className="text-lg font-bold">Fluid</span>
                              <p className="text-[10px] text-white/50 uppercase leading-none">Loose • Textured • Easy</p>
                           </div>
                        </button>
                     </div>
                  </div>

                  {/* 6. COLOR INTERACTION */}
                  <GlassCard className="p-6 space-y-6">
                    <p className="text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">Color Palette</p>
                    <div className="flex justify-center gap-6">
                      {styleResult.colors.map((color, i) => (
                        <button 
                          key={i}
                          className="group relative flex flex-col items-center gap-2"
                        >
                           <div 
                             className="w-12 h-12 rounded-full border-4 border-white/10 shadow-lg group-hover:scale-125 transition-all duration-300"
                             style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}
                           />
                           <span className="text-[10px] text-white/40 font-medium group-hover:text-white transition-colors">{styleResult.color_names[i]}</span>
                        </button>
                      ))}
                    </div>
                  </GlassCard>

                  {/* 9. WHY THIS LOOK WORKS (FOREVER OPEN) */}
                  <div className="px-2">
                    <div className="w-full py-4 border-y border-white/5 flex items-center justify-between">
                      <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold uppercase underline">Why This Look Works</span>
                    </div>
                    <div className="overflow-hidden space-y-4 pt-4">
                      <div className="grid grid-cols-1 gap-3">
                         <p className="text-xs text-white/60 border-l-2 border-fuchsia-500/30 pl-4 py-1 italic">
                            {styleResult.astrological_reason}
                         </p>
                         <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                               <Sparkles className="w-3 h-3" /> Synthesis
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed font-serif">
                               {styleResult.outfit_description}
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* 10. PRIMARY CTA STRUCTURE */}
                  <div className="space-y-6 pt-12 text-center">
                     <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Premium Actions</p>
                     
                     <button
                        onClick={() => handleGenerate(true)}
                        disabled={isGenerating || (credits !== null && credits < 5)}
                        className="w-full py-5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-2xl hover:shadow-fuchsia-500/20 rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-3 font-bold text-lg"
                      >
                        {isGenerating ? <LoadingSpinner size="sm" /> : <><Sparkles className="w-6 h-6" /> <span>Completely New Look</span></>}
                        <span className="bg-black/20 px-3 py-1 rounded-full text-xs ml-2">5 CR</span>
                      </button>

                      {/* 11. SOCIAL LOOP */}
                      <div className="flex justify-center gap-4">
                         <button 
                            onClick={handleShare}
                            disabled={isSharing}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-bold uppercase hover:bg-white/10 transition-all font-bold disabled:opacity-50"
                          >
                             {isSharing ? <LoadingSpinner size="sm" /> : <><Share2 className="w-4 h-4" /> Share</>}
                         </button>
                      </div>
                  </div>

                </div>
              ) : (
                /* INITIAL STATE */
                <div className="text-center py-20 space-y-8 animate-fade-in">
                   <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-full mx-auto flex items-center justify-center border border-white/10 shadow-2xl">
                      <Shirt className="w-10 h-10 text-fuchsia-400" />
                   </div>
                   <div className="space-y-3">
                      <h2 className="text-2xl font-bold">Discover Your Daily Synergy</h2>
                      <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                         Synthesize your sun sign, transits, and personal preferences into a daily ensemble.
                      </p>
                   </div>
                   <button
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating || (credits !== null && credits < 5)}
                    className="px-12 py-5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-2xl rounded-3xl font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
                  >
                    {isGenerating ? <LoadingSpinner size="sm" /> : <><Sparkles className="w-6 h-6" /> <span>Reveal Today's Style</span></>}
                  </button>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Uses 5 credits per Daily Reflection</p>
                </div>
              )}
            </div>
          </div>

          {/* 12. CHAT INPUT (Numerology Style) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (questionInput.trim()) navigate(`/ai-chat`, { state: { initialMessage: `Regarding my ${selectedModifier} outfit for ${selectedContext}: ${questionInput.trim()}` } });
            }}
            className="w-full px-4 py-6 md:py-8"
          >
            <div className="max-w-3xl mx-auto relative flex items-end">
              <AutoResizeTextarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (questionInput.trim()) {
                      navigate(`/ai-chat`, { state: { initialMessage: `Regarding my ${selectedModifier} outfit for ${selectedContext}: ${questionInput.trim()}` } });
                    }
                  }
                }}
                placeholder="Ask your cosmic stylist..."
                maxRows={6}
                className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20"
              />
              <button
                type="submit"
                disabled={!questionInput.trim()}
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

export default DressingStylerPage;
