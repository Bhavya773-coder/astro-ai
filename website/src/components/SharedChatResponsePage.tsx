import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface SharedResponseData {
  shareId: string;
  userName: string;
  question: string;
  response: string;
  context: string | null;
  createdAt: string;
}

const SharedChatResponsePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (shareId) {
      loadSharedResponse();
    }
  }, [shareId]);

  const loadSharedResponse = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/shared-response/${shareId}`);
      if (res?.success && res?.data) {
        setData(res.data);
      } else {
        setError(res?.message || 'Response not found');
      }
    } catch (err) {
      setError('Failed to load shared response');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    } finally {
      setIsCopying(false);
    }
  };

  const handleGetOwnReading = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </CosmicBackground>
    );
  }

  if (error) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Go to Astro AI
          </button>
        </div>
      </CosmicBackground>
    );
  }

  if (!data) {
    return (
      <CosmicBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
          <p className="text-white/70">Response not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Go to Astro AI
          </button>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <div className="min-h-screen flex flex-col text-white">
        {/* Header */}
        <div className="bg-black/40 border-b border-white/10 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">
                {data.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white/60 text-xs">Shared response from</p>
                <p className="font-semibold">{data.userName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                disabled={isCopying}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-all"
                title="Copy link"
              >
                {isCopying ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-sm font-medium shrink-0 mt-1">
                  Q
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                  <p className="text-lg md:text-xl text-white leading-relaxed">{data.question}</p>
                </div>
              </div>
            </div>

            {/* Response */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="flex-1 bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 md:p-6">
                  <div className="prose prose-invert prose-violet max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {data.response}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center mb-8">
              <p className="text-white/40 text-sm">
                Shared on {new Date(data.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={handleGetOwnReading}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
              >
                Get Your Own Reading
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/40 border-t border-white/10 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-white/40 text-sm">
              Powered by Astro AI - Your Personal Cosmic Guide
            </p>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedChatResponsePage;
