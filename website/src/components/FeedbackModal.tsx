import React, { useState, useEffect } from 'react';
import { GlassCard } from './CosmicUI';
import { apiFetch } from '../api/client';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackData {
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
}

const StarRating: React.FC<{
  rating: number | null;
  onRate: (rating: number) => void;
  label: string;
  required?: boolean;
}> = ({ rating, onRate, label, required }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="mb-4">
      <label className="block text-white/80 text-sm mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="p-1 transition-transform hover:scale-110"
          >
            <svg
              className={`w-7 h-7 transition-colors ${
                (hover !== null ? star <= hover : star <= (rating || 0))
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/30'
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
          </button>
        ))}
      </div>
    </div>
  );
};

const YesNoButton: React.FC<{
  value: boolean | null;
  onChange: (value: boolean) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div className="mb-4">
      <label className="block text-white/80 text-sm mb-2">{label}</label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === true
              ? 'bg-green-500/80 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          👍 Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === false
              ? 'bg-red-500/80 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          👎 No
        </button>
      </div>
    </div>
  );
};

const FeatureSelect: React.FC<{
  value: string | null;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const features = [
    { id: 'horoscope', name: 'Horoscope', icon: '✨' },
    { id: 'numerology', name: 'Numerology', icon: '🔢' },
    { id: 'chat', name: 'AI Chat', icon: '💬' },
    { id: 'style_forecaster', name: 'StyleForecaster', icon: '👔' },
    { id: 'birth_chart', name: 'Birth Chart', icon: '🌟' },
    { id: 'other', name: 'Other', icon: '🤔' }
  ];

  return (
    <div className="mb-4">
      <label className="block text-white/80 text-sm mb-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            onClick={() => onChange(feature.id)}
            className={`p-3 rounded-lg text-sm transition-all ${
              value === feature.id
                ? 'bg-violet-500/80 text-white border border-violet-400'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-transparent'
            }`}
          >
            <span className="mr-1">{feature.icon}</span>
            {feature.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    overall_rating: 0,
    feature_ratings: {
      horoscope: null,
      numerology: null,
      chat: null,
      style_forecaster: null,
      birth_chart: null
    },
    ease_of_use: null,
    design_rating: null,
    would_recommend: null,
    favorite_feature: null,
    what_you_loved: '',
    what_to_improve: '',
    additional_comments: ''
  });

  useEffect(() => {
    if (isOpen) {
      checkExistingFeedback();
    }
  }, [isOpen]);

  const checkExistingFeedback = async () => {
    try {
      const res = await apiFetch('/api/feedback/my');
      if (res?.success && res?.data) {
        setHasSubmittedBefore(true);
        // Pre-fill with existing data
        setFeedback({
          overall_rating: res.data.overall_rating || 0,
          feature_ratings: res.data.feature_ratings || feedback.feature_ratings,
          ease_of_use: res.data.ease_of_use,
          design_rating: res.data.design_rating,
          would_recommend: res.data.would_recommend,
          favorite_feature: res.data.favorite_feature,
          what_you_loved: res.data.what_you_loved || '',
          what_to_improve: res.data.what_to_improve || '',
          additional_comments: res.data.additional_comments || ''
        });
      }
    } catch (err) {
      console.log('No previous feedback found');
    }
  };

  const handleSubmit = async () => {
    if (feedback.overall_rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback)
      });

      if (res?.success) {
        toast.success(hasSubmittedBefore ? 'Feedback updated!' : 'Thank you for your feedback!');
        onClose();
        setStep(1);
      } else {
        toast.error(res?.message || 'Failed to submit feedback');
      }
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRating = (field: keyof FeedbackData, value: number) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const updateBoolean = (field: keyof FeedbackData, value: boolean) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const updateString = (field: keyof FeedbackData, value: string) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const updateFeatureRating = (feature: string, value: number) => {
    setFeedback((prev) => ({
      ...prev,
      feature_ratings: { ...prev.feature_ratings, [feature]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-hidden bg-black/80 border-violet-500/30">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">We Value Your Feedback</h2>
              <p className="text-white/60 text-sm mt-1">
                Help us improve Astro AI for you
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

          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div className="space-y-4">
              <StarRating
                rating={feedback.overall_rating}
                onRate={(r) => updateRating('overall_rating', r)}
                label="How would you rate your overall experience with Astro AI?"
                required
              />

              <YesNoButton
                value={feedback.would_recommend}
                onChange={(v) => updateBoolean('would_recommend', v)}
                label="Would you recommend Astro AI to a friend?"
              />

              <FeatureSelect
                value={feedback.favorite_feature}
                onChange={(v) => updateString('favorite_feature', v)}
                label="What's your favorite feature?"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-white/80 text-sm font-medium mb-3">Rate specific features:</p>
              
              <StarRating
                rating={feedback.feature_ratings.horoscope}
                onRate={(r) => updateFeatureRating('horoscope', r)}
                label="Horoscope"
              />
              
              <StarRating
                rating={feedback.feature_ratings.numerology}
                onRate={(r) => updateFeatureRating('numerology', r)}
                label="Numerology"
              />
              
              <StarRating
                rating={feedback.feature_ratings.chat}
                onRate={(r) => updateFeatureRating('chat', r)}
                label="AI Chat"
              />
              
              <StarRating
                rating={feedback.feature_ratings.style_forecaster}
                onRate={(r) => updateFeatureRating('style_forecaster', r)}
                label="StyleForecaster"
              />
              
              <StarRating
                rating={feedback.feature_ratings.birth_chart}
                onRate={(r) => updateFeatureRating('birth_chart', r)}
                label="Birth Chart / Kundli"
              />

              <div className="border-t border-white/10 pt-4 mt-4">
                <StarRating
                  rating={feedback.ease_of_use}
                  onRate={(r) => updateRating('ease_of_use', r)}
                  label="How easy is Astro AI to use?"
                />
                
                <StarRating
                  rating={feedback.design_rating}
                  onRate={(r) => updateRating('design_rating', r)}
                  label="How would you rate the design & look?"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  What do you love about Astro AI?
                </label>
                <textarea
                  value={feedback.what_you_loved}
                  onChange={(e) => updateString('what_you_loved', e.target.value)}
                  placeholder="Tell us what works well for you..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  What could we improve?
                </label>
                <textarea
                  value={feedback.what_to_improve}
                  onChange={(e) => updateString('what_to_improve', e.target.value)}
                  placeholder="Help us make Astro AI better..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Any other comments or suggestions?
                </label>
                <textarea
                  value={feedback.additional_comments}
                  onChange={(e) => updateString('additional_comments', e.target.value)}
                  placeholder="Share anything else you'd like us to know..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none"
                  rows={3}
                  maxLength={2000}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || feedback.overall_rating === 0}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : hasSubmittedBefore ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FeedbackModal;
