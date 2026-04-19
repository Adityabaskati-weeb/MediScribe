import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { BottomTabBar } from './components/BottomTabBar';
import { ToastProvider } from './context/ToastContext';
import { DiagnosisScreen } from './screens/DiagnosisScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NewPatientScreen } from './screens/NewPatientScreen';
import { PatientSummaryScreen } from './screens/PatientSummaryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SplashScreen } from './screens/SplashScreen';
import { TreatmentScreen } from './screens/TreatmentScreen';
import { VoiceScreen } from './screens/VoiceScreen';
import { initializeLocalDatabase } from './services/databaseService';
import { colors } from './styles/theme';
import { AppThemeProvider, useAppTheme } from './styles/ThemeContext';
import type { ConsultationDraft } from './types/clinical';
import { normalizeLanguage } from './utils/i18n';

export type ScreenName = 'home' | 'newPatient' | 'voice' | 'summary' | 'diagnosis' | 'treatment' | 'history' | 'settings';
export type { ConsultationDraft } from './types/clinical';

export default function App() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <AppErrorBoundary resetKey={resetKey} onReturnHome={() => setResetKey((key) => key + 1)}>
      <AppThemeProvider key={resetKey}>
        <ToastProvider>
          <MediScribeApp />
        </ToastProvider>
      </AppThemeProvider>
    </AppErrorBoundary>
  );
}

function MediScribeApp() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [draft, setDraft] = useState<ConsultationDraft>({ language: 'Hindi' });
  const [splashDone, setSplashDone] = useState(false);
  const { theme } = useAppTheme();
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeLocalDatabase();
    AsyncStorage.getItem('mediscribe.language')
      .then((language) => {
        if (language) setDraft((current) => ({ ...current, language: normalizeLanguage(language) }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('mediscribe.language', draft.language).catch(() => undefined);
  }, [draft.language]);

  useEffect(() => {
    screenFade.setValue(0);
    Animated.timing(screenFade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [screen, screenFade]);

  const renderScreen = () => {
    if (screen === 'newPatient') return <NewPatientScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'voice') return <VoiceScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'summary') return <PatientSummaryScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'diagnosis') return <DiagnosisScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'treatment') return <TreatmentScreen draft={draft} onNavigate={setScreen} />;
    if (screen === 'history') return <HistoryScreen onNavigate={setScreen} />;
    if (screen === 'settings') return <SettingsScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    return <HomeScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
  };

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />;

  return (
    <SafeAreaView style={[styles.shell, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: screenFade }]}>{renderScreen()}</Animated.View>
      <BottomTabBar active={screen} onNavigate={setScreen} />
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  }
});
