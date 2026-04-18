import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { colors } from '../styles/theme';

export function HomeScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>MediScribe</Text>
        <Text style={styles.title}>Offline medical AI for rural clinics</Text>
        <Text style={styles.copy}>
          Register patients, capture symptoms, scan charts, and surface urgent red flags even when the clinic is offline.
        </Text>
      </View>

      <View style={styles.metrics}>
        <Card style={styles.metric}>
          <Text style={styles.metricValue}>3s</Text>
          <Text style={styles.metricLabel}>triage target</Text>
        </Card>
        <Card style={styles.metric}>
          <Text style={styles.metricValue}>91%</Text>
          <Text style={styles.metricLabel}>benchmark</Text>
        </Card>
      </View>

      <View style={styles.actions}>
        <ActionButton title="Register Patient" onPress={() => onNavigate('newPatient')} />
        <ActionButton title="Start Diagnosis" onPress={() => onNavigate('diagnosis')} variant="secondary" />
        <ActionButton title="View History" onPress={() => onNavigate('history')} variant="secondary" />
      </View>

      <Card>
        <Text style={styles.panelTitle}>Demo flow</Text>
        <Text style={styles.step}>1. Register a patient.</Text>
        <Text style={styles.step}>2. Capture symptoms by voice, OCR, or form.</Text>
        <Text style={styles.step}>3. Review urgency, red flags, treatment, and referral.</Text>
      </Card>
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
    gap: 12,
    padding: 20
  },
  kicker: {
    color: '#baf0de',
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
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
  actions: {
    gap: 10
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800'
  },
  step: {
    color: colors.muted,
    lineHeight: 21
  }
});
