import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text } from 'react-native';
import type { ScreenName } from '../App';
import { PatientHistory } from '../components/PatientHistory';
import { getPatientHistory } from '../services/databaseService';

export function HistoryScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getPatientHistory().then(setItems).catch(console.error);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onNavigate && <Button title="Back" onPress={() => onNavigate('home')} />}
      <Text style={styles.title}>Patient history</Text>
      <PatientHistory items={items} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '800'
  }
});
