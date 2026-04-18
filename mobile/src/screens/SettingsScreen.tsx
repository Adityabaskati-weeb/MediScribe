import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { colors, spacing } from '../styles/theme';
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ActionButton compact title={copy('back')} onPress={() => onNavigate('home')} variant="secondary" />
      <ScreenHeader
        eyebrow="Clinic device"
        title={copy('syncSettings')}
        subtitle="Keep the clinic ready for offline consultations, local storage, and model updates."
        right={<StatusPill label="Offline ready" tone="success" />}
      />

      <Card>
        <Text style={styles.sectionTitle}>{copy('offlineStatus')}</Text>
        <View style={styles.statusRow}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>{copy('offlineStatusCopy')}</Text>
        </View>
        <Text style={styles.meta}>{copy('queuedRecords')}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{copy('language')}</Text>
        <View style={styles.languageGrid}>
          {appLanguages.map((language) => (
            <Pressable
              key={language}
              style={[styles.languageChip, draft.language === language && styles.languageChipActive]}
              onPress={() => onDraftChange({ ...draft, language })}
            >
              <Text style={[styles.languageText, draft.language === language && styles.languageTextActive]}>{language}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{copy('modelStatus')}</Text>
        <Text style={styles.meta}>{copy('modelCached')}</Text>
        <Text style={styles.meta}>{copy('guidelinesCached')}</Text>
        <Text style={styles.meta}>{copy('sqliteReady')}</Text>
      </Card>

      <ActionButton title={copy('returnHome')} onPress={() => onNavigate('home')} />
    </ScrollView>
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
  }
});
