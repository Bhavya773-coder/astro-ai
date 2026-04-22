import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { Coffee, Sparkles, Heart, Briefcase, Activity, Plane, AlertTriangle, Hash, Clock, MessageCircle } from 'lucide-react';

interface CoffeeSymbol {
  symbol: string;
  position: string;
  meaning: string;
}

interface CoffeeReadingResult {
  cup_overview: string;
  symbols_identified: CoffeeSymbol[];
  love_fortune: string;
  career_fortune: string;
  health_fortune: string;
  travel_fortune: string;
  warning: string | null;
  overall_fortune: string;
  lucky_number: number;
  time_frame: string;
  special_message: string;
}

interface SharedData {
  user_name: string;
  coffee_data: CoffeeReadingResult;
  image_url?: string;
  created_at: string;
}

const SharedCoffeeReadingPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSharedReading = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/shared-coffee-reading/${shareId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to load shared reading');
      const result = await res.json();
      
      if (result?.success) {
        setData({
          user_name: result.data.user_name,
          coffee_data: result.data.coffee_reading_data,
          image_url: result.data.image_url,
          created_at: result.data.created_at
        });
      } else {
        setError(result?.message || 'Reading not found');
      }
    } catch (err) {
      console.error('Error loading shared reading:', err);
      setError('Failed to load reading. The link may be invalid.');
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (shareId) {
      loadSharedReading();
    }
  }, [shareId, loadSharedReading]);

  if (loading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </CosmicBackground>
    );
  }

  if (error || !data) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="p-8 max-w-md w-full text-center">
             <h2 className="text-xl font-bold text-white mb-2">Reading Not Found</h2>
             <p className="text-white/70 mb-6">{error}</p>
             <button onClick={() => navigate('/')} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-2 px-6 rounded-lg">Go to Astro AI</button>
          </GlassCard>
        </div>
      </CosmicBackground>
    );
  }

  const result = data.coffee_data;

  return (
    <CosmicBackground>
      <div className="min-h-screen py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Astro AI" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase">Astro AI</h1>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.2em]">Cosmic Coffee Reading</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back to App</button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em]">Shared Reading</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
                <GradientText color="amber">Coffee Reading for {data.user_name}</GradientText>
             </h1>
          </div>

          {data.image_url && (
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <GlassCard className="relative p-2 overflow-hidden rounded-3xl border-amber-500/30">
                  <img 
                    src={data.image_url} 
                    alt="Analyzed Coffee Cup" 
                    className="w-full max-w-[300px] aspect-square object-cover rounded-2xl shadow-2xl"
                  />
                </GlassCard>
              </div>
            </div>
          )}

          <div className="grid gap-6">
            <GlassCard className="p-8 relative overflow-hidden ring-1 ring-white/10" glow="amber">
              <h3 className="text-2xl font-bold text-white mb-4">Cup Overview</h3>
              <p className="text-white/80 text-lg leading-relaxed">{result.cup_overview}</p>
            </GlassCard>

            {result.symbols_identified && result.symbols_identified.length > 0 && (
              <GlassCard className="p-8">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                   <Sparkles className="w-5 h-5 text-amber-400" />
                   Symbols Identified
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.symbols_identified.map((symbol, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold flex flex-col"
                    >
                      <span className="text-white mb-1">{symbol.symbol}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-tighter">{symbol.position}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Love Fortune', text: result.love_fortune, icon: <Heart className="w-5 h-5" /> },
                { title: 'Career Fortune', text: result.career_fortune, icon: <Briefcase className="w-5 h-5" /> },
                { title: 'Health Fortune', text: result.health_fortune, icon: <Activity className="w-5 h-5" /> },
                { title: 'Travel Fortune', text: result.travel_fortune, icon: <Plane className="w-5 h-5" /> }
              ].map(({ title, text, icon }) => (
                <GlassCard key={title} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-amber-400">{icon}</div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm">{title}</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{text}</p>
                </GlassCard>
              ))}
            </div>

            {result.warning && (
              <GlassCard className="p-6 border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-bold text-yellow-400 uppercase tracking-widest text-sm">Vital Warning</h4>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{result.warning}</p>
              </GlassCard>
            )}

            <GlassCard className="p-8">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">Overall Fortune</h3>
              <p className="text-white/80 text-lg leading-relaxed italic">"{result.overall_fortune}"</p>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-8 text-center">
                <Hash className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Lucky Number</h4>
                <p className="text-2xl font-black text-amber-400">{result.lucky_number}</p>
              </GlassCard>

              <GlassCard className="p-8 text-center">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Time Frame</h4>
                <p className="text-xl font-black text-white">{result.time_frame}</p>
              </GlassCard>

              <GlassCard className="p-8 text-center">
                <MessageCircle className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Special Message</h4>
                <p className="text-sm text-white/80 italic font-medium leading-relaxed">{result.special_message}</p>
              </GlassCard>
            </div>

            <div className="mt-12 p-12 rounded-[2rem] bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-white/10 text-center">
              <h4 className="text-2xl font-bold text-white mb-4">What's in Your Cup?</h4>
              <p className="text-white/60 mb-8 max-w-md mx-auto">Upload a photo of your coffee cup and let AI reveal your future.</p>
              <button 
                onClick={() => navigate('/signup')}
                className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform shadow-2xl"
              >
                Read My Cup Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedCoffeeReadingPage;
