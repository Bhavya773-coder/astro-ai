import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { Hand, Star, Heart, Brain, Briefcase, Sun, Mountain, Palette, Hash, Key } from 'lucide-react';

interface PalmReadingResult {
  hand_type: string;
  overall_summary: string;
  life_line: string;
  heart_line: string;
  head_line: string;
  fate_line: string;
  sun_line: string;
  mount_of_venus: string;
  vitality_score: number;
  love_score: number;
  career_score: number;
  lucky_color: string;
  lucky_number: number;
  key_prediction: string;
}

interface SharedData {
  user_name: string;
  palm_data: PalmReadingResult;
  image_url?: string;
  created_at: string;
}

const SharedPalmReadingPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSharedReading = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/shared-palm-reading/${shareId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to load shared reading');
      const result = await res.json();
      
      if (result?.success) {
        setData({
          user_name: result.data.user_name,
          palm_data: result.data.palm_reading_data,
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

  const renderStarScore = (score: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= score ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
      ))}
    </div>
  );

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
             <h2 className="text-xl font-bold text-white mb-2">Reading Not Found</h2>
             <p className="text-white/70 mb-6">{error}</p>
             <button onClick={() => navigate('/')} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-2 px-6 rounded-lg">Go to Astro AI</button>
          </GlassCard>
        </div>
      </CosmicBackground>
    );
  }

  const result = data.palm_data;

  return (
    <CosmicBackground>
      <div className="min-h-screen py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Astro AI" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase">Astro AI</h1>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.2em]">Cosmic Palm Reading</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back to App</button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-6">
                <Hand className="w-4 h-4 text-fuchsia-400" />
                <span className="text-fuchsia-400 text-[10px] font-bold uppercase tracking-[0.3em]">Shared Reading</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
                <GradientText>Palm Analysis for {data.user_name}</GradientText>
             </h1>
          </div>

          {data.image_url && (
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <GlassCard className="relative p-2 overflow-hidden rounded-3xl border-fuchsia-500/30">
                  <img 
                    src={data.image_url} 
                    alt="Analyzed Palm" 
                    className="w-full max-w-[300px] aspect-[3/4] object-cover rounded-2xl shadow-2xl"
                  />
                </GlassCard>
              </div>
            </div>
          )}

          <div className="grid gap-6">
            <GlassCard className="p-8 relative overflow-hidden ring-1 ring-white/10" glow="purple">
              <h3 className="text-2xl font-bold text-white mb-4">Overall Summary</h3>
              <p className="text-white/80 text-lg leading-relaxed">{result.overall_summary}</p>
              <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                <span className="text-fuchsia-400 font-bold uppercase text-xs tracking-widest">Hand Type:</span>
                <span className="text-white font-semibold">{result.hand_type}</span>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Life Line', text: result.life_line, icon: <Star className="w-5 h-5" />, score: result.vitality_score },
                { title: 'Heart Line', text: result.heart_line, icon: <Heart className="w-5 h-5" />, score: result.love_score },
                { title: 'Head Line', text: result.head_line, icon: <Brain className="w-5 h-5" />, score: null },
                { title: 'Fate Line', text: result.fate_line, icon: <Briefcase className="w-5 h-5" />, score: result.career_score },
                { title: 'Sun Line', text: result.sun_line, icon: <Sun className="w-5 h-5" />, score: null },
                { title: 'Mount of Venus', text: result.mount_of_venus, icon: <Mountain className="w-5 h-5" />, score: null }
              ].map(({ title, text, icon, score }) => (
                <GlassCard key={title} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-fuchsia-400">{icon}</div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm">{title}</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">{text}</p>
                  {score !== null && renderStarScore(score)}
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-8 text-center">
                <Palette className="w-8 h-8 text-fuchsia-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Lucky Color</h4>
                <p className="text-2xl font-black text-fuchsia-400">{result.lucky_color}</p>
              </GlassCard>

              <GlassCard className="p-8 text-center">
                <Hash className="w-8 h-8 text-fuchsia-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Lucky Number</h4>
                <p className="text-2xl font-black text-fuchsia-400">{result.lucky_number}</p>
              </GlassCard>

              <GlassCard className="p-8">
                <Key className="w-8 h-8 text-fuchsia-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2 text-center">Key Prediction</h4>
                <p className="text-white/80 text-sm text-center leading-relaxed">{result.key_prediction}</p>
              </GlassCard>
            </div>

            <div className="mt-12 p-12 rounded-[2rem] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 text-center">
              <h4 className="text-2xl font-bold text-white mb-4">Discover Your Own Path</h4>
              <p className="text-white/60 mb-8 max-w-md mx-auto">Get a personalized palm reading and unlock the secrets hidden in your lines.</p>
              <button 
                onClick={() => navigate('/signup')}
                className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform shadow-2xl"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedPalmReadingPage;
