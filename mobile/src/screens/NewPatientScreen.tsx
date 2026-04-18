import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { PatientForm } from '../components/PatientForm';
import { createPatient } from '../services/databaseService';
import { colors } from '../styles/theme';
import { t } from '../utils/i18n';

export function NewPatientScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  const copy = (key: Parameters<typeof t>[1]) => t(draft.language, key);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ActionButton title={copy('back')} onPress={() => onNavigate('home')} variant="secondary" />
      <Text style={styles.kicker}>{copy('step1')}</Text>
      <Text style={styles.title}>{copy('registerPatient')}</Text>
      <Text style={styles.copy}>{copy('registerCopy')}</Text>
      <PatientForm onSubmit={(patient) => {
        createPatient(patient);
        onDraftChange({ ...draft, patient });
        onNavigate('voice');
      }} language={draft.language} />
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
