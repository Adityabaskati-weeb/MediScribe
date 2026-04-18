import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { ChartOCR } from '../components/ChartOCR';
import { SymptomChecker } from '../components/SymptomChecker';
import { VoiceInput } from '../components/VoiceInput';
import { colors } from '../styles/theme';
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
      <ActionButton title={copy('back')} onPress={() => onNavigate('newPatient')} variant="secondary" />
      <View style={styles.header}>
        <Text style={styles.kicker}>{copy('step2')}</Text>
        <Text style={styles.title}>{copy('describeSymptoms')}</Text>
        <Text style={styles.copy}>{copy('voiceScreenCopy')}</Text>
        <View style={styles.languageBar}>
          <Text style={styles.languageLabel}>{copy('language')}</Text>
          <Text style={styles.languageValue}>{draft.language}</Text>
        </View>
      </View>
      <VoiceInput language={draft.language} onTranscript={saveTranscript} />
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
