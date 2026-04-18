import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { PatientForm } from '../components/PatientForm';
import { createPatient } from '../services/databaseService';
import { colors } from '../styles/theme';

export function NewPatientScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ActionButton title="Back" onPress={() => onNavigate('home')} variant="secondary" />
      <Text style={styles.kicker}>Step 1 of 5</Text>
      <Text style={styles.title}>Register patient</Text>
      <Text style={styles.copy}>Only the essential details are needed to start. More can be added after triage.</Text>
      <PatientForm onSubmit={(patient) => {
        createPatient(patient);
        onDraftChange({ ...draft, patient });
        onNavigate('voice');
      }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800'
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22
  }
});
