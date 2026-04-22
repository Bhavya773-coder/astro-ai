import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner } from './CosmicUI';
import { Sparkles, Shield, Eye, Smile, Triangle, Circle, Square, Hexagon, Star, Heart, Brain, Target, Zap, Sparkle, Share2, RefreshCw } from 'lucide-react';
import ImageUpload from './ImageUpload';
import PaywallOverlay from './PaywallOverlay';
import { getFaceReading, getReadingHistory, shareFaceReading, apiFetch } from '../api/client';
import AutoResizeTextarea from './AutoResizeTextarea';

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

const FaceReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [hasExistingReading, setHasExistingReading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageReady = (base64: string, type: string) => {
    setImageBase64(base64);
    setMimeType(type);
    // Don't clear result when user uploads a new image, let them decide to re-analyze
    setShowPaywall(false);
  };

  // Normalize personality scores from 0-100 to 0-10 scale
  const normalizeScore = (value: number): number => {
    if (value > 10) {
      return Math.round(value / 10);
    }
    return value;
  };

  const handleAnalyze = async (forceRegenerate = false) => {
    if (!imageBase64) {
      toast.error('Please upload a face photo first');
      return;
    }

    setIsAnalyzing(true);
    setShowPaywall(false);

    try {
      const response = await getFaceReading(imageBase64, mimeType, forceRegenerate);

      if (response.success) {
        setResult(response.data);
        setHasExistingReading(true);
        if (response.source === 'generated') {
          toast.success('Face reading completed!');
          // Notify other components (like Sidebar) to reload credits
          window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: response.remaining_credits } }));
        } else {
          toast.success('Face reading completed! (cached)');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('CREDITS_REQUIRED') || err.code === 'CREDITS_REQUIRED') {
        setShowPaywall(true);
      } else if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand')) {
        toast.error('AI service is temporarily busy. Please try again in a moment.');
      } else {
        toast.error(err?.message || 'Failed to analyze face. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyze = () => {
    handleAnalyze(true); // Force regeneration
  };

  // Share face reading
  const handleShare = async () => {
    if (!result) return;

    setIsSharing(true);
    try {
      const profileRes = await apiFetch('/api/profile');
      const userName = profileRes?.data?.full_name || 'Anonymous';

      const imageUrl = imageBase64 ? `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` : undefined;
      const res = await shareFaceReading(userName, result, imageUrl);

      if (res?.success && res?.data?.shareId) {
        // Construct share URL using current domain (localhost:3000 or astroai4u.com)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://astroai4u.com';
        const shareUrl = `${baseUrl}/shared-face-reading/${res.data.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Face reading link copied to clipboard!');
      } else {
        toast.error('Failed to share face reading');
      }
    } catch (err) {
      console.error('Error sharing face reading:', err);
      toast.error('Failed to share face reading');
    } finally {
      setIsSharing(false);
    }
  };

  // Load previous face reading on mount
  const loadPreviousReading = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await getReadingHistory('face');
      if (response.success && response.data && response.data.length > 0) {
        const mostRecent = response.data[0];
        if (mostRecent.result) {
          setResult(mostRecent.result);
          setHasExistingReading(true);
          // Restore image if available - use setTimeout to not block UI
          if (mostRecent.image_data) {
            setImageBase64(mostRecent.image_data);
            setMimeType(mostRecent.mime_type || 'image/jpeg');
            // Defer image preview creation to next tick to avoid blocking
            setTimeout(() => {
              const dataUrl = `data:${mostRecent.mime_type || 'image/jpeg'};base64,${mostRecent.image_data}`;
              setImagePreview(dataUrl);
            }, 0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load previous face reading:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadPreviousReading();
  }, [loadPreviousReading]);

  const renderProgressBar = (value: number, label: string, color: string) => {
    const normalizedValue = normalizeScore(value);
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-white/70 text-sm">{label}</span>
          <span className="text-white font-medium">{normalizedValue}/10</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color}`}
            style={{ width: `${normalizedValue * 10}%` }}
          />
        </div>
      </div>
    );
  };

  const getFaceShapeIcon = (shape: string) => {
    switch (shape.toLowerCase()) {
      case 'oval': return <Circle className="w-5 h-5" />;
      case 'round': return <Circle className="w-5 h-5" />;
      case 'square': return <Square className="w-5 h-5" />;
      case 'triangle': return <Triangle className="w-5 h-5" />;
      case 'diamond': return <Hexagon className="w-5 h-5" />;
      case 'heart': return <Heart className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  // Create a dashboard chat and navigate
  const createDashboardChatAndNavigate = async (message: string) => {
    try {
      const res = await apiFetch('/api/ai-chat/list');
      let dashboardChatNumber = 1;

      if (res?.success && Array.isArray(res?.data)) {
        const dashboardChats = res.data.filter((chat: any) =>
          chat.title?.startsWith('Dashboard Chat')
        );
        dashboardChatNumber = dashboardChats.length + 1;
      }

      const createRes = await apiFetch('/api/ai-chat/create', {
        method: 'POST',
        body: JSON.stringify({ title: `Dashboard Chat ${dashboardChatNumber}` })
      });

      if (createRes?.success && createRes?.data) {
        const newChat = createRes.data;
        navigate(`/ai-chat?chatId=${newChat._id}`, {
          state: { initialMessage: message }
        });
      } else {
        navigate('/ai-chat', { state: { initialMessage: message } });
      }
    } catch (err) {
      console.error('Failed to create dashboard chat:', err);
      navigate('/ai-chat', { state: { initialMessage: message } });
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    await createDashboardChatAndNavigate(questionInput.trim());
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16">
              <h1 className="text-3xl md:text-4xl font-bold font-display">Face Reading</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                Discover personality traits and destiny insights through the ancient art of physiognomy, interpreted by AI.
              </p>

              {/* Privacy Notice */}
              <GlassCard className="p-6 mb-8 mt-8 border-cyan-500/30 bg-cyan-500/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Privacy Protection</h3>
                    <p className="text-white/70">
                      Your photo is processed securely for analysis only and is not stored permanently 
                      on our servers. Images are automatically deleted after the reading is complete.
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Instructions */}
              <GlassCard className="p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Photo Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { text: 'Clear, well-lit photo with no shadows on face' },
                    { text: 'Front-facing, neutral expression, eyes open' },
                    { text: 'Remove glasses and ensure full face is visible' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <span className="text-cyan-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-white/70 text-sm">{item.text}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Image Upload */}
              <GlassCard className="p-6 mb-8">
                <ImageUpload
                  onImageReady={handleImageReady}
                  maxSizeMB={5}
                  instructions="Upload a clear front-facing photo of your face"
                  initialPreview={imagePreview}
                  initialMimeType={mimeType}
                />

                {isLoadingHistory ? (
                  <div className="w-full mt-6 py-3 px-6 rounded-lg bg-white/10 flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-white/70">Loading previous reading...</span>
                  </div>
                ) : (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleAnalyze(hasExistingReading)}
                      disabled={!imageBase64 || isAnalyzing}
                      className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          {hasExistingReading ? 'Re-analyzing...' : 'Analyzing your features...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {hasExistingReading ? 'Re-analyze Face' : 'Analyze Face'}
                        </>
                      )}
                    </button>
                  </div>
                )}
                {hasExistingReading && (
                  <p className="text-center text-white/50 text-xs mt-2">
                    Re-analyzing will deduct 1 credit and generate a fresh reading
                  </p>
                )}
              </GlassCard>

              {/* Paywall Overlay */}
              {showPaywall && (
                <PaywallOverlay featureName="Face Reading" />
              )}

              {/* AI Analysis Loading Overlay */}
              {isAnalyzing && (
                <GlassCard className="p-8 mb-8 border-cyan-500/50 bg-gradient-to-br from-cyan-900/30 to-blue-900/30">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {hasExistingReading ? 'AI is Re-analyzing Your Face...' : 'AI is Analyzing Your Face...'}
                    </h3>
                    <p className="text-white/70 max-w-md mb-4">
                      Our advanced AI is studying your facial features, bone structure, and energy patterns. This may take up to a minute.
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Scanning facial geometry...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span>Reading elemental energies...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '1s' }} />
                        <span>Generating personality insights...</span>
                      </div>
                    </div>
                    <div className="mt-6 w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Results */}
              {result && !showPaywall && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Top Badges with Share Button */}
                  <div className="flex flex-wrap justify-center gap-4 items-center">
                    <GlassCard className="px-6 py-3 inline-flex items-center gap-3">
                      {getFaceShapeIcon(result.face_shape)}
                      <div>
                        <p className="text-white/60 text-xs">Face Shape</p>
                        <p className="text-white font-semibold">{result.face_shape}</p>
                      </div>
                    </GlassCard>

                    <GlassCard className="px-6 py-3 inline-flex items-center gap-3">
                      <Sparkle className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-white/60 text-xs">Element</p>
                        <p className="text-white font-semibold">{result.element_type}</p>
                      </div>
                    </GlassCard>

                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="p-3 rounded-full bg-white/10 hover:bg-fuchsia-500/20 text-white/70 hover:text-fuchsia-400 transition-all disabled:opacity-50"
                      title="Share face reading"
                    >
                      {isSharing ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <Share2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Overall Aura */}
                  <GlassCard className="p-6 border-cyan-500/30">
                    <h3 className="text-xl font-bold text-white mb-3">Overall Aura</h3>
                    <p className="text-white/80">{result.overall_aura}</p>
                  </GlassCard>

                  {/* Feature Readings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: 'Forehead', text: result.forehead_reading, icon: <div className="w-5 h-3 border-2 border-cyan-400 rounded-t" /> },
                      { title: 'Eyes', text: result.eyes_reading, icon: <Eye className="w-5 h-5" /> },
                      { title: 'Nose', text: result.nose_reading, icon: <div className="w-3 h-5 border-2 border-cyan-400 rounded" /> },
                      { title: 'Mouth', text: result.mouth_reading, icon: <Smile className="w-5 h-5" /> },
                      { title: 'Chin', text: result.chin_reading, icon: <div className="w-4 h-3 border-2 border-cyan-400 rounded-b" /> }
                    ].map(({ title, text, icon }) => (
                      <GlassCard key={title} className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-cyan-400">{icon}</div>
                          <h4 className="font-semibold text-white">{title}</h4>
                        </div>
                        <p className="text-white/70 text-sm">{text}</p>
                      </GlassCard>
                    ))}

                    {/* Personality Scores */}
                    <GlassCard className="p-5 lg:col-span-2 lg:row-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-cyan-400" />
                        <h4 className="font-semibold text-white">Personality Scores</h4>
                      </div>
                      {renderProgressBar(result.personality_scores.leadership, 'Leadership', 'from-red-500 to-orange-500')}
                      {renderProgressBar(result.personality_scores.creativity, 'Creativity', 'from-purple-500 to-pink-500')}
                      {renderProgressBar(result.personality_scores.empathy, 'Empathy', 'from-green-500 to-teal-500')}
                      {renderProgressBar(result.personality_scores.ambition, 'Ambition', 'from-blue-500 to-cyan-500')}
                      {renderProgressBar(result.personality_scores.spirituality, 'Spirituality', 'from-violet-500 to-fuchsia-500')}
                    </GlassCard>
                  </div>

                  {/* Strength & Trait */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassCard className="p-5 border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <h4 className="font-semibold text-white">Dominant Strength</h4>
                      </div>
                      <p className="text-white/80">{result.dominant_strength}</p>
                    </GlassCard>

                    <GlassCard className="p-5 border-fuchsia-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-5 h-5 text-fuchsia-400" />
                        <h4 className="font-semibold text-white">Hidden Trait</h4>
                      </div>
                      <p className="text-white/80">{result.hidden_trait}</p>
                    </GlassCard>
                  </div>

                  {/* Life Purpose */}
                  <GlassCard className="p-6 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">Life Purpose Hint</h3>
                    </div>
                    <p className="text-white/90 text-lg">{result.life_purpose_hint}</p>
                  </GlassCard>

                  {/* Compatibility & Special Marking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassCard className="p-5 text-center">
                      <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white mb-1">Compatible With</h4>
                      <p className="text-xl text-pink-400">{result.compatible_with}</p>
                    </GlassCard>

                    {result.special_marking && (
                      <GlassCard className="p-5 border-yellow-500/30">
                        <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-white mb-1 text-center">Special Marking</h4>
                        <p className="text-white/80 text-center">{result.special_marking}</p>
                      </GlassCard>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CHAT INPUT - ChatGPT Style - OUTSIDE scroll area */}
          <form
            onSubmit={handleAskQuestion}
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
                      handleAskQuestion(e as any);
                    }
                  }
                }}
                placeholder="Ask AstroAi4u about your face reading..."
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

export default FaceReadingPage;

