import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './screens/HomeScreen';
import { initializeLocalDatabase } from './services/databaseService';

export default function App() {
  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  return (
    <SafeAreaView>
      <HomeScreen />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
