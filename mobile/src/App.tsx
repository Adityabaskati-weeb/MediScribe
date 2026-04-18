import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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

export type ScreenName = 'home' | 'newPatient' | 'voice' | 'summary' | 'diagnosis' | 'treatment' | 'history' | 'settings';

export type ConsultationDraft = {
  patient?: any;
  transcript?: string;
  chartText?: string;
  assessment?: any;
  language: string;
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [draft, setDraft] = useState<ConsultationDraft>({ language: 'Hindi' });

  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  const renderScreen = () => {
    if (screen === 'newPatient') return <NewPatientScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'voice') return <VoiceScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'summary') return <PatientSummaryScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'diagnosis') return <DiagnosisScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    if (screen === 'treatment') return <TreatmentScreen draft={draft} onNavigate={setScreen} />;
    if (screen === 'history') return <HistoryScreen onNavigate={setScreen} />;
    if (screen === 'settings') return <SettingsScreen draft={draft} onDraftChange={setDraft} onNavigate={setScreen} />;
    return <HomeScreen draft={draft} onNavigate={setScreen} />;
  };

  return (
    <View style={styles.shell}>
      {renderScreen()}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f4f7f6'
  }
});
