import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { ChartOCR } from '../components/ChartOCR';
import { ConsultationProgress } from '../components/ConsultationProgress';
import { InteractiveSymptomSelector, SymptomOption } from '../components/InteractiveSymptomSelector';
import { ScreenHeader } from '../components/ScreenHeader';
import { SeveritySelector } from '../components/SeveritySelector';
import { StatusPill } from '../components/StatusPill';
import { SymptomChecker } from '../components/SymptomChecker';
import { VoiceInput } from '../components/VoiceInput';
import { useToast } from '../context/ToastContext';
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
  const { showToast } = useToast();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [quickNote, setQuickNote] = useState('');

  const saveTranscript = (text: string) => {
    onDraftChange({ ...draft, transcript: text });
    onNavigate('summary');
  };

  const saveChartText = (text: string) => {
    onDraftChange({ ...draft, chartText: text, transcript: [draft.transcript, text].filter(Boolean).join('\n') });
    onNavigate('summary');
  };

  const saveSelectedSymptoms = (selected: SymptomOption[]) => {
    const labels = selected.map((symptom) => symptom.label);
    const note = `Symptoms selected: ${labels.join(', ')}.`;
    setSelectedSymptom(labels[0] || '');
    setQuickNote(note);
    onDraftChange({ ...draft, transcript: [draft.transcript, note].filter(Boolean).join('\n') });
    showToast(`${labels.length} symptoms added`, 'success');
  };

  const saveSeverity = (severity: number) => {
    const note = `${quickNote || `Primary symptom: ${selectedSymptom || 'not specified'}.`} Severity: ${severity}/10 for ${selectedSymptom || 'main symptom'}.`;
    showToast('Severity added to intake', severity >= 7 ? 'warning' : 'success');
    saveTranscript(note);
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
      <View style={[styles.focusPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.focusHeader}>
          <View>
            <Text style={[styles.focusKicker, { color: theme.colors.primaryDark }]}>Focused capture</Text>
            <Text style={[styles.focusTitle, { color: theme.colors.ink }]}>Speak symptoms first. Edit later.</Text>
          </View>
          <StatusPill label="Offline save" tone="success" />
        </View>
        <View style={styles.intakeRail}>
          <StatusPill label="Voice" tone="success" />
          <StatusPill label="Chart scan" tone="info" />
          <StatusPill label="Manual backup" tone="warning" />
        </View>
      </View>
      <InteractiveSymptomSelector onContinue={saveSelectedSymptoms} />
      <SeveritySelector symptom={selectedSymptom || 'main symptom'} onSubmit={saveSeverity} />
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
  focusPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  focusHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
  focusKicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  focusTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25
  },
  intakeRail: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  }
});
