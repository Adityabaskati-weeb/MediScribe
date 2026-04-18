import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { colors } from '../styles/theme';

export function HomeScreen({ draft, onNavigate }: { draft: ConsultationDraft; onNavigate: (screen: ScreenName) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.offlinePill}>
            <View style={styles.dot} />
            <Text style={styles.offlineText}>Offline Ready</Text>
          </View>
          <Pressable style={styles.languagePill} onPress={() => onNavigate('settings')}>
            <Text style={styles.languageText}>{draft.language}</Text>
          </Pressable>
        </View>
        <Text style={styles.kicker}>MediScribe</Text>
        <Text style={styles.title}>Fast clinical help for rural health workers</Text>
        <Text style={styles.copy}>Speak symptoms, scan notes, spot danger signs, and decide the next safe step.</Text>
        <ActionButton title="Start Consultation" onPress={() => onNavigate('newPatient')} variant="success" />
      </View>

      <View style={styles.metrics}>
        <Card style={styles.metric}>
          <Text style={styles.metricValue}>24</Text>
          <Text style={styles.metricLabel}>patients today</Text>
        </Card>
        <Card style={styles.metric}>
          <Text style={[styles.metricValue, styles.alertMetric]}>3</Text>
          <Text style={styles.metricLabel}>urgent alerts</Text>
        </Card>
      </View>

      <Card style={styles.alertCard}>
        <Text style={styles.panelTitle}>Needs attention</Text>
        <Text style={styles.alertText}>Child fever with low oxygen: review before next queue.</Text>
        <Text style={styles.alertText}>Pregnancy headache and high BP: referral check.</Text>
      </Card>

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickTile} onPress={() => onNavigate('voice')}>
          <Text style={styles.quickIcon}>Mic</Text>
          <Text style={styles.quickText}>Voice Intake</Text>
        </Pressable>
        <Pressable style={styles.quickTile} onPress={() => onNavigate('history')}>
          <Text style={styles.quickIcon}>Scan</Text>
          <Text style={styles.quickText}>Records</Text>
        </Pressable>
        <Pressable style={styles.quickTile} onPress={() => onNavigate('settings')}>
          <Text style={styles.quickIcon}>Sync</Text>
          <Text style={styles.quickText}>Settings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    gap: 14,
    padding: 20
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  offlinePill: {
    alignItems: 'center',
    backgroundColor: '#e6f7ef',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  dot: {
    backgroundColor: colors.success,
    borderRadius: 5,
    height: 10,
    width: 10
  },
  offlineText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '900'
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
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '800'
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
    flex: 1
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
  quickIcon: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900'
  },
  quickText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
  }
});
