import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner } from './CosmicUI';
import { Coffee, Sparkles, Heart, Briefcase, Activity, Plane, AlertTriangle, Hash, Clock, MessageCircle, Share2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import PaywallOverlay from './PaywallOverlay';
import { getCoffeeReading, getReadingHistory, shareCoffeeReading, apiFetch } from '../api/client';
import AutoResizeTextarea from './AutoResizeTextarea';

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

const CoffeeReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CoffeeReadingResult | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRitual, setShowRitual] = useState(false);
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
      toast.error('Please upload a coffee cup image first');
      return;
    }

    setIsAnalyzing(true);
    setShowPaywall(false);

    try {
      const response = await getCoffeeReading(imageBase64, mimeType, forceRegenerate);

      if (response.success) {
        setResult(response.data);
        setHasExistingReading(true);
        if (response.source === 'generated') {
          toast.success('Coffee reading completed!');
          // Notify other components (like Sidebar) to reload credits
          window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: response.remaining_credits } }));
        } else {
          toast.success('Coffee reading completed! (cached)');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('CREDITS_REQUIRED') || err.code === 'CREDITS_REQUIRED') {
        setShowPaywall(true);
      } else if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand')) {
        toast.error('AI service is temporarily busy. Please try again in a moment.');
      } else {
        toast.error(err?.message || 'Failed to analyze coffee cup. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Share coffee reading
  const handleShare = async () => {
    if (!result) return;

    setIsSharing(true);
    try {
      const profileRes = await apiFetch('/api/profile');
      const userName = profileRes?.data?.full_name || 'Anonymous';

      const imageUrl = imageBase64 ? `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` : undefined;
      const res = await shareCoffeeReading(userName, result, imageUrl);

      if (res?.success && res?.data?.shareId) {
        // Construct share URL using current domain (localhost:3000 or astroai4u.com)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://astroai4u.com';
        const shareUrl = `${baseUrl}/shared-coffee-reading/${res.data.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Coffee reading link copied to clipboard!');
      } else {
        toast.error('Failed to share coffee reading');
      }
    } catch (err) {
      console.error('Error sharing coffee reading:', err);
      toast.error('Failed to share coffee reading');
    } finally {
      setIsSharing(false);
    }
  };

  // Load previous coffee reading on mount
  const loadPreviousReading = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await getReadingHistory('coffee');
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
      console.error('Failed to load previous coffee reading:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadPreviousReading();
  }, [loadPreviousReading]);

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
              <h1 className="text-3xl md:text-4xl font-bold font-display">Coffee Reading</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                Unlock the fortune hidden in your coffee cup sediment. An ancient art of tasseography interpreted by AI.
              </p>

              {/* Ritual Instructions - Accordion */}
              <GlassCard className="p-6 mb-8 mt-8">
                <button
                  onClick={() => setShowRitual(!showRitual)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">The Coffee Reading Ritual</h3>
                  </div>
                  <span className="text-white/50 text-sm">
                    {showRitual ? 'Hide' : 'Show'} instructions
                  </span>
                </button>

                {showRitual && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { step: 1, text: 'Brew Turkish coffee in a small cup (no filter)' },
                      { step: 2, text: 'Drink most of it, leaving sediment at bottom' },
                      { step: 3, text: 'Make a wish and place saucer on top' },
                      { step: 4, text: 'Flip cup onto saucer and wait 5 minutes' },
                      { step: 5, text: 'Photograph the inside - dark residue patterns visible' }
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="text-amber-400 font-bold text-sm">{step}</span>
                        </div>
                        <p className="text-white/70 text-sm">{text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Image Upload */}
              <GlassCard className="p-6 mb-8">
                <ImageUpload
                  onImageReady={handleImageReady}
                  maxSizeMB={5}
                  instructions="Upload a photo of the inside of your coffee cup showing the sediment patterns"
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
                      className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          {hasExistingReading ? 'Re-analyzing...' : 'Reading your cup...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {hasExistingReading ? 'Re-read Coffee Cup' : 'Read Coffee Cup'}
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
                <PaywallOverlay featureName="Coffee Reading" />
              )}

              {/* AI Analysis Loading Overlay */}
              {isAnalyzing && (
                <GlassCard className="p-8 mb-8 border-amber-500/50 bg-gradient-to-br from-amber-900/30 to-orange-900/30">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Coffee className="w-10 h-10 text-white animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {hasExistingReading ? 'AI is Re-reading Your Cup...' : 'AI is Reading Your Cup...'}
                    </h3>
                    <p className="text-white/70 max-w-md mb-4">
                      Our advanced AI is interpreting the ancient symbols in your coffee sediment. This may take up to a minute.
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>Scanning cup patterns...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span>Identifying symbols...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '1s' }} />
                        <span>Decoding your fortune...</span>
                      </div>
                    </div>
                    <div className="mt-6 w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse" style={{ width: '100%' }} />
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
                      className="p-3 rounded-full bg-white/10 hover:bg-amber-500/20 text-white/70 hover:text-amber-400 transition-all disabled:opacity-50"
                      title="Share coffee reading"
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

                  {/* Cup Overview */}
                  <GlassCard className="p-6 border-amber-500/30">
                    <h3 className="text-xl font-bold text-white mb-3">Cup Overview</h3>
                    <p className="text-white/80">{result.cup_overview}</p>
                  </GlassCard>

                  {/* Symbols Identified */}
                  {result.symbols_identified && result.symbols_identified.length > 0 && (
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Symbols Identified</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.symbols_identified.map((symbol, index) => (
                          <div
                            key={index}
                            className="group relative px-3 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium cursor-help"
                          >
                            {symbol.symbol}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {symbol.position}: {symbol.meaning}
                            </span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Fortune Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Love Fortune', text: result.love_fortune, icon: <Heart className="w-5 h-5" /> },
                      { title: 'Career Fortune', text: result.career_fortune, icon: <Briefcase className="w-5 h-5" /> },
                      { title: 'Health Fortune', text: result.health_fortune, icon: <Activity className="w-5 h-5" /> },
                      { title: 'Travel Fortune', text: result.travel_fortune, icon: <Plane className="w-5 h-5" /> }
                    ].map(({ title, text, icon }) => (
                      <GlassCard key={title} className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-amber-400">{icon}</div>
                          <h4 className="font-semibold text-white">{title}</h4>
                        </div>
                        <p className="text-white/70 text-sm">{text}</p>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Warning */}
                  {result.warning && (
                    <GlassCard className="p-5 border-yellow-500/30 bg-yellow-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <h4 className="font-semibold text-yellow-400">Warning</h4>
                      </div>
                      <p className="text-white/80 text-sm">{result.warning}</p>
                    </GlassCard>
                  )}

                  {/* Overall Fortune */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-3">Overall Fortune</h3>
                    <p className="text-white/80">{result.overall_fortune}</p>
                  </GlassCard>

                  {/* Footer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassCard className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-amber-400" />
                        <span className="text-white/60 text-sm">Lucky Number</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{result.lucky_number}</p>
                    </GlassCard>

                    <GlassCard className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-white/60 text-sm">Time Frame</span>
                      </div>
                      <p className="text-lg font-medium text-white">{result.time_frame}</p>
                    </GlassCard>

                    <GlassCard className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-white/60 text-sm">Special Message</span>
                      </div>
                      <p className="text-sm text-white/80">{result.special_message}</p>
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
                placeholder="Ask AstroAi4u about your coffee reading..."
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

export default CoffeeReadingPage;

