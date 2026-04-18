import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { PatientForm } from '../components/PatientForm';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { createPatient } from '../services/databaseService';
import { colors, spacing } from '../styles/theme';
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
      <ActionButton compact title={copy('back')} onPress={() => onNavigate('home')} variant="secondary" />
      <ScreenHeader
        eyebrow={copy('step1')}
        title={copy('registerPatient')}
        subtitle={copy('registerCopy')}
        right={<StatusPill label="Local save" tone="success" />}
      />
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
    padding: spacing.lg,
    backgroundColor: colors.background
  }
});
