import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { resetLocalDemoData } from '../services/databaseService';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { appLanguages, t } from '../utils/i18n';

export function SettingsScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  const copy = (key: Parameters<typeof t>[1]) => t(draft.language, key);
  const { theme, toggleTheme, setThemeMode } = useAppTheme();
  const [resetState, setResetState] = useState<'idle' | 'done' | 'failed'>('idle');
  const c = theme.colors;

  const resetClinicState = async () => {
    try {
      resetLocalDemoData();
      await AsyncStorage.multiRemove(['mediscribe.language', 'mediscribe.theme']);
      setThemeMode('light');
      onDraftChange({ language: 'Hindi' });
      setResetState('done');
    } catch {
      setResetState('failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActionButton compact title={copy('back')} onPress={() => onNavigate('home')} variant="secondary" />
      <ScreenHeader
        eyebrow="Clinic device"
        title={copy('syncSettings')}
        subtitle="Keep the clinic ready for offline consultations, local storage, and model updates."
        right={<StatusPill label="Offline ready" tone="success" />}
      />

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>{copy('offlineStatus')}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: c.success }]} />
          <Text style={[styles.statusText, { color: c.ink }]}>{copy('offlineStatusCopy')}</Text>
        </View>
        <Text style={[styles.meta, { color: c.muted }]}>{copy('queuedRecords')}</Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>{copy('language')}</Text>
        <View style={styles.languageGrid}>
          {appLanguages.map((language) => (
            <Pressable
              key={language}
              style={[
                styles.languageChip,
                { backgroundColor: c.surfaceSoft, borderColor: c.border },
                draft.language === language && { backgroundColor: c.primary, borderColor: c.primary }
              ]}
              onPress={() => onDraftChange({ ...draft, language })}
            >
              <Text style={[styles.languageText, { color: draft.language === language ? '#ffffff' : c.ink }]}>{language}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Theme</Text>
        <Text style={[styles.meta, { color: c.muted }]}>Switch between bright clinic mode and low-light night clinic mode.</Text>
        <Pressable style={[styles.themeChoice, { borderColor: c.border, backgroundColor: c.surfaceSoft }]} onPress={toggleTheme}>
          <Text style={[styles.themeChoiceTitle, { color: c.ink }]}>{theme.mode === 'dark' ? 'Dark mode active' : 'Light mode active'}</Text>
          <Text style={[styles.themeChoiceMeta, { color: c.muted }]}>{theme.mode === 'dark' ? 'Tap for light mode' : 'Tap for dark mode'}</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>{copy('modelStatus')}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>{copy('modelCached')}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>{copy('guidelinesCached')}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>{copy('sqliteReady')}</Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Safety and AI status</Text>
        <View style={styles.proofRows}>
          <ProofRow label="Runtime" value="Gemma 4 via local Ollama" />
          <ProofRow label="Fallback" value="Deterministic triage rules" />
          <ProofRow label="Clinic paths" value="26 rural care scenarios" />
          <ProofRow label="Guardrail" value="Red flags override confidence" />
        </View>
        <Text style={[styles.meta, { color: c.muted }]}>
          MediScribe is decision support only. Emergency signs always trigger referral guidance before sync or model availability.
        </Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Reset clinic device</Text>
        <Text style={[styles.meta, { color: c.muted }]}>Clear local SQLite records plus saved language and theme so the next clinic session starts fresh.</Text>
        <ActionButton title="Reset local data" onPress={resetClinicState} variant="danger" />
        {resetState === 'done' && <Text style={[styles.resetMessage, { color: c.success }]}>Local data cleared. Start a new consultation from Home.</Text>}
        {resetState === 'failed' && <Text style={[styles.resetMessage, { color: c.accent }]}>Reset failed. Close and reopen the app, then try again.</Text>}
      </Card>

      <ActionButton title={copy('returnHome')} onPress={() => onNavigate('home')} />
    </ScrollView>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.proofRow, { borderColor: theme.colors.border }]}>
      <Text style={[styles.proofLabel, { color: theme.colors.muted }]}>{label}</Text>
      <Text style={[styles.proofValue, { color: theme.colors.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  dot: {
    backgroundColor: colors.success,
    borderRadius: 7,
    height: 14,
    width: 14
  },
  statusText: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22
  },
  meta: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  languageChip: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  languageChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  languageText: {
    color: colors.ink,
    fontWeight: '900'
  },
  languageTextActive: {
    color: '#ffffff'
  },
  themeChoice: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minHeight: 58,
    justifyContent: 'center',
    padding: 12
  },
  themeChoiceTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  themeChoiceMeta: {
    fontSize: 13,
    fontWeight: '700'
  },
  proofRows: {
    gap: 8
  },
  proofRow: {
    borderBottomWidth: 1,
    gap: 3,
    paddingBottom: 8
  },
  proofLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  proofValue: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21
  },
  resetMessage: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20
  }
});
