import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './theme';

export type ThemeMode = 'light' | 'dark';

const darkColors = {
  ...colors,
  background: '#09181d',
  surface: '#10262d',
  surfaceSoft: '#15323a',
  surfaceMuted: '#1a3a43',
  ink: '#e7f3f5',
  muted: '#a9c0c8',
  quiet: '#7f99a3',
  border: '#28434c',
  borderStrong: '#42606a',
  primary: '#54c7de',
  primaryDark: '#9be7f4',
  secondary: '#5bd3aa',
  accent: '#ff8f82',
  warning: '#ffc267',
  warningSoft: '#342816',
  dangerSoft: '#3a1f22',
  success: '#5bd3aa',
  successSoft: '#15372f',
  infoSoft: '#122f3a'
};

const lightTheme = { mode: 'light' as ThemeMode, colors };
const darkTheme = { mode: 'dark' as ThemeMode, colors: darkColors };
type AppTheme = typeof lightTheme | typeof darkTheme;

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  toggleTheme: () => undefined,
  setThemeMode: () => undefined
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem('mediscribe.theme')
      .then((stored) => {
        if (stored === 'dark' || stored === 'light') setMode(stored);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('mediscribe.theme', mode).catch(() => undefined);
  }, [mode]);

  const value = useMemo(() => ({
    theme: mode === 'dark' ? darkTheme : lightTheme,
    toggleTheme: () => setMode((current) => current === 'dark' ? 'light' : 'dark'),
    setThemeMode: setMode
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
