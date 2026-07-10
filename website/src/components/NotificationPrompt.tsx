import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import toast from 'react-hot-toast';

const NotificationPrompt: React.FC = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

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

  const registerPush = async (silent = true) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      
      let permission = Notification.permission;
      
      if (permission === 'default' && !silent) {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BFN60K_L9-9H6X4_G_5_zS7_f_7_V_7_z_7_v_7_w' // Fallback or empty if not set
          )
        };

        const subscription = await registration.pushManager.subscribe(subscribeOptions);
        
        await apiFetch('/api/push/save-token', {
          method: 'POST',
          body: JSON.stringify({ 
            token: JSON.stringify(subscription), 
            device_type: isIOS ? 'ios' : 'web' 
          })
        });
      }
    } catch (error) {
      // Silent fail as requested
      console.debug('Notification registration skipped:', error);
    }
  };

  useEffect(() => {
    // Attempt silent registration on mount (for already granted users)
    if (Notification.permission === 'granted') {
      registerPush(true);
    }

    // Trigger permission request on first user interaction
    const handleFirstInteraction = () => {
      if (Notification.permission === 'default') {
        registerPush(false);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // No UI
};

export default NotificationPrompt;
