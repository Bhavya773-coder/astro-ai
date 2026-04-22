import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import toast from 'react-hot-toast';

const NotificationPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        const hasDismissed = localStorage.getItem('push_prompt_dismissed');
        if (!hasDismissed) {
          setIsVisible(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else if (Notification.permission === 'denied') {
      setIsDenied(true);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
          )
        };

        const subscription = await registration.pushManager.subscribe(subscribeOptions);
        
        // Save subscription as token
        await apiFetch('/api/push/save-token', {
          method: 'POST',
          body: JSON.stringify({ 
            token: JSON.stringify(subscription), 
            device_type: 'web' 
          })
        });

        toast.success('Notifications enabled! Cosmic guidance is on the way.');
        setIsVisible(false);
      } else {
        setIsDenied(true);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications. Please try again.');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('push_prompt_dismissed', Date.now().toString());
  };

  if (isDenied) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[1000] w-full max-w-sm"
        >
          <div className="bg-[#1A1A2E]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/5 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-500/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  Cosmic Guidance <Sparkles className="w-4 h-4 text-fuchsia-400" />
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Get personalized daily insights delivered to your device at peak astrological moments.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 relative z-10">
              <button
                onClick={handleEnable}
                className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-fuchsia-500/30 transition-all active:scale-[0.98]"
              >
                Enable Notifications
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-3 text-white/40 hover:text-white/60 text-sm font-medium transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
