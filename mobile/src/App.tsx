import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DiagnosisScreen } from './screens/DiagnosisScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NewPatientScreen } from './screens/NewPatientScreen';
import { initializeLocalDatabase } from './services/databaseService';

export type ScreenName = 'home' | 'newPatient' | 'diagnosis' | 'history';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');

  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  const renderScreen = () => {
    if (screen === 'newPatient') return <NewPatientScreen onNavigate={setScreen} />;
    if (screen === 'diagnosis') return <DiagnosisScreen />;
    if (screen === 'history') return <HistoryScreen />;
    return <HomeScreen onNavigate={setScreen} />;
  };

  return (
    <SafeAreaView>
      {renderScreen()}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
