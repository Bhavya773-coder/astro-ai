import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeTokens {
  bg: { primary: string; secondary: string; card: string; chat: string; input: string };
  text: { primary: string; secondary: string; inverse: string; muted: string };
  accent: { purple: string; pink: string; gold: string; blue: string; green: string; red: string };
  border: string;
  borderStrong: string;
  shadow: string;
  gradient: [string, string, string];
  skeleton: string;
}

export const tokens: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    bg: { primary: '#F8F5EE', secondary: '#F3EFE4', card: '#FDFBF7', chat: 'rgba(253, 251, 247, 0.85)', input: '#FAF7F0' },
    text: { primary: '#2C2B3D', secondary: '#726F8D', inverse: '#FFFFFF', muted: '#9E9BB3' },
    accent: { purple: '#7209B7', pink: '#F72585', gold: '#D9730D', blue: '#5B8DEF', green: '#12A594', red: '#E5484D' },
    border: '#ECE2CD',
    borderStrong: '#E6DCB8',
    shadow: '#7209B7',
    gradient: ['#F8F5EE', '#F5EFE3', '#FAF6EB'],
    skeleton: '#ECE5D5',
  },
  dark: {
    bg: { primary: '#090714', secondary: 'rgba(18, 14, 36, 0.85)', card: 'rgba(22, 19, 41, 0.72)', chat: 'rgba(22, 19, 41, 0.75)', input: 'rgba(31, 27, 56, 0.80)' },
    text: { primary: '#F0EEFF', secondary: '#9E9BB3', inverse: '#090714', muted: '#726F8D' },
    accent: { purple: '#A855F7', pink: '#F72585', gold: '#FBBF24', blue: '#60A5FA', green: '#34D399', red: '#F87171' },
    border: 'rgba(168, 85, 247, 0.18)',
    borderStrong: 'rgba(168, 85, 247, 0.35)',
    shadow: '#000000',
    gradient: ['#090714', '#120D26', '#1A0D33'],
    skeleton: '#2A2A40',
  },
};

export type Theme = ThemeTokens;

const ThemeContext = createContext<{
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
}>({
  theme: tokens.light,
  mode: 'system',
  setMode: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('astroai_theme_mode') as ThemeMode | null;
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setModeState(saved);
        }
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const theme = isDark ? tokens.dark : tokens.light;

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    try {
      await SecureStore.setItemAsync('astroai_theme_mode', m);
    } catch (e) { /* ignore */ }
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
