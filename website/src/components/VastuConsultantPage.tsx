import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner } from './CosmicUI';
import {
  Compass,
  Sparkles,
  Home,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  History,
  Coins,
  ShieldCheck,
  Droplets,
  Flame,
  Wind,
  Layers,
  Star,
  Eye,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import PaywallOverlay from './PaywallOverlay';
import AutoResizeTextarea from './AutoResizeTextarea';
import { getVastuConsultation, getReadingHistory, apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface RoomAnalysis {
  area: string;
  observed: string;
  vastu_view: string;
  severity: 'good' | 'minor' | 'major' | 'unclear';
}

interface VastuResult {
  verdict: 'good' | 'mixed' | 'poor' | 'unclear';
  score: number;
  summary: string;
  positives: string[];
  negatives: string[];
  room_analysis: RoomAnalysis[];
  recommendations: string[];
  missing_info?: string[];
  disclaimer?: string;
}

const VASTU_COST = 50;

const VastuConsultantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VastuResult | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasExistingReading, setHasExistingReading] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageReady = (base64: string, type: string) => {
    setImageBase64(base64);
    setMimeType(type);
    setShowPaywall(false);
  };

  const loadPreviousReading = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await getReadingHistory('vastu');
      if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
        const latestReading = response.data[0];
        setResult(latestReading.result);
        setHasExistingReading(true);
        if (latestReading.image_data) {
          setImagePreview(`data:${latestReading.mime_type || 'image/jpeg'};base64,${latestReading.image_data}`);
          setImageBase64(latestReading.image_data);
          setMimeType(latestReading.mime_type || 'image/jpeg');
        }
      }
    } catch (err) {
      console.log('No previous Vastu reading found');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadPreviousReading();
  }, [loadPreviousReading]);

  const handleAnalyze = async (forceRegenerate = false) => {
    if (!imageBase64) {
      toast.error('Please upload a floor plan or house layout image first');
      return;
    }

    setIsAnalyzing(true);
    setShowPaywall(false);

    try {
      const response = await getVastuConsultation(imageBase64, mimeType);

      if (response?.success && response.data) {
        setResult(response.data);
        setHasExistingReading(true);
        toast.success('Vastu consultation completed!');
        if (response.remaining_credits !== undefined) {
          window.dispatchEvent(
            new CustomEvent('credits-updated', { detail: { credits: response.remaining_credits } })
          );
        }
      }
    } catch (err: any) {
      if (
        err.message?.includes('INSUFFICIENT_CREDITS') ||
        err.code === 'INSUFFICIENT_CREDITS' ||
        err.message?.includes('credits')
      ) {
        setShowPaywall(true);
      } else if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
        toast.error('AI service is temporarily busy. Please try again in a moment.');
      } else {
        toast.error(err?.message || 'Failed to analyze floor plan. Please ensure the image is clear.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'good':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Supportive
          </span>
        );
      case 'minor':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Minor Concern
          </span>
        );
      case 'major':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Vastu Dosha
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/20">
            Unclear
          </span>
        );
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'good':
        return {
          title: 'Auspicious & Harmonious',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30'
        };
      case 'mixed':
        return {
          title: 'Moderate Harmony (Remedies Advised)',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30'
        };
      case 'poor':
        return {
          title: 'Major Energy Imbalances Detected',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30'
        };
      default:
        return {
          title: 'Orientation Verification Needed',
          color: 'text-fuchsia-400',
          bg: 'bg-fuchsia-500/10 border-fuchsia-500/30'
        };
    }
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16">
              {/* Header */}
              <div className="flex flex-col items-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3 font-display">
                  <Compass className="w-8 h-8 md:w-12 md:h-12 text-fuchsia-400" />
                  Vastu AI Consultant
                </h1>
                {user?.is_believer && (
                  <div className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/50 text-[11px] font-bold text-violet-300 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    Based on Vedic Architectural Science (Vastu Shastra)
                  </div>
                )}
                <p className="text-white/60 text-lg max-w-2xl text-center">
                  Analyze the spatial energy flow of your house or office blueprint. Our AI assesses room placements, five elements balance, and provides non-destructive remedies.
                </p>
              </div>

              {/* Instructions */}
              <GlassCard className="p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  How to Get the Best Vastu Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { step: 1, text: 'Use a 2D floor plan, blueprint or clear hand-drawn sketch' },
                    { step: 2, text: 'Ensure the North direction arrow is clearly visible' },
                    { step: 3, text: 'Label key rooms: Main Door, Kitchen, Master Bed, Puja' },
                    { step: 4, text: 'Capture the complete perimeter without cutoffs' }
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

              {/* Image Upload Card */}
              <GlassCard className="p-6 mb-8">
                <ImageUpload
                  onImageReady={handleImageReady}
                  maxSizeMB={5}
                  instructions="Upload a 2D floor plan, architectural layout, or house map"
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
                          {hasExistingReading ? 'Re-analyzing Floor Plan...' : 'Analyzing Vastu Energy...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {hasExistingReading ? 'Re-analyze Layout (50 Credits)' : 'Analyze Vastu Energy (50 Credits)'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </GlassCard>

              {/* Paywall Overlay */}
              {showPaywall && (
                <PaywallOverlay featureName="Vastu AI Consultation" />
              )}

              {/* AI Analysis Loading Overlay */}
              {isAnalyzing && (
                <GlassCard className="p-8 mb-8 border-fuchsia-500/50 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Compass className="w-10 h-10 text-white animate-spin-slow" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {hasExistingReading ? 'AI is Re-evaluating Your Space...' : 'AI is Scanning Sacred Directions...'}
                    </h3>
                    <p className="text-white/70 max-w-md mb-4">
                      Analyzing cardinal directions, Brahmasthan balance, and Pancha Bhuta elemental harmony.
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                        <span>Detecting North orientation...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span>Evaluating Ishanya (NE) & Agneya (SE)...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: '1s' }} />
                        <span>Formulating Vedic remedies...</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Results Section */}
              {result && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Verdict & Score Banner */}
                  <GlassCard className={`p-6 border ${getVerdictBadge(result.verdict).bg}`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center md:text-left">
                        <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">
                          Vastu Compliance Rating
                        </span>
                        <h3 className={`text-2xl md:text-3xl font-bold ${getVerdictBadge(result.verdict).color}`}>
                          {getVerdictBadge(result.verdict).title}
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed max-w-xl">
                          {result.summary}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-black/50 border-4 border-fuchsia-500/40 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                        <span className="text-3xl font-black text-fuchsia-300">{result.score ?? 0}</span>
                        <span className="text-[10px] uppercase font-bold text-white/60">Score / 100</span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Five Elements Guide */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <GlassCard className="p-4 text-center">
                      <Droplets className="w-6 h-6 text-sky-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-white">Water (NE)</div>
                      <div className="text-[11px] text-white/60 mt-0.5">Puja & Clarity</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-white">Fire (SE)</div>
                      <div className="text-[11px] text-white/60 mt-0.5">Kitchen & Energy</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <Home className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-white">Earth (SW)</div>
                      <div className="text-[11px] text-white/60 mt-0.5">Master Bedroom</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <Wind className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-white">Air (NW)</div>
                      <div className="text-[11px] text-white/60 mt-0.5">Movement & Guests</div>
                    </GlassCard>
                  </div>

                  {/* Supportive vs Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Supportive */}
                    <GlassCard className="p-6 border-emerald-500/20 bg-emerald-950/10">
                      <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Supportive Alignments
                      </h4>
                      <ul className="space-y-2">
                        {result.positives && result.positives.length > 0 ? (
                          result.positives.map((pos, idx) => (
                            <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                              <span className="text-emerald-400 mt-1">•</span>
                              <span>{pos}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-white/50 italic">No specific positive zones detected</li>
                        )}
                      </ul>
                    </GlassCard>

                    {/* Concerns */}
                    <GlassCard className="p-6 border-rose-500/20 bg-rose-950/10">
                      <h4 className="text-base font-bold text-rose-400 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        Vastu Doshas Detected
                      </h4>
                      <ul className="space-y-2">
                        {result.negatives && result.negatives.length > 0 ? (
                          result.negatives.map((neg, idx) => (
                            <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                              <span className="text-rose-400 mt-1">•</span>
                              <span>{neg}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-white/50 italic">No critical Vastu concerns found</li>
                        )}
                      </ul>
                    </GlassCard>
                  </div>

                  {/* Room by Room Assessment */}
                  {result.room_analysis && result.room_analysis.length > 0 && (
                    <GlassCard className="p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-fuchsia-400" />
                        Detailed Room & Zone Analysis
                      </h4>
                      <div className="space-y-3">
                        {result.room_analysis.map((room, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-white">{room.area}</span>
                              {getSeverityBadge(room.severity)}
                            </div>
                            <div className="text-xs text-white/60">
                              <strong className="text-white/80">Observed:</strong> {room.observed}
                            </div>
                            <div className="text-xs text-white/85 leading-relaxed">
                              <strong className="text-fuchsia-300">Vastu Assessment:</strong> {room.vastu_view}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Recommendations & Remedies */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <GlassCard className="p-6 border-fuchsia-500/30 bg-gradient-to-br from-violet-950/20 via-slate-900 to-slate-950">
                      <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        Practical Vastu Remedies & Recommendations
                      </h4>
                      <div className="space-y-2.5">
                        {result.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 leading-relaxed"
                          >
                            <span className="font-bold text-fuchsia-400 shrink-0">{idx + 1}.</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Disclaimer */}
                  <p className="text-xs text-white/40 text-center leading-relaxed">
                    {result.disclaimer ||
                      'Educational and spiritual Vastu guidance only. Not intended as architectural or structural safety advice.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CHAT INPUT - ChatGPT Style */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!questionInput.trim()) return;
              try {
                const res = await apiFetch('/api/ai-chat/create', {
                  method: 'POST',
                  body: JSON.stringify({ title: 'Vastu Consultation Chat' })
                });
                if (res?.success && res?.data) {
                  navigate(`/ai-chat?chatId=${res.data._id}`, { state: { initialMessage: questionInput.trim() } });
                } else {
                  navigate('/ai-chat', { state: { initialMessage: questionInput.trim() } });
                }
              } catch {
                navigate('/ai-chat', { state: { initialMessage: questionInput.trim() } });
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
                      (e.target as any).form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }
                }}
                placeholder="Ask AstroAi4u about your Vastu consultation or home layout..."
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

export default VastuConsultantPage;
