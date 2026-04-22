import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppNavbar from './AppNavbar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { Star, Hand, Coffee, User, Coins, Sparkles, Zap } from 'lucide-react';
import { createPaymentOrder, verifyPayment, getPaymentStatus } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const ProSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await getPaymentStatus();
      if (data.success) {
        setCredits(data.credits.current);
      }
    } catch (err) {
      console.error('Failed to load credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (plan: 'pro' | 'ultra') => {
    setIsProcessing(true);
    try {
      const orderData = await createPaymentOrder(plan);

      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name: 'AstroAi4u',
        description: `${orderData.credits} Credits Pack`,
        handler: async (response: any) => {
          const verifyData = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
          });
          if (verifyData.success) {
            if (verifyData.credits_added > 0) {
              toast.success(`${verifyData.credits_added} credits added! Your new balance: ${verifyData.new_balance}`);
            } else {
              toast.success(`Credits already added! Your balance: ${verifyData.new_balance}`);
            }
            setCredits(verifyData.new_balance);
            // Notify sidebar to update credits
            window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: verifyData.new_balance } }));
          }
        },
        prefill: { email: user?.email || '' },
        theme: { color: '#7c3aed' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('[Payment Error]', err);
      if (err?.message?.includes('not configured')) {
        toast.error('Payment service is not configured. Please contact support.');
      } else if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(err?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const creditPacks = [
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 100,
      price: 99,
      icon: <Zap className="w-8 h-8" />,
      color: 'from-violet-600 to-fuchsia-600',
      popular: true
    },
    {
      id: 'ultra',
      name: 'Ultra Pack',
      credits: 300,
      price: 199,
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-500',
      popular: false,
      savings: '33%'
    }
  ];

  const readingTypes = [
    { icon: <Hand className="w-6 h-6" />, name: 'Palm Reading', cost: 1 },
    { icon: <Coffee className="w-6 h-6" />, name: 'Coffee Reading', cost: 1 },
    { icon: <User className="w-6 h-6" />, name: 'Face Reading', cost: 1 }
  ];

  return (
    <CosmicBackground>
      <AppNavbar />

      <div className="pt-16 min-h-screen">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full mb-6 shadow-[0_0_20px_rgba(168,85,247,0.5)] text-white">
              <Coins className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Buy <GradientText>Credits</GradientText>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Purchase credits to unlock AI-powered readings. Each reading costs just 1 credit!
            </p>
          </div>

          {/* Current Credits */}
          <GlassCard className="max-w-md mx-auto p-6 mb-12 text-center border-fuchsia-500/30">
            <p className="text-white/60 mb-2">Your Current Balance</p>
            <div className="flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-fuchsia-400" />
              <span className="text-4xl font-bold text-white">{loading ? '...' : credits}</span>
              <span className="text-white/60">credits</span>
            </div>
          </GlassCard>

          {/* Credit Packs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            {creditPacks.map((pack) => (
              <GlassCard
                key={pack.id}
                className={`p-8 relative ${pack.popular ? 'border-fuchsia-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-white/10'}`}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full text-white text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                {pack.savings && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-sm font-semibold">
                    Save {pack.savings}
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${pack.color} rounded-full mb-4 text-white`}>
                    {pack.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{pack.name}</h3>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-fuchsia-400" />
                    <span className="text-3xl font-bold text-fuchsia-400">{pack.credits}</span>
                    <span className="text-white/60">credits</span>
                  </div>

                  <div className="text-4xl font-bold text-white mb-6">
                    &#8377;{pack.price}
                  </div>

                  <button
                    onClick={() => handleBuyCredits(pack.id as 'pro' | 'ultra')}
                    disabled={isProcessing}
                    className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${pack.color} hover:opacity-90 text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5" />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* What You Get */}
          <GlassCard className="max-w-2xl mx-auto p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              What Can You Do With Credits?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readingTypes.map((reading) => (
                <div key={reading.name} className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-fuchsia-400 mb-2 flex justify-center">{reading.icon}</div>
                  <p className="text-white font-medium">{reading.name}</p>
                  <p className="text-fuchsia-400 font-bold">{reading.cost} credit</p>
                </div>
              ))}
            </div>
            <p className="text-center text-white/60 mt-6 text-sm">
              Each AI-powered reading provides detailed insights personalized to your profile
            </p>
          </GlassCard>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default ProSubscriptionPage;
