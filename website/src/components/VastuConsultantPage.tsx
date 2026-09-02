import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner, GradientText } from './CosmicUI';
import {
  Compass,
  Sparkles,
  Home,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  History,
  Coins,
  ArrowRight,
  ShieldAlert,
  Flame,
  Droplets,
  Layers,
  Wind
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import PaywallOverlay from './PaywallOverlay';
import { getVastuConsultation, getReadingHistory } from '../api/client';
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

interface HistoryItem {
  _id: string;
  created_at: string;
  image_data?: string;
  mime_type?: string;
  result: VastuResult;
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
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await getReadingHistory('vastu');
      if (res?.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
        if (res.data.length > 0 && !result) {
          // Pre-load latest reading as view
          setResult(res.data[0].result);
        }
      }
    } catch (e) {
      console.error('Failed to load vastu history:', e);
    }
  };

  const handleImageReady = (base64: string, type: string) => {
    setImageBase64(base64);
    setMimeType(type);
    setShowPaywall(false);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast.error('Please upload a 2D floor plan or house map image first');
      return;
    }

    setIsAnalyzing(true);
    setShowPaywall(false);

    try {
      const response = await getVastuConsultation(imageBase64, mimeType);

      if (response?.success && response.data) {
        setResult(response.data);
        toast.success('Vastu consultation completed!');
        if (response.remaining_credits !== undefined) {
          window.dispatchEvent(
            new CustomEvent('credits-updated', { detail: { credits: response.remaining_credits } })
          );
        }
        loadHistory();
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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Supportive</span>;
      case 'minor':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Minor Concern</span>;
      case 'major':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Vastu Dosha</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Unclear</span>;
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'good':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Highly Auspicious / Balanced' };
      case 'mixed':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', label: 'Moderate Harmony (Remedies Advised)' };
      case 'poor':
        return { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', label: 'Major Energy Imbalances Detected' };
      default:
        return { text: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30', label: 'Direction / Orientation Verification Needed' };
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white selection:bg-fuchsia-500 selection:text-white">
      <CosmicBackground />
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-64 overflow-y-auto max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-2xl">
                <Compass className="w-8 h-8 text-amber-400 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  <GradientText>Vastu AI Consultant</GradientText>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Sacred architectural energy analysis & dosha remedies for your home or workplace
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{VASTU_COST} Credits per consultation</span>
            </div>
            {historyList.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <History className="w-4 h-4 text-violet-400" />
                <span>History ({historyList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* History Modal / Drawer */}
        {showHistory && (
          <GlassCard className="mb-8 border-violet-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-violet-300 flex items-center gap-2">
                <History className="w-5 h-5" /> Past Vastu Consultations
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyList.map((item, idx) => (
                <div
                  key={item._id || idx}
                  onClick={() => {
                    setResult(item.result);
                    setShowHistory(false);
                  }}
                  className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-violet-500/40 rounded-xl cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-slate-400">
                      {new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm font-semibold text-slate-200 capitalize">
                      Score: {item.result?.score ?? 'N/A'}/100 ({item.result?.verdict || 'analysis'})
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Upload & Action */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="relative overflow-hidden border-slate-800/80">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Home className="w-5 h-5 text-amber-400" />
                  Upload 2D Floor Plan / Layout
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload architectural blueprint, hand-drawn map with North arrow, or room photo for spatial review.
                </p>
              </div>

              <ImageUpload
                onImageReady={handleImageReady}
                instructions="Drop 2D floor plan image or browse files"
              />

              {isAnalyzing && (
                <div className="my-4 p-4 rounded-xl bg-violet-950/40 border border-violet-500/30 text-center">
                  <LoadingSpinner className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-300 animate-pulse">
                    Scanning directions, Brahmasthan & elemental zones...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluating North-East Ishanya, South-East Agneya, and entrance alignment
                  </p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!imageBase64 || isAnalyzing}
                className={`w-full mt-5 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  !imageBase64 || isAnalyzing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 hover:scale-[1.01] shadow-amber-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing Sacred Geometry...' : 'Analyze Vastu Energy (50 Credits)'}
              </button>

              {/* Tips */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                <div className="font-semibold text-slate-300">Tips for highest accuracy:</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Ensure the North arrow / cardinal direction is clearly visible.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Label key zones like Main Entrance, Kitchen, Master Bed, and Puja.</span>
                </div>
              </div>
            </GlassCard>

            {/* Pancha Bhuta (5 Elements) Guide */}
            <GlassCard className="border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" /> Five Elements Harmony
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
                    <Droplets className="w-3.5 h-3.5" /> Water (NE)
                  </div>
                  <p className="text-slate-400 text-[11px]">Puja, meditation, clarity & prosperity entrance</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold mb-1">
                    <Flame className="w-3.5 h-3.5" /> Fire (SE)
                  </div>
                  <p className="text-slate-400 text-[11px]">Kitchen, electrical, vitality & digestive power</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-500 font-semibold mb-1">
                    <Home className="w-3.5 h-3.5" /> Earth (SW)
                  </div>
                  <p className="text-slate-400 text-[11px]">Master bedroom, stability, leadership & strength</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <Wind className="w-3.5 h-3.5" /> Air (NW)
                  </div>
                  <p className="text-slate-400 text-[11px]">Guest room, circulation, communication & movement</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Detailed Consultation Output */}
          <div className="lg:col-span-7 space-y-6">
            {result ? (
              <>
                {/* Score & Verdict Banner */}
                <GlassCard className={`border ${getVerdictStyle(result.verdict).bg}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                        Vastu Compliance Verdict
                      </div>
                      <div className={`text-2xl font-black mt-1 ${getVerdictStyle(result.verdict).text}`}>
                        {getVerdictStyle(result.verdict).label}
                      </div>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="relative w-24 h-24 rounded-full bg-slate-900/90 border-4 border-amber-500/40 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <span className="text-3xl font-black text-amber-400">{result.score ?? 0}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Score / 100</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Missing Info Warning if any */}
                {result.missing_info && result.missing_info.length > 0 && (
                  <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                        Notice Regarding Unlabeled Zones
                      </h4>
                      <p className="text-xs text-sky-200/80 mt-1">
                        {result.missing_info.join('. ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Key Strengths & Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Positives */}
                  <GlassCard className="border-emerald-500/20 bg-emerald-950/10">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Supportive Energy Alignments
                    </h3>
                    <ul className="space-y-2">
                      {result.positives?.length > 0 ? (
                        result.positives.map((pos, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{pos}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-400 italic">No clear alignments detected</li>
                      )}
                    </ul>
                  </GlassCard>

                  {/* Concerns */}
                  <GlassCard className="border-rose-500/20 bg-rose-950/10">
                    <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Vastu Doshas & Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {result.negatives?.length > 0 ? (
                        result.negatives.map((neg, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-rose-400 mt-0.5">•</span>
                            <span>{neg}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-400 italic">No critical doshas found</li>
                      )}
                    </ul>
                  </GlassCard>
                </div>

                {/* Room-by-Room Zone Analysis */}
                {result.room_analysis && result.room_analysis.length > 0 && (
                  <GlassCard className="border-slate-800">
                    <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-400" />
                      Spatial & Room Placement Analysis
                    </h3>
                    <div className="space-y-3">
                      {result.room_analysis.map((room, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-100">{room.area}</span>
                            {getSeverityBadge(room.severity)}
                          </div>
                          <div className="text-xs text-slate-400">
                            <strong className="text-slate-300">Observed:</strong> {room.observed}
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed">
                            <strong className="text-amber-400/90">Vastu Assessment:</strong> {room.vastu_view}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Practical Remedies & Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <GlassCard className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950">
                    <h3 className="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      Recommended Vastu Remedies & Adjustments
                    </h3>
                    <div className="space-y-2.5">
                      {result.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-slate-200">
                          <span className="font-bold text-amber-400 flex-shrink-0">{idx + 1}.</span>
                          <span className="leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  {result.disclaimer ||
                    'Educational and spiritual Vastu guidance only. Not intended as architectural, structural, or legal safety certification.'}
                </p>
              </>
            ) : (
              <GlassCard className="flex flex-col items-center justify-center py-20 text-center border-dashed border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-900/90 border border-amber-500/30 flex items-center justify-center mb-4">
                  <Compass className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-300">No Floor Plan Analyzed Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2">
                  Upload your 2D house blueprint, architectural drawing, or hand-drawn plan to see an instant Vedic energy assessment.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </main>

      {/* Paywall Overlay if user runs out of credits */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center border border-slate-700 hover:bg-slate-700"
            >
              ✕
            </button>
            <PaywallOverlay featureName="Vastu AI Consultation" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VastuConsultantPage;
