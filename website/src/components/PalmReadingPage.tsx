import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner } from './CosmicUI';
import { Hand, Sparkles, Star, Lightbulb, Heart, Brain, Briefcase, Sun, Mountain, Palette, Hash, Key, Share2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import PaywallOverlay from './PaywallOverlay';
import { getPalmReading, getReadingHistory, sharePalmReading, apiFetch } from '../api/client';
import AutoResizeTextarea from './AutoResizeTextarea';

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

const PalmReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PalmReadingResult | null>(null);
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

  const handleAnalyze = async (forceRegenerate = false) => {
    if (!imageBase64) {
      toast.error('Please upload a palm image first');
      return;
    }

    setIsAnalyzing(true);
    setShowPaywall(false);

    try {
      const response = await getPalmReading(imageBase64, mimeType, forceRegenerate);

      if (response.success) {
        setResult(response.data);
        setHasExistingReading(true);
        if (response.source === 'generated') {
          toast.success('Palm reading completed!');
          // Notify other components (like Sidebar) to reload credits
          window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: response.remaining_credits } }));
        } else {
          toast.success('Palm reading completed! (cached)');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('CREDITS_REQUIRED') || err.code === 'CREDITS_REQUIRED') {
        setShowPaywall(true);
      } else if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand')) {
        toast.error('AI service is temporarily busy. Please try again in a moment.');
      } else {
        toast.error(err?.message || 'Failed to analyze palm. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Share palm reading
  const handleShare = async () => {
    if (!result) return;

    setIsSharing(true);
    try {
      const profileRes = await apiFetch('/api/profile');
      const userName = profileRes?.data?.full_name || 'Anonymous';

      const imageUrl = imageBase64 ? `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` : undefined;
      const res = await sharePalmReading(userName, result, imageUrl);

      if (res?.success && res?.data?.shareId) {
        // Construct share URL using current domain (localhost:3000 or astroai4u.com)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://astroai4u.com';
        const shareUrl = `${baseUrl}/shared-palm-reading/${res.data.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Palm reading link copied to clipboard!');
      } else {
        toast.error('Failed to share palm reading');
      }
    } catch (err) {
      console.error('Error sharing palm reading:', err);
      toast.error('Failed to share palm reading');
    } finally {
      setIsSharing(false);
    }
  };

  // Load previous palm reading on mount
  const loadPreviousReading = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await getReadingHistory('palm');
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
      console.error('Failed to load previous palm reading:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadPreviousReading();
  }, [loadPreviousReading]);

  const renderStarScore = (score: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= score ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>
    );
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
              <h1 className="text-3xl md:text-4xl font-bold font-display">Palm Reading</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                Discover what your palm lines reveal about your destiny. Our AI analyzes your hand's unique patterns to provide personalized insights.
              </p>

              {/* Instructions */}
              <GlassCard className="p-6 mb-8 mt-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  How to Get the Best Reading
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { step: 1, text: 'Find good lighting - natural light works best' },
                    { step: 2, text: 'Place your hand on a flat, contrasting surface' },
                    { step: 3, text: 'Use your dominant hand for the reading' },
                    { step: 4, text: 'Fill the frame with your entire palm visible' }
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center shrink-0">
                        <span className="text-fuchsia-400 font-bold text-sm">{step}</span>
                      </div>
                      <p className="text-white/70 text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Image Upload */}
              <GlassCard className="p-6 mb-8">
                <ImageUpload
                  onImageReady={handleImageReady}
                  maxSizeMB={5}
                  instructions="Upload a clear photo of your dominant hand, palm facing up"
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
                      className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          {hasExistingReading ? 'Re-analyzing...' : 'Analyzing your palm...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {hasExistingReading ? 'Re-analyze Palm' : 'Analyze Palm'}
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
                <PaywallOverlay featureName="Palm Reading" />
              )}

              {/* AI Analysis Loading Overlay */}
              {isAnalyzing && (
                <GlassCard className="p-8 mb-8 border-fuchsia-500/50 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Hand className="w-10 h-10 text-white animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {hasExistingReading ? 'AI is Re-analyzing Your Palm...' : 'AI is Analyzing Your Palm...'}
                    </h3>
                    <p className="text-white/70 max-w-md mb-4">
                      Our advanced AI is studying your palm lines, mounts, and hand structure. This may take up to a minute.
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                        <span>Scanning palm lines...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span>Reading line patterns...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: '1s' }} />
                        <span>Consulting the Heavens...</span>
                      </div>
                    </div>
                    <div className="mt-6 w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Results */}
              {result && !showPaywall && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Header with Share Button */}
                  <div className="flex flex-wrap justify-center gap-4 items-center">
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="p-3 rounded-full bg-white/10 hover:bg-fuchsia-500/20 text-white/70 hover:text-fuchsia-400 transition-all disabled:opacity-50"
                      title="Share palm reading"
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

                  {/* Overall Summary */}
                  <GlassCard className="p-6 border-fuchsia-500/30">
                    <h3 className="text-xl font-bold text-white mb-3">Overall Summary</h3>
                    <p className="text-white/80">{result.overall_summary}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/20">
                      <span className="text-fuchsia-400 font-medium">Hand Type:</span>
                      <span className="text-white">{result.hand_type}</span>
                    </div>
                  </GlassCard>

                  {/* Lines Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: 'Life Line', text: result.life_line, icon: <Star className="w-5 h-5" />, score: result.vitality_score },
                      { title: 'Heart Line', text: result.heart_line, icon: <Heart className="w-5 h-5" />, score: result.love_score },
                      { title: 'Head Line', text: result.head_line, icon: <Brain className="w-5 h-5" />, score: null },
                      { title: 'Fate Line', text: result.fate_line, icon: <Briefcase className="w-5 h-5" />, score: result.career_score },
                      { title: 'Sun Line', text: result.sun_line, icon: <Sun className="w-5 h-5" />, score: null },
                      { title: 'Mount of Venus', text: result.mount_of_venus, icon: <Mountain className="w-5 h-5" />, score: null }
                    ].map(({ title, text, icon, score }) => (
                      <GlassCard key={title} className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-fuchsia-400">{icon}</div>
                          <h4 className="font-semibold text-white">{title}</h4>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{text}</p>
                        {score !== null && (
                          <div className="mt-2">
                          {renderStarScore(score)}
                          </div>
                        )}
                      </GlassCard>
                    ))}
                  </div>

                  {/* Lucky & Key Prediction */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassCard className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Palette className="w-5 h-5 text-fuchsia-400" />
                        <h4 className="font-semibold text-white">Lucky Color</h4>
                      </div>
                      <p className="text-2xl font-bold text-fuchsia-400">{result.lucky_color}</p>
                    </GlassCard>

                    <GlassCard className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Hash className="w-5 h-5 text-fuchsia-400" />
                        <h4 className="font-semibold text-white">Lucky Number</h4>
                      </div>
                      <p className="text-2xl font-bold text-fuchsia-400">{result.lucky_number}</p>
                    </GlassCard>

                    <GlassCard className="p-5 col-span-1 md:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-5 h-5 text-fuchsia-400" />
                        <h4 className="font-semibold text-white">Key Prediction</h4>
                      </div>
                      <p className="text-white/80 text-sm">{result.key_prediction}</p>
                    </GlassCard>
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
                placeholder="Ask AstroAi4u about your palm reading..."
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

export default PalmReadingPage;

