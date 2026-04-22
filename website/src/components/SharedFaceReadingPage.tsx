import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { Eye, Smile, Triangle, Circle, Square, Hexagon, Star, Heart, Brain, Target, Zap, Sparkle, Sparkles } from 'lucide-react';

interface PersonalityScores {
  leadership: number;
  creativity: number;
  empathy: number;
  ambition: number;
  spirituality: number;
}

interface FaceReadingResult {
  face_shape: string;
  element_type: string;
  overall_aura: string;
  forehead_reading: string;
  eyes_reading: string;
  nose_reading: string;
  mouth_reading: string;
  chin_reading: string;
  dominant_strength: string;
  hidden_trait: string;
  life_purpose_hint: string;
  compatible_with: string;
  personality_scores: PersonalityScores;
  special_marking: string | null;
}

interface SharedData {
  user_name: string;
  face_data: FaceReadingResult;
  image_url?: string;
  created_at: string;
}

const SharedFaceReadingPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSharedReading = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/shared-face-reading/${shareId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to load shared reading');
      const result = await res.json();
      
      if (result?.success) {
        setData({
          user_name: result.data.user_name,
          face_data: result.data.face_reading_data,
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

  const getFaceShapeIcon = (shape: string) => {
    switch (shape?.toLowerCase()) {
      case 'oval': return <Circle className="w-5 h-5" />;
      case 'round': return <Circle className="w-5 h-5" />;
      case 'square': return <Square className="w-5 h-5" />;
      case 'triangle': return <Triangle className="w-5 h-5" />;
      case 'diamond': return <Hexagon className="w-5 h-5" />;
      case 'heart': return <Heart className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const renderProgressBar = (value: number, label: string, color: string) => {
    // Scores are 0-10 or 0-100, normalize to 0-10
    const normalizedValue = value > 10 ? Math.round(value / 10) : value;
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{label}</span>
          <span className="text-white font-black text-xs">{normalizedValue}/10</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color}`}
            style={{ width: `${normalizedValue * 10}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
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
             <button onClick={() => navigate('/')} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-2 px-6 rounded-lg">Go to Astro AI</button>
          </GlassCard>
        </div>
      </CosmicBackground>
    );
  }

  const result = data.face_data;

  return (
    <CosmicBackground>
      <div className="min-h-screen py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Astro AI" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase">Astro AI</h1>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.2em]">Face Analysis & Physiognomy</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back to App</button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Sparkle className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.3em]">Shared Reading</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
                <GradientText color="cyan">Face Reading for {data.user_name}</GradientText>
             </h1>
          </div>

          {data.image_url && (
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <GlassCard className="relative p-2 overflow-hidden rounded-3xl border-cyan-500/30">
                  <img 
                    src={data.image_url} 
                    alt="Analyzed Face" 
                    className="w-full max-w-[300px] aspect-square object-cover rounded-2xl shadow-2xl"
                  />
                </GlassCard>
              </div>
            </div>
          )}

          <div className="grid gap-6">
            <div className="flex flex-wrap justify-center gap-4">
              <GlassCard className="px-6 py-4 inline-flex items-center gap-4">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                   {getFaceShapeIcon(result.face_shape)}
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Face Shape</p>
                  <p className="text-white font-black">{result.face_shape}</p>
                </div>
              </GlassCard>

              <GlassCard className="px-6 py-4 inline-flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                   <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Aura Element</p>
                  <p className="text-white font-black">{result.element_type}</p>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="p-8 relative overflow-hidden ring-1 ring-white/10" glow="cyan">
              <h3 className="text-2xl font-bold text-white mb-4">Overall Aura</h3>
              <p className="text-white/80 text-lg leading-relaxed">{result.overall_aura}</p>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Forehead', text: result.forehead_reading, icon: <div className="w-5 h-3 border-2 border-cyan-400 rounded-t" /> },
                { title: 'Eyes', text: result.eyes_reading, icon: <Eye className="w-5 h-5" /> },
                { title: 'Nose', text: result.nose_reading, icon: <div className="w-3 h-5 border-2 border-cyan-400 rounded" /> },
                { title: 'Mouth', text: result.mouth_reading, icon: <Smile className="w-5 h-5" /> },
                { title: 'Chin', text: result.chin_reading, icon: <div className="w-4 h-3 border-2 border-cyan-400 rounded-b" /> }
              ].map(({ title, text, icon }) => (
                <GlassCard key={title} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-cyan-400">{icon}</div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm">{title}</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{text}</p>
                </GlassCard>
              ))}

              <GlassCard className="p-6 lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm">Traits</h4>
                </div>
                {renderProgressBar(result.personality_scores.leadership, 'Leadership', 'from-red-500 to-orange-500')}
                {renderProgressBar(result.personality_scores.creativity, 'Creativity', 'from-purple-500 to-pink-500')}
                {renderProgressBar(result.personality_scores.empathy, 'Empathy', 'from-green-500 to-teal-500')}
                {renderProgressBar(result.personality_scores.ambition, 'Ambition', 'from-blue-500 to-cyan-500')}
                {renderProgressBar(result.personality_scores.spirituality, 'Spirituality', 'from-violet-500 to-fuchsia-500')}
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8 border-cyan-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <h4 className="text-white font-black uppercase tracking-widest text-sm">Dominant Strength</h4>
                </div>
                <p className="text-white/80 leading-relaxed font-medium">{result.dominant_strength}</p>
              </GlassCard>

              <GlassCard className="p-8 border-fuchsia-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-fuchsia-400" />
                  <h4 className="text-white font-black uppercase tracking-widest text-sm">Hidden Trait</h4>
                </div>
                <p className="text-white/80 leading-relaxed font-medium">{result.hidden_trait}</p>
              </GlassCard>
            </div>

            <GlassCard className="p-10 border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 text-center">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-[0.2em]">Life Purpose Hint</h3>
              <p className="text-white/90 text-xl font-medium leading-relaxed italic max-w-2xl mx-auto">"{result.life_purpose_hint}"</p>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8 text-center">
                <Heart className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Compatible With</h4>
                <p className="text-2xl font-black text-pink-400">{result.compatible_with}</p>
              </GlassCard>

              {result.special_marking && (
                <GlassCard className="p-8 text-center border-yellow-500/30">
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <h4 className="text-white/40 text-xs font-bold uppercase mb-2">Special Marking</h4>
                  <p className="text-white font-bold leading-relaxed">{result.special_marking}</p>
                </GlassCard>
              )}
            </div>

            <div className="mt-12 p-12 rounded-[2rem] bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-white/10 text-center">
              <h4 className="text-2xl font-bold text-white mb-4">What Does Your Face Say?</h4>
              <p className="text-white/60 mb-8 max-w-md mx-auto">Our AI analyzes your features to reveal your hidden potential and destiny.</p>
              <button 
                onClick={() => navigate('/signup')}
                className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform shadow-2xl"
              >
                Scan My Face Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedFaceReadingPage;
