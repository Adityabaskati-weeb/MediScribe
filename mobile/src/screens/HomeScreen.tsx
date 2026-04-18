import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { colors, spacing } from '../styles/theme';
import { t } from '../utils/i18n';

export function HomeScreen({ draft, onNavigate }: { draft: ConsultationDraft; onNavigate: (screen: ScreenName) => void }) {
  const copy = (key: Parameters<typeof t>[1]) => t(draft.language, key);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <StatusPill label={copy('offlineReady')} tone="success" />
          <Pressable style={styles.languagePill} onPress={() => onNavigate('settings')}>
            <Text style={styles.languageText}>{draft.language}</Text>
          </Pressable>
        </View>
        <Text style={styles.kicker}>MediScribe</Text>
        <Text style={styles.title}>{copy('heroTitle')}</Text>
        <Text style={styles.copy}>{copy('heroCopy')}</Text>
        <ActionButton title={copy('startConsultation')} onPress={() => onNavigate('newPatient')} variant="success" />
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>24</Text>
          <Text style={styles.metricLabel}>{copy('patientsToday')}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, styles.alertMetric]}>3</Text>
          <Text style={styles.metricLabel}>{copy('urgentAlerts')}</Text>
        </View>
      </View>

      <Card style={styles.alertCard}>
        <Text style={styles.panelTitle}>{copy('needsAttention')}</Text>
        <Text style={styles.alertText}>{copy('childAlert')}</Text>
        <Text style={styles.alertText}>{copy('pregnancyAlert')}</Text>
      </Card>

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickTile} onPress={() => onNavigate('voice')}>
          <View style={styles.quickMark}><Text style={styles.quickMarkText}>1</Text></View>
          <Text style={styles.quickText}>{copy('voiceIntake')}</Text>
        </Pressable>
        <Pressable style={styles.quickTile} onPress={() => onNavigate('history')}>
          <View style={styles.quickMark}><Text style={styles.quickMarkText}>2</Text></View>
          <Text style={styles.quickText}>{copy('records')}</Text>
        </Pressable>
        <Pressable style={styles.quickTile} onPress={() => onNavigate('settings')}>
          <View style={styles.quickMark}><Text style={styles.quickMarkText}>3</Text></View>
          <Text style={styles.quickText}>{copy('settings')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 16,
    padding: spacing.lg
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    gap: 16,
    padding: 22
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  languagePill: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  languageText: {
    color: colors.primaryDark,
    fontWeight: '900'
  },
  kicker: {
    color: '#baf0de',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36
  },
  copy: {
    color: '#d7eee8',
    fontSize: 16,
    lineHeight: 23
  },
  metrics: {
    flexDirection: 'row',
    gap: 12
  },
  metric: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 16
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900'
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  alertMetric: {
    color: colors.accent
  },
  alertCard: {
    borderColor: '#f4c7c7',
    backgroundColor: colors.dangerSoft
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800'
  },
  alertText: {
    color: '#7f1d1d',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10
  },
  quickTile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 96,
    justifyContent: 'center',
    padding: 10
  },
  quickMark: {
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34
  },
  quickMarkText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900'
  },
  quickText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
  }
});
