import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { PatientHistory } from '../components/PatientHistory';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { getPatientHistory } from '../services/databaseService';
import { colors, spacing } from '../styles/theme';

export function HistoryScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getPatientHistory().then(setItems).catch(console.error);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onNavigate && <ActionButton compact title="Back" onPress={() => onNavigate('home')} variant="secondary" />}
      <ScreenHeader
        eyebrow="Records"
        title="Patient history"
        subtitle="Local visit timeline with chart scans, triage notes, and saved AI assessments."
        right={<StatusPill label={`${items.length} saved`} tone={items.length ? 'success' : 'info'} />}
      />
      <PatientHistory items={items} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  }
});
