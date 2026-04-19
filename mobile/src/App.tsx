import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { DiagnosisScreen } from './screens/DiagnosisScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NewPatientScreen } from './screens/NewPatientScreen';
import { PatientSummaryScreen } from './screens/PatientSummaryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TreatmentScreen } from './screens/TreatmentScreen';
import { VoiceScreen } from './screens/VoiceScreen';
import { initializeLocalDatabase } from './services/databaseService';
import { colors } from './styles/theme';
import { AppThemeProvider, useAppTheme } from './styles/ThemeContext';
import { normalizeLanguage } from './utils/i18n';

export type ScreenName = 'home' | 'newPatient' | 'voice' | 'summary' | 'diagnosis' | 'treatment' | 'history' | 'settings';

export type ConsultationDraft = {
  patient?: any;
  transcript?: string;
  chartText?: string;
  assessment?: any;
  demoCaseId?: string;
  language: string;
};

export default function App() {
  return (
    <AppThemeProvider>
      <MediScribeApp />
    </AppThemeProvider>
  );
}

function MediScribeApp() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [draft, setDraft] = useState<ConsultationDraft>({ language: 'Hindi' });
  const { theme } = useAppTheme();

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

  return (
    <SafeAreaView style={[styles.shell, { backgroundColor: theme.colors.background }]}>
      {renderScreen()}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background
  }
});
