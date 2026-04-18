import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { ChartOCR } from '../components/ChartOCR';
import { SymptomChecker } from '../components/SymptomChecker';
import { VoiceInput } from '../components/VoiceInput';
import { colors } from '../styles/theme';

export function VoiceScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  const saveTranscript = (text: string) => {
    onDraftChange({ ...draft, transcript: text });
    onNavigate('summary');
  };

  const saveChartText = (text: string) => {
    onDraftChange({ ...draft, chartText: text, transcript: [draft.transcript, text].filter(Boolean).join('\n') });
    onNavigate('summary');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ActionButton title="Back" onPress={() => onNavigate('newPatient')} variant="secondary" />
      <View style={styles.header}>
        <Text style={styles.kicker}>Step 2 of 5</Text>
        <Text style={styles.title}>Describe symptoms</Text>
        <Text style={styles.copy}>Use voice first. Add chart scan or typed notes when the clinic is noisy.</Text>
        <View style={styles.languageBar}>
          <Text style={styles.languageLabel}>Language</Text>
          <Text style={styles.languageValue}>{draft.language}</Text>
        </View>
      </View>
      <VoiceInput onTranscript={saveTranscript} />
      <ChartOCR onText={saveChartText} />
      <SymptomChecker onAnalyze={saveTranscript} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20
  },
  header: {
    backgroundColor: colors.infoSoft,
    borderColor: '#b7ddff',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900'
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22
  },
  languageBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12
  },
  languageLabel: {
    color: colors.muted,
    fontWeight: '800'
  },
  languageValue: {
    color: colors.primaryDark,
    fontWeight: '900'
  }
});
