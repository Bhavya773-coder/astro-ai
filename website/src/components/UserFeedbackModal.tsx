import React, { useState, useEffect } from 'react';
import { GlassCard } from './CosmicUI';
import { apiFetch } from '../api/client';
import toast from 'react-hot-toast';

interface Feedback {
  feedback_id: string;
  user_name: string;
  user_email: string;
  overall_rating: number;
  feature_ratings: {
    horoscope: number | null;
    numerology: number | null;
    chat: number | null;
    style_forecaster: number | null;
    birth_chart: number | null;
  };
  ease_of_use: number | null;
  design_rating: number | null;
  would_recommend: boolean | null;
  favorite_feature: string | null;
  what_you_loved: string;
  what_to_improve: string;
  additional_comments: string;
  submitted_at: string;
}

interface UserFeedbackModalProps {
  userId: string;
  userEmail: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const StarDisplay: React.FC<{ rating: number | null }> = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </div>
  );
};

const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({
  userId,
  userEmail,
  userName,
  isOpen,
  onClose
}) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserFeedback();
    }
  }, [isOpen, userId]);

  const fetchUserFeedback = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/feedback/user/${userId}`);
      if (res?.success) {
        setFeedback(res.data || []);
        if (res.data?.length > 0) {
          setSelectedFeedback(res.data[0]);
        }
      } else {
        toast.error('Failed to fetch feedback');
      }
    } catch (err) {
      toast.error('Failed to fetch user feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-black/80 border-violet-500/30">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">User Feedback</h2>
              <p className="text-white/60 text-sm mt-1">
                {userName} ({userEmail})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Feedback selector if multiple */}
          {feedback.length > 1 && (
            <div className="flex gap-2 mt-4">
              {feedback.map((f, index) => (
                <button
                  key={f.feedback_id}
                  onClick={() => setSelectedFeedback(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    selectedFeedback?.feedback_id === f.feedback_id
                      ? 'bg-violet-500/80 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Feedback #{index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/50">No feedback submitted by this user yet.</p>
            </div>
          ) : selectedFeedback ? (
            <div className="space-y-6">
              {/* Overall Rating */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">Overall Rating</span>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={selectedFeedback.overall_rating} />
                  <span className="text-white font-bold ml-2">{selectedFeedback.overall_rating}/5</span>
                </div>
              </div>

              {/* Would Recommend */}
              {selectedFeedback.would_recommend !== null && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-white/80">Would Recommend</span>
                  <span className={`font-medium ${selectedFeedback.would_recommend ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedFeedback.would_recommend ? '👍 Yes' : '👎 No'}
                  </span>
                </div>
              )}

              {/* Favorite Feature */}
              {selectedFeedback.favorite_feature && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <span className="text-white/80 block mb-2">Favorite Feature</span>
                  <span className="text-violet-400 font-medium capitalize">
                    {selectedFeedback.favorite_feature.replace('_', ' ')}
                  </span>
                </div>
              )}

              {/* Feature Ratings */}
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white/80 text-sm mb-3">Feature Ratings</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedFeedback.feature_ratings.horoscope && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70 text-sm">Horoscope</span>
                      <StarDisplay rating={selectedFeedback.feature_ratings.horoscope} />
                    </div>
                  )}
                  {selectedFeedback.feature_ratings.numerology && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70 text-sm">Numerology</span>
                      <StarDisplay rating={selectedFeedback.feature_ratings.numerology} />
                    </div>
                  )}
                  {selectedFeedback.feature_ratings.chat && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70 text-sm">AI Chat</span>
                      <StarDisplay rating={selectedFeedback.feature_ratings.chat} />
                    </div>
                  )}
                  {selectedFeedback.feature_ratings.style_forecaster && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70 text-sm">StyleForecaster</span>
                      <StarDisplay rating={selectedFeedback.feature_ratings.style_forecaster} />
                    </div>
                  )}
                  {selectedFeedback.feature_ratings.birth_chart && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70 text-sm">Birth Chart</span>
                      <StarDisplay rating={selectedFeedback.feature_ratings.birth_chart} />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Ratings */}
              {(selectedFeedback.ease_of_use || selectedFeedback.design_rating) && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white/80 text-sm mb-3">Additional Ratings</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedFeedback.ease_of_use && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70 text-sm">Ease of Use</span>
                        <StarDisplay rating={selectedFeedback.ease_of_use} />
                      </div>
                    )}
                    {selectedFeedback.design_rating && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70 text-sm">Design</span>
                        <StarDisplay rating={selectedFeedback.design_rating} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments */}
              {(selectedFeedback.what_you_loved || selectedFeedback.what_to_improve || selectedFeedback.additional_comments) && (
                <div className="border-t border-white/10 pt-4 space-y-4">
                  <h4 className="text-white/80 text-sm">Comments</h4>
                  
                  {selectedFeedback.what_you_loved && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <span className="text-green-400 text-sm font-medium block mb-1">What they loved:</span>
                      <p className="text-white/80 text-sm">{selectedFeedback.what_you_loved}</p>
                    </div>
                  )}
                  
                  {selectedFeedback.what_to_improve && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <span className="text-amber-400 text-sm font-medium block mb-1">Suggestions for improvement:</span>
                      <p className="text-white/80 text-sm">{selectedFeedback.what_to_improve}</p>
                    </div>
                  )}
                  
                  {selectedFeedback.additional_comments && (
                    <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                      <span className="text-violet-400 text-sm font-medium block mb-1">Additional comments:</span>
                      <p className="text-white/80 text-sm">{selectedFeedback.additional_comments}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submission Date */}
              <div className="text-right">
                <span className="text-white/40 text-xs">
                  Submitted: {new Date(selectedFeedback.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserFeedbackModal;
