import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
    if (screen === 'diagnosis') return <DiagnosisScreen onNavigate={setScreen} />;
    if (screen === 'history') return <HistoryScreen onNavigate={setScreen} />;
    return <HomeScreen onNavigate={setScreen} />;
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
