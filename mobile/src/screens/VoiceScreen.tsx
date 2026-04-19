import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { ChartOCR } from '../components/ChartOCR';
import { ConsultationProgress } from '../components/ConsultationProgress';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { SymptomChecker } from '../components/SymptomChecker';
import { VoiceInput } from '../components/VoiceInput';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { t } from '../utils/i18n';

export function VoiceScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  const copy = (key: Parameters<typeof t>[1]) => t(draft.language, key);
  const { theme } = useAppTheme();

  const saveTranscript = (text: string) => {
    onDraftChange({ ...draft, transcript: text });
    onNavigate('summary');
  };

  const saveChartText = (text: string) => {
    onDraftChange({ ...draft, chartText: text, transcript: [draft.transcript, text].filter(Boolean).join('\n') });
    onNavigate('summary');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActionButton compact title={copy('back')} onPress={() => onNavigate('newPatient')} variant="secondary" />
      <ScreenHeader
        eyebrow={copy('step2')}
        title={copy('describeSymptoms')}
        subtitle={copy('voiceScreenCopy')}
        right={<StatusPill label={draft.language} tone="info" />}
      />
      <ConsultationProgress current={2} />
      <View style={styles.intakeRail}>
        <StatusPill label="Voice" tone="success" />
        <StatusPill label="Chart scan" tone="info" />
        <StatusPill label="Manual backup" tone="warning" />
      </View>
      <VoiceInput language={draft.language} onTranscript={saveTranscript} />
      <ChartOCR onText={saveChartText} />
      <SymptomChecker onAnalyze={saveTranscript} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  },
  intakeRail: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  }
});
