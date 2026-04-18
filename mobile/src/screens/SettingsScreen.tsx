import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { colors } from '../styles/theme';

const languages = ['Hindi', 'Tamil', 'Telugu', 'Bengali', 'English'];

export function SettingsScreen({
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
      <Text style={styles.title}>Sync and settings</Text>

      <Card>
        <Text style={styles.sectionTitle}>Offline status</Text>
        <View style={styles.statusRow}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>Clinic mode active. Patient data is saved on device.</Text>
        </View>
        <Text style={styles.meta}>Queued records: 4 - Last sync: demo clinic morning round</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageGrid}>
          {languages.map((language) => (
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
        <Text style={styles.sectionTitle}>Model status</Text>
        <Text style={styles.meta}>Gemma medical assistant: cached for offline triage</Text>
        <Text style={styles.meta}>Guidelines pack: WHO-style danger signs cached</Text>
        <Text style={styles.meta}>SQLite: local storage ready</Text>
      </Card>

      <ActionButton title="Return Home" onPress={() => onNavigate('home')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900'
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
