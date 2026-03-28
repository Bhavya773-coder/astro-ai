import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CosmicBackground>
      <AppNavbar />
      
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <GlassCard className="p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Welcome to <GradientText>Pro!</GradientText>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Your subscription has been activated successfully. You now have unlimited access to all premium features.
            </p>

            {/* Pro Features List */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg p-6 mb-8 border border-yellow-400/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Your Pro Features Are Now Active:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80 text-sm">Unlimited AI Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80 text-sm">Advanced Birth Charts</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80 text-sm">Complete Numerology</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80 text-sm">Advanced Reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80 text-sm">Priority Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80 text-sm">Lightning Fast AI</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/ai-chat')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
              >
                Start Chatting with AI
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-white/60 text-sm mb-2">
                A confirmation email has been sent to your registered email address.
              </p>
              <p className="text-white/60 text-sm">
                You can manage your subscription anytime in your account settings.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SubscriptionSuccessPage;
