import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import type { ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { PatientHistory } from '../components/PatientHistory';
import { getPatientHistory } from '../services/databaseService';
import { colors } from '../styles/theme';

export function HistoryScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getPatientHistory().then(setItems).catch(console.error);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onNavigate && <ActionButton title="Back" onPress={() => onNavigate('home')} variant="secondary" />}
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
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800'
  }
});
