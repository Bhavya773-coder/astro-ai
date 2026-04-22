import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';

type Theme = 'cosmic' | 'midnight' | 'sunset' | 'ocean';

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
}

const themes: Record<Theme, ThemeConfig> = {
  cosmic: {
    name: 'Cosmic Purple',
    primary: '#7209B7',
    secondary: '#F72585',
    accent: '#4CC9F0',
    bgGradient: 'from-purple-900 via-pink-900 to-blue-900',
  },
  midnight: {
    name: 'Midnight Blue',
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    bgGradient: 'from-slate-900 via-blue-900 to-slate-900',
  },
  sunset: {
    name: 'Sunset Orange',
    primary: '#ea580c',
    secondary: '#f97316',
    accent: '#fbbf24',
    bgGradient: 'from-orange-900 via-red-900 to-purple-900',
  },
  ocean: {
    name: 'Ocean Teal',
    primary: '#0f766e',
    secondary: '#14b8a6',
    accent: '#2dd4bf',
    bgGradient: 'from-teal-900 via-cyan-900 to-blue-900',
  },
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState<Theme>('cosmic');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('astroai4u-theme') as Theme;
    const savedFontSize = localStorage.getItem('astroai4u-fontsize') as 'small' | 'medium' | 'large';
    const savedNotifications = localStorage.getItem('astroai4u-notifications');
    const savedAutoSave = localStorage.getItem('astroai4u-autosave');

    if (savedTheme && themes[savedTheme]) setCurrentTheme(savedTheme);
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
    if (savedAutoSave !== null) setAutoSave(savedAutoSave === 'true');
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('astroai4u-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('astroai4u-fontsize', size);
    document.documentElement.setAttribute('data-fontsize', size);
  };

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('astroai4u-notifications', String(newValue));
  };

  const handleAutoSaveToggle = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    localStorage.setItem('astroai4u-autosave', String(newValue));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

              {/* Theme Selection */}
              <GlassCard className="p-6 mb-6" glow="purple">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Theme
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(Object.keys(themes) as Theme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        currentTheme === theme
                          ? 'border-fuchsia-400 bg-white/10'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div
                        className={`w-full h-16 rounded-lg bg-gradient-to-br ${themes[theme].bgGradient} mb-3`}
                      />
                      <p className="text-sm font-medium text-white text-center">
                        {themes[theme].name}
                      </p>
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Font Size */}
              <GlassCard className="p-6 mb-6" glow="cyan">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Font Size
                </h2>
                <div className="flex gap-3">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 capitalize ${
                        fontSize === size
                          ? 'border-fuchsia-400 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span className={size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}>
                        Aa
                      </span>
                      <span className="ml-2">{size}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Notifications & Preferences */}
              <GlassCard className="p-6 mb-6" glow="pink">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Daily Horoscope Notifications</p>
                      <p className="text-white/60 text-sm">Get notified when your daily horoscope is ready</p>
                    </div>
                    <button
                      onClick={handleNotificationToggle}
                      className={`w-14 h-8 rounded-full transition-all duration-300 ${
                        notifications ? 'bg-fuchsia-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                          notifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto-Save Chats</p>
                      <p className="text-white/60 text-sm">Automatically save your chat history</p>
                    </div>
                    <button
                      onClick={handleAutoSaveToggle}
                      className={`w-14 h-8 rounded-full transition-all duration-300 ${
                        autoSave ? 'bg-fuchsia-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                          autoSave ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </GlassCard>

              {/* Data Management */}
              <GlassCard className="p-6" glow="gold">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Data Management
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={clearAllData}
                    className="w-full py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Local Data
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SettingsPage;
