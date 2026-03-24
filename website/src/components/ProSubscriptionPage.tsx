import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';

const ProSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to success page or show success message
      navigate('/subscription-success');
    }, 2000);
  };

  const monthlyPrice = 100;
  const yearlyPrice = 999; // 17% discount for yearly
  const monthlySavings = Math.round(((12 * monthlyPrice - yearlyPrice) / (12 * monthlyPrice)) * 100);

  const freeFeatures = [
    { icon: '💬', title: 'Limited Chat', description: '50 messages per month', available: true },
    { icon: '📊', title: 'Basic Birth Chart', description: 'Simple astrological analysis', available: true },
    { icon: '🔢', title: 'Basic Numerology', description: 'Life path number only', available: true },
    { icon: '📅', title: 'Daily Horoscope', description: 'Basic daily insights', available: true },
    { icon: '📈', title: 'Limited Reports', description: '3 reports per month', available: true },
    { icon: '🎯', title: 'Standard Support', description: 'Community support only', available: true },
    { icon: '⚡', title: 'AI Chat Speed', description: 'Standard response time', available: true },
    { icon: '📱', title: 'Mobile Access', description: 'Basic mobile features', available: true },
  ];

  const proFeatures = [
    { icon: '💬', title: 'Unlimited Chat', description: 'Endless conversations with AI astrologer', available: true },
    { icon: '📊', title: 'Advanced Birth Chart', description: 'Detailed Vedic analysis with dasha periods', available: true },
    { icon: '🔢', title: 'Complete Numerology', description: 'All numbers and predictions', available: true },
    { icon: '📅', title: 'Premium Horoscopes', description: 'Daily, weekly, monthly with detailed insights', available: true },
    { icon: '📈', title: 'Unlimited Reports', description: 'Generate unlimited detailed reports', available: true },
    { icon: '🎯', title: 'Priority Support', description: '24/7 dedicated astrologer support', available: true },
    { icon: '⚡', title: 'Lightning Fast AI', description: 'Priority processing with faster responses', available: true },
    { icon: '📱', title: 'Premium Mobile App', description: 'Full-featured mobile experience', available: true },
    { icon: '🎁', title: 'Exclusive Content', description: 'Advanced tutorials and astrological courses', available: true },
    { icon: '🔮', title: 'Personalized Remedies', description: 'Custom gemstone and mantra recommendations', available: true },
    { icon: '🌟', title: 'Compatibility Analysis', description: 'Detailed relationship compatibility reports', available: true },
    { icon: '📚', title: 'Astrological Library', description: 'Access to ancient astrological texts', available: true },
  ];

  return (
    <CosmicBackground>
      <AppNavbar />
      
      <div className="pt-16 min-h-screen">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
              <span className="text-4xl">⭐</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Unlock <GradientText>Cosmic Wisdom</GradientText> with Pro
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Get unlimited access to personalized Vedic astrology insights, advanced birth charts, and premium features that transform your spiritual journey.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Free Plan */}
            <GlassCard className="p-8 relative border border-white/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <p className="text-white/60 mb-6">Perfect for getting started</p>
                <div className="text-4xl font-bold text-white mb-8">
                  ₹0<span className="text-lg text-white/60">/month</span>
                </div>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 px-6 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Current Plan
                </button>
              </div>
              
              <div className="mt-8 space-y-3">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xl">{feature.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{feature.title}</p>
                      <p className="text-white/60 text-xs">{feature.description}</p>
                    </div>
                    {feature.available && (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Pro Plan - Most Popular */}
            <GlassCard className="p-8 relative border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-white/60 mb-6">Complete astrological experience</p>
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedPlan === 'monthly'
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedPlan === 'yearly'
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  ₹{selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice}
                  <span className="text-lg text-white/60">/{selectedPlan === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {selectedPlan === 'yearly' && (
                  <p className="text-green-400 text-sm mb-4">Save {monthlySavings}% annually</p>
                )}
                
                <button
                  onClick={() => handleSubscribe(selectedPlan)}
                  disabled={isProcessing}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing...
                    </span>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </button>
              </div>
              
              <div className="mt-8 space-y-3">
                {proFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xl">{feature.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{feature.title}</p>
                      <p className="text-white/60 text-xs">{feature.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Enterprise Plan */}
            <GlassCard className="p-8 relative border border-white/20 opacity-75">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-white/60 mb-6">For professional astrologers</p>
                <div className="text-4xl font-bold text-white mb-8">
                  Custom<span className="text-lg text-white/60"></span>
                </div>
                
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full py-3 px-6 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Contact Sales
                </button>
              </div>
              
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Team Management</p>
                    <p className="text-white/60 text-xs">Manage multiple astrologers</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔧</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">White Label</p>
                    <p className="text-white/60 text-xs">Custom branding options</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📊</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Advanced Analytics</p>
                    <p className="text-white/60 text-xs">Detailed usage insights</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔒</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">API Access</p>
                    <p className="text-white/60 text-xs">Full API integration</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Testimonials */}
          <GlassCard className="p-8 mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <p className="text-white/80 italic mb-3">
                  "The unlimited chat feature has transformed my spiritual journey. I can ask anything, anytime!"
                </p>
                <p className="text-yellow-400 font-medium">- Priya Sharma</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <p className="text-white/80 italic mb-3">
                  "The advanced birth chart analysis is incredibly detailed. Much better than other astrology apps."
                </p>
                <p className="text-yellow-400 font-medium">- Rahul Verma</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <p className="text-white/80 italic mb-3">
                  "Priority support is amazing. They helped me understand my dasha periods in detail."
                </p>
                <p className="text-yellow-400 font-medium">- Anjali Patel</p>
              </div>
            </div>
          </GlassCard>

          {/* FAQ */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
                <p className="text-white/70">We accept all major credit cards, debit cards, UPI, and popular digital wallets like PayTM and Google Pay.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-white/70">Yes, you can cancel your Pro subscription at any time. Your access will continue until the end of your billing period.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial for Pro?</h3>
                <p className="text-white/70">Yes! New users get a 7-day free trial of Pro features with full access to all premium functionality.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What makes your AI astrologer special?</h3>
                <p className="text-white/70">Our AI combines authentic Vedic astrology principles with modern technology, providing accurate insights based on your actual birth chart and current planetary positions.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default ProSubscriptionPage;
