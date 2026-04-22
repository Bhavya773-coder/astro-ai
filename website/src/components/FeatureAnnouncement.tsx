import React from 'react';
import { GlassCard, GradientText } from './CosmicUI';
import { Sparkles, Zap, Target, MessageCircle, Gift, X } from 'lucide-react';

interface FeatureAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureAnnouncement: React.FC<FeatureAnnouncementProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-fuchsia-400" />,
      title: "Today's Energy",
      description: "See your daily cosmic energy label with personalized traits and insights."
    },
    {
      icon: <Target className="w-6 h-6 text-violet-400" />,
      title: "Focus Selector",
      description: "Choose between Work, Love, Mind, or Money to get tailored action recommendations."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Smart Actions",
      description: "Get specific DO and AVOID actions with lucky time windows for your focus area."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-cyan-400" />,
      title: "Daily Prediction",
      description: "Receive a one-sentence prediction about your day with feedback options."
    },
    {
      icon: <Gift className="w-6 h-6 text-pink-400" />,
      title: "Lucky Moment",
      description: "Discover your lucky color, number, power hour, and what to avoid today."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-black/90 border border-violet-500/30 p-6 md:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <GradientText>Your Dashboard Evolved!</GradientText>
          </h2>
          <p className="text-white/70 text-sm">
            We've completely redesigned your cosmic experience
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/10">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Extra Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <div className="text-2xl font-bold text-amber-400 mb-1">🔥 Streak</div>
            <p className="text-white/60 text-xs">Track your daily cosmic check-ins</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <div className="text-2xl font-bold text-cyan-400 mb-1">⚡ Live</div>
            <p className="text-white/60 text-xs">Get instant advice for any situation</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02] transition-all"
        >
          Explore My New Dashboard ✨
        </button>

        <p className="text-center text-white/40 text-xs mt-4">
          This message won't appear again. You can always find help in settings.
        </p>
      </GlassCard>
    </div>
  );
};

export default FeatureAnnouncement;
