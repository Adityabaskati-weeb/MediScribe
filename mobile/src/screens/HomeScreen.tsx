import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { clinicDemoCases } from '../utils/clinicalDecisionSupport';
import { t } from '../utils/i18n';

export function HomeScreen({
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
  const c = theme.colors;

  const loadCase = (caseId: string) => {
    const demo = clinicDemoCases.find((item) => item.id === caseId);
    if (!demo) return;
    onDraftChange({
      ...draft,
      patient: demo.patient,
      transcript: demo.transcript,
      assessment: undefined,
      demoCaseId: demo.id,
      forceOfflineDemo: false,
      consultationStartedAt: Date.now()
    });
    onNavigate('summary');
  };

  const loadAirplaneModeDemo = () => {
    const demo = clinicDemoCases.find((item) => item.id === 'airplane-maternal-emergency');
    if (!demo) return;
    onDraftChange({
      ...draft,
      patient: demo.patient,
      transcript: demo.transcript,
      assessment: undefined,
      demoCaseId: demo.id,
      forceOfflineDemo: true,
      consultationStartedAt: Date.now()
    });
    onNavigate('diagnosis');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.hero, { backgroundColor: theme.mode === 'dark' ? '#0d2f38' : c.primaryDark }]}>
        <View style={styles.topRow}>
          <StatusPill label={copy('offlineReady')} tone="success" />
          <Pressable
            style={[styles.languagePill, { backgroundColor: theme.mode === 'dark' ? '#173c45' : '#ffffff' }]}
            onPress={() => onNavigate('settings')}
          >
            <Text style={[styles.languageText, { color: theme.mode === 'dark' ? '#dff9ff' : c.primaryDark }]}>
              {draft.language}
            </Text>
          </Pressable>
        </View>

        <View style={styles.identityRow}>
          <View style={[styles.brandMark, { backgroundColor: c.secondary }]}>
            <Text style={styles.brandMarkText}>MS</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.kicker}>MediScribe clinic mode</Text>
            <Text style={styles.location}>Rural OPD assistant</Text>
          </View>
        </View>

        <Text style={styles.title}>{copy('heroTitle')}</Text>
        <Text style={styles.copy}>{copy('heroCopy')}</Text>

        <View style={styles.heroStats}>
          <MiniStat label="Offline" value="100%" />
          <MiniStat label="Red flags" value="100%" />
          <MiniStat label="Bench cases" value="26" />
        </View>

        <ActionButton title={copy('startConsultation')} onPress={() => onNavigate('newPatient')} variant="success" />
        <Pressable style={styles.airplaneButton} onPress={loadAirplaneModeDemo}>
          <Text style={styles.airplaneTitle}>Airplane Mode Emergency Demo</Text>
          <Text style={styles.airplaneCopy}>Pregnancy bleeding case, local safety fallback, saved without internet.</Text>
        </Pressable>
      </View>

      <View style={styles.metrics}>
        <MetricCard value="24" label={copy('patientsToday')} color={c.primaryDark} />
        <MetricCard value="3" label={copy('urgentAlerts')} color={c.accent} />
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: c.ink }]}>Judge proof mode</Text>
            <Text style={[styles.helper, { color: c.muted }]}>
              Show the hackathon story with offline safety, local Gemma reasoning, and benchmark evidence.
            </Text>
          </View>
          <StatusPill label="Gemma + Ollama" tone="info" />
        </View>
        <View style={styles.proofGrid}>
          <ProofTile value="100%" label="Offline intake success" />
          <ProofTile value="100%" label="Red-flag recall" />
          <ProofTile value="4 agents" label="Diagnosis to safety" />
        </View>
      </Card>

      <View style={[styles.alertCard, { backgroundColor: c.dangerSoft, borderColor: theme.mode === 'dark' ? '#5b3134' : '#f4c7c7' }]}>
        <View style={styles.alertHeader}>
          <Text style={[styles.panelTitle, { color: c.ink }]}>{copy('needsAttention')}</Text>
          <StatusPill label="Triage queue" tone="danger" />
        </View>
        <Text style={[styles.alertText, { color: theme.mode === 'dark' ? '#ffd7d2' : '#7f1d1d' }]}>{copy('childAlert')}</Text>
        <Text style={[styles.alertText, { color: theme.mode === 'dark' ? '#ffd7d2' : '#7f1d1d' }]}>{copy('pregnancyAlert')}</Text>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: c.ink }]}>One-tap clinic scenarios</Text>
            <Text style={[styles.helper, { color: c.muted }]}>
              Demo emergency detection, offline flow, and explainable AI in seconds.
            </Text>
          </View>
          <StatusPill label="Pitch ready" tone="info" />
        </View>
        <View style={styles.caseGrid}>
          {clinicDemoCases.map((demo) => (
            <Pressable
              key={demo.id}
              style={({ pressed }) => [
                styles.caseTile,
                {
                  backgroundColor: theme.mode === 'dark' ? c.surfaceSoft : c.surfaceSoft,
                  borderColor: demo.risk === 'red' ? c.accent : demo.risk === 'amber' ? c.warning : c.border
                },
                pressed && styles.pressedTile
              ]}
              onPress={() => loadCase(demo.id)}
            >
              <StatusPill
                label={demo.risk === 'red' ? 'Emergency' : demo.risk === 'amber' ? 'Watch' : 'Routine'}
                tone={demo.risk === 'red' ? 'danger' : demo.risk === 'amber' ? 'warning' : 'success'}
              />
              <Text style={[styles.caseTitle, { color: c.ink }]}>{demo.title}</Text>
              <Text style={[styles.casePatient, { color: c.muted }]}>{demo.patient.name}, {demo.patient.age_years}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.quickGrid}>
        <QuickTile index="1" label={copy('voiceIntake')} onPress={() => onNavigate('voice')} />
        <QuickTile index="2" label={copy('records')} onPress={() => onNavigate('history')} />
        <QuickTile index="3" label={copy('settings')} onPress={() => onNavigate('settings')} />
      </View>
    </ScrollView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function MetricCard({ value, label, color }: { value: string; label: string; color: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.colors.muted }]}>{label}</Text>
    </View>
  );
}

function ProofTile({ value, label }: { value: string; label: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.proofTile, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.proofValue, { color: theme.colors.primaryDark }]}>{value}</Text>
      <Text style={[styles.proofLabel, { color: theme.colors.muted }]}>{label}</Text>
    </View>
  );
}

function QuickTile({ index, label, onPress }: { index: string; label: string; onPress: () => void }) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickTile,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressedTile
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickMark, { backgroundColor: theme.colors.infoSoft }]}>
        <Text style={[styles.quickMarkText, { color: theme.colors.primaryDark }]}>{index}</Text>
      </View>
      <Text style={[styles.quickText, { color: theme.colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 16,
    padding: spacing.lg
  },
  hero: {
    borderRadius: 8,
    gap: 16,
    overflow: 'hidden',
    padding: 22
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  languagePill: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  languageText: {
    fontWeight: '900'
  },
  identityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  brandMark: {
    alignItems: 'center',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    width: 52
  },
  brandMarkText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900'
  },
  identityText: {
    flex: 1,
    gap: 2
  },
  kicker: {
    color: '#baf0de',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  location: {
    color: '#d7eee8',
    fontSize: 13,
    fontWeight: '700'
  },
  title: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 37
  },
  copy: {
    color: '#d7eee8',
    fontSize: 16,
    lineHeight: 23
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8
  },
  heroStat: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 10
  },
  heroStatValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900'
  },
  heroStatLabel: {
    color: '#d7eee8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  },
  airplaneButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 13
  },
  airplaneTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900'
  },
  airplaneCopy: {
    color: '#d7eee8',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18
  },
  metrics: {
    flexDirection: 'row',
    gap: 12
  },
  metric: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 16
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900'
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  alertCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16
  },
  alertHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '900'
  },
  alertText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
  },
  caseGrid: {
    gap: 10
  },
  caseTile: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12
  },
  pressedTile: {
    opacity: 0.82
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  casePatient: {
    fontWeight: '700'
  },
  proofGrid: {
    flexDirection: 'row',
    gap: 8
  },
  proofTile: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 76,
    padding: 10
  },
  proofValue: {
    fontSize: 17,
    fontWeight: '900'
  },
  proofLabel: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    marginTop: 4
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10
  },
  quickTile: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 104,
    padding: 10
  },
  quickMark: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  quickMarkText: {
    fontSize: 15,
    fontWeight: '900'
  },
  quickText: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center'
  }
});
