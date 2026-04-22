import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { Sparkles, Shirt, Palette, Briefcase, Utensils, Smile, PartyPopper, Flame, IceCream, Coffee, Target, Star, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SharedStyleData {
  user_name: string;
  style_data: {
    headline: string;
    outfit_description: string;
    colors: string[];
    color_names: string[];
    astrological_reason: string;
    selected_context: string;
    selected_modifier: string;
    image_base64: string;
  };
  created_at: string;
}

const SharedStylePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedStyleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const loadSharedStyle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/shared-style/${shareId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to load shared look');
      const result = await res.json();
      
      if (result?.success) {
        setData(result.data);
      } else {
        setError(result?.message || 'Look not found');
      }
    } catch (err) {
      console.error('Error loading shared look:', err);
      setError('Failed to load style. The link may be invalid.');
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (shareId) {
      loadSharedStyle();
    }
  }, [shareId, loadSharedStyle]);

  if (loading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
        </div>
      </CosmicBackground>
    );
  }

  if (error || !data) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="p-8 max-w-md w-full text-center">
             <h2 className="text-xl font-bold text-white mb-2">Style Look Not Found</h2>
             <p className="text-white/70 mb-6">{error}</p>
             <button onClick={() => navigate('/')} className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-semibold rounded-lg">Go to Astro AI</button>
          </GlassCard>
        </div>
      </CosmicBackground>
    );
  }

  const { style_data, user_name } = data;
  const contextIcons: any = { Office: Briefcase, Dinner: Utensils, Casual: Smile, Event: PartyPopper };
  const modifierIcons: any = { Bolder: Flame, Minimal: IceCream, Sharper: Target, Relaxed: Coffee, Standard: Sparkles };
  
  const ContextIcon = contextIcons[style_data.selected_context] || Shirt;
  const ModifierIcon = modifierIcons[style_data.selected_modifier] || Sparkles;

  return (
    <CosmicBackground>
      <div className="min-h-screen py-8 px-4 overflow-y-auto custom-scrollbar">
        <div className="max-w-xl mx-auto mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Astro AI" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase">StyleForecaster</h1>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.2em]">Cosmic Personal Styling</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Join Astro AI</button>
        </div>

        <div className="max-w-xl mx-auto space-y-10">
          <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
                <Share2 className="w-4 h-4 text-fuchsia-400" />
                <span className="text-fuchsia-400 text-[10px] font-bold uppercase tracking-[0.3em]">Shared Style Insight</span>
             </div>
             <h1 className="text-4xl font-black font-display tracking-tight">
                <GradientText color="fuchsia">{user_name}'s Daily Ensemble</GradientText>
             </h1>
          </div>

          <div className="relative group">
            <GlassCard className="p-0 overflow-hidden border-violet-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
              <div className="aspect-[3/4] relative">
                 <img 
                   src={`data:image/png;base64,${style_data.image_base64}`} 
                   alt="Shared outfit look"
                   onLoad={() => setImageLoaded(true)}
                   className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                 />
                 <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white tracking-widest uppercase">
                       {style_data.selected_context}
                    </span>
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white/70 tracking-widest uppercase">
                       {style_data.selected_modifier}
                    </span>
                 </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <GlassCard className="p-6 flex flex-col items-center gap-3">
                <ContextIcon className="w-8 h-8 text-fuchsia-400" />
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Context</p>
                <p className="text-white font-black text-lg">{style_data.selected_context}</p>
             </GlassCard>
             <GlassCard className="p-6 flex flex-col items-center gap-3">
                <ModifierIcon className="w-8 h-8 text-violet-400" />
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Modifier</p>
                <p className="text-white font-black text-lg">{style_data.selected_modifier}</p>
             </GlassCard>
          </div>

          <GlassCard className="p-8 space-y-6">
             <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">Why This Works</p>
                <p className="text-white/90 text-sm leading-relaxed italic border-l-2 border-fuchsia-500/30 pl-4">
                   {style_data.astrological_reason}
                </p>
             </div>
             
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-400">
                   <Sparkles className="w-3 h-3" /> The Synthesis
                </div>
                <p className="text-white/80 text-base leading-relaxed">
                   {style_data.outfit_description}
                </p>
             </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-6">
            <p className="text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">The Palette</p>
            <div className="flex justify-center gap-6">
              {style_data.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div 
                     className="w-10 h-10 rounded-full border-2 border-white/10 shadow-lg"
                     style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}40` }}
                   />
                   <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">{style_data.color_names[i]}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="pt-12 pb-20 text-center space-y-6">
             <div className="p-10 rounded-3xl bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 border border-white/10 shadow-2xl">
                <h4 className="text-2xl font-bold text-white mb-2">Get Your Daily Style Forecast</h4>
                <p className="text-white/50 text-sm mb-8">Personalized outfit logic based on your unique astrology and transits.</p>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform shadow-xl w-full sm:w-auto"
                >
                  Join Astro AI Today
                </button>
             </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedStylePage;
