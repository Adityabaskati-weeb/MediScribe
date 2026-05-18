import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { fetchDemoCases, fetchDemoOutput } from '../services/apiClient';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { DemoCaseSeed, DiagnosisEnvelope, MediScribeAssessment } from '../types/clinical';
import { buildTranscriptFromIntake, clinicDemoCases, type DemoCase } from '../utils/clinicalDecisionSupport';
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
  const copy = (key: Parameters<typeof t>[1]) => t('English', key);
  const { theme } = useAppTheme();
  const c = theme.colors;
  const [demoCases, setDemoCases] = useState<DemoCase[]>(clinicDemoCases);
  const [demoSource, setDemoSource] = useState<'backend' | 'device'>('device');
  const [loadingDemoId, setLoadingDemoId] = useState<string | null>(null);
  const heroCases = useMemo(() => demoCases.filter((item) => item.hero).slice(0, 2), [demoCases]);
  const standardCases = useMemo(() => demoCases.filter((item) => !item.hero), [demoCases]);
  const primaryHeroCase = heroCases[0];

  useEffect(() => {
    let active = true;
    fetchDemoCases()
      .then((remoteCases) => {
        if (!active || !remoteCases.length) return;
        setDemoCases(remoteCases.map(mapRemoteDemoCase));
        setDemoSource('backend');
      })
      .catch(() => {
        if (active) setDemoSource('device');
      });
    return () => {
      active = false;
    };
  }, []);

  const loadCase = async (demo: DemoCase) => {
    const nextDraft: ConsultationDraft = {
      ...draft,
      patient: demo.patient,
      transcript: demo.transcript,
      assessment: undefined,
      cachedDiagnosisResult: undefined,
      demoCaseId: demo.id,
      forceOfflineDemo: demo.demoMode === 'offline',
      consultationStartedAt: Date.now()
    };

    if (demo.hero && demo.demoMode !== 'offline' && demoSource === 'backend') {
      setLoadingDemoId(demo.id);
      try {
        const preloaded = await fetchDemoOutput(demo.id);
        const preloadedAssessment = extractAssessment(preloaded);
        onDraftChange({
          ...nextDraft,
          assessment: preloadedAssessment,
          cachedDiagnosisResult: preloaded
        });
        onNavigate('diagnosis');
        return;
      } catch {
        // Fall back to local transcript-driven flow.
      } finally {
        setLoadingDemoId(null);
      }
    }

    onDraftChange(nextDraft);
    onNavigate(demo.hero || demo.demoMode === 'offline' ? 'diagnosis' : 'summary');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.commandHeader, { backgroundColor: c.background }]}>
        <View>
          <Text style={[styles.commandKicker, { color: c.primaryDark }]}>Calm clinic, critical command</Text>
          <Text style={[styles.commandTitle, { color: c.ink }]}>Who needs care now?</Text>
        </View>
        <StatusPill label={copy('offlineReady')} tone="success" />
      </View>

      <View style={[styles.hero, { backgroundColor: theme.mode === 'dark' ? '#0d2f38' : c.primaryDark }]}>
        <View style={styles.topRow}>
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

        <Text style={styles.title}>Start calm. Act fast when risk appears.</Text>
        <Text style={styles.copy}>Voice, scan, or type. MediScribe keeps the visit structured, catches danger signs early, and saves care offline.</Text>

        <View style={styles.heroStats}>
          <MiniStat label="Offline" value="100%" />
          <MiniStat label="Red flags" value="100%" />
          <MiniStat label="Care paths" value="26" />
        </View>
        {primaryHeroCase ? (
          <View style={styles.promiseRow}>
            <PromiseTile label="Case" value={shortPromise(primaryHeroCase)} />
            <PromiseTile label="Impact" value={impactProof(primaryHeroCase)} />
            <PromiseTile label="Launch" value={launchHint(primaryHeroCase)} />
          </View>
        ) : null}

        <ActionButton title={copy('startConsultation')} onPress={() => onNavigate('newPatient')} variant="success" />
        {primaryHeroCase ? (
          <Pressable style={[styles.airplaneButton, loadingDemoId === primaryHeroCase.id && styles.loadingTile]} onPress={() => void loadCase(primaryHeroCase)}>
            <View style={styles.airplaneTopRow}>
              <StatusPill label={primaryHeroCase.demoMode === 'offline' ? 'Offline ready' : 'Local AI ready'} tone={primaryHeroCase.demoMode === 'offline' ? 'danger' : 'info'} />
              <StatusPill label={primaryHeroCase.risk === 'red' ? 'Emergency' : 'Ready'} tone={primaryHeroCase.risk === 'red' ? 'danger' : 'success'} />
            </View>
            <Text style={styles.airplaneTitle}>{loadingDemoId === primaryHeroCase.id ? 'Loading priority case...' : primaryHeroCase.title}</Text>
            <Text style={styles.airplaneCopy}>{primaryHeroCase.story}</Text>
            <Text style={styles.airplaneHint}>{impactProof(primaryHeroCase)}</Text>
          </Pressable>
        ) : null}
      </View>

      <Card>
        <View style={styles.storyHeader}>
          <View style={[styles.storyMark, { backgroundColor: c.dangerSoft, borderColor: c.accent }]}>
            <Text style={[styles.storyMarkText, { color: c.accent }]}>CARE</Text>
          </View>
          <View style={styles.storyText}>
            <Text style={[styles.panelTitle, { color: c.ink }]}>Urgent care readiness</Text>
            <Text style={[styles.helper, { color: c.muted }]}>
              When the clinic is offline and the queue is long, MediScribe keeps danger signs visible and prepares a clear referral handoff.
            </Text>
          </View>
        </View>
        <View style={styles.storySteps}>
          <StoryStep label="Offline" tone="safe" />
          <StoryStep label="Red flag" tone="danger" />
          <StoryStep label="Safety Agent" tone="info" />
          <StoryStep label="Refer now" tone="danger" />
        </View>
      </Card>

      <View style={styles.metrics}>
        <MetricCard value="24" label={copy('patientsToday')} color={c.primaryDark} />
        <MetricCard value="3" label={copy('urgentAlerts')} color={c.accent} />
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.panelTitle, { color: c.ink }]}>Clinic safety layer</Text>
            <Text style={[styles.helper, { color: c.muted }]}>
              Local records, red-flag checks, and AI-assisted reasoning stay aligned during every consultation.
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
            <Text style={[styles.panelTitle, { color: c.ink }]}>Priority care pathways</Text>
            <Text style={[styles.helper, { color: c.muted }]}>
              High-risk care flows open fast and stay usable with or without connectivity.
            </Text>
          </View>
          <StatusPill label={demoSource === 'backend' ? 'Live care pack' : 'Offline care pack'} tone={demoSource === 'backend' ? 'success' : 'info'} />
        </View>
        {heroCases.length > 0 && (
          <View style={styles.heroCaseGrid}>
            {heroCases.map((demo) => (
              <Pressable
                key={demo.id}
                style={({ pressed }) => [
                  styles.heroCaseTile,
                  {
                    backgroundColor: demo.demoMode === 'offline' ? c.dangerSoft : c.infoSoft,
                    borderColor: demo.demoMode === 'offline' ? c.accent : c.primary
                  },
                  pressed && styles.pressedTile
                ]}
                onPress={() => void loadCase(demo)}
              >
                <View style={styles.heroCaseTop}>
                  <StatusPill label={demo.demoMode === 'offline' ? 'Offline ready' : 'Local AI'} tone={demo.demoMode === 'offline' ? 'danger' : 'info'} />
                  <StatusPill label={demo.risk === 'red' ? 'Emergency' : 'Ready'} tone={demo.risk === 'red' ? 'danger' : 'success'} />
                </View>
                <Text style={[styles.heroCaseTitle, { color: c.ink }]}>{demo.title}</Text>
                <Text style={[styles.heroCaseStory, { color: c.muted }]}>{demo.story}</Text>
                <Text style={[styles.heroCaseImpact, { color: c.ink }]}>{impactProof(demo)}</Text>
                <View style={styles.heroCaseFooter}>
                  <Text style={[styles.heroFooterText, { color: c.primaryDark }]}>{launchHint(demo)}</Text>
                  <Text style={[styles.heroFooterText, { color: c.primaryDark }]}>{demo.demoMode === 'offline' ? 'No network required' : 'Prepared from the local backend service'}</Text>
                </View>
                {loadingDemoId === demo.id ? <Text style={[styles.caseStory, { color: c.primaryDark }]}>Preparing diagnosis...</Text> : null}
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.caseGrid}>
          {standardCases.map((demo) => (
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
              onPress={() => void loadCase(demo)}
            >
              <StatusPill
                label={demo.risk === 'red' ? 'Emergency' : demo.risk === 'amber' ? 'Watch' : 'Routine'}
                tone={demo.risk === 'red' ? 'danger' : demo.risk === 'amber' ? 'warning' : 'success'}
              />
              <Text style={[styles.caseTitle, { color: c.ink }]}>{demo.title}</Text>
              <Text style={[styles.casePatient, { color: c.muted }]}>{demo.patient.name}, {demo.patient.age_years}</Text>
              <Text style={[styles.caseStory, { color: c.muted }]}>{demo.story}</Text>
              <Text style={[styles.caseImpact, { color: c.ink }]}>{impactProof(demo)}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.quickGrid}>
        <QuickTile index="Voice" label={copy('voiceIntake')} onPress={() => onNavigate('voice')} />
        <QuickTile index="Chart" label="Capture chart" onPress={() => onNavigate('voice')} />
        <QuickTile index="History" label={copy('records')} onPress={() => onNavigate('history')} />
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

function StoryStep({ label, tone }: { label: string; tone: 'safe' | 'danger' | 'info' }) {
  const { theme } = useAppTheme();
  const palette = {
    safe: { bg: theme.colors.successSoft, fg: theme.colors.success },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.accent },
    info: { bg: theme.colors.infoSoft, fg: theme.colors.primaryDark }
  }[tone];
  return (
    <View style={[styles.storyStep, { backgroundColor: palette.bg }]}>
      <Text style={[styles.storyStepText, { color: palette.fg }]}>{label}</Text>
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

function PromiseTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.promiseTile}>
      <Text style={styles.promiseLabel}>{label}</Text>
      <Text style={styles.promiseValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  },
  commandHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
  commandKicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  commandTitle: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 35
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
  promiseRow: {
    flexDirection: 'row',
    gap: 8
  },
  promiseTile: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 74,
    padding: 10
  },
  promiseLabel: {
    color: '#d7eee8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  promiseValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18
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
  airplaneTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
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
  airplaneHint: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
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
  heroCaseGrid: {
    gap: 10
  },
  heroCaseTile: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14
  },
  heroCaseTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  heroCaseTitle: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23
  },
  heroCaseStory: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20
  },
  heroCaseImpact: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18
  },
  heroCaseFooter: {
    gap: 4
  },
  heroFooterText: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16
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
  loadingTile: {
    opacity: 0.9
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  casePatient: {
    fontWeight: '700'
  },
  caseStory: {
    fontSize: 13,
    lineHeight: 18
  },
  caseImpact: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17
  },
  proofGrid: {
    flexDirection: 'row',
    gap: 8
  },
  storyHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12
  },
  storyMark: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 54
  },
  storyMarkText: {
    fontSize: 12,
    fontWeight: '900'
  },
  storyText: {
    flex: 1
  },
  storySteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  storyStep: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  storyStepText: {
    fontSize: 12,
    fontWeight: '900'
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
    fontSize: 12,
    fontWeight: '900'
  },
  quickText: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center'
  }
});

function mapRemoteDemoCase(remoteCase: DemoCaseSeed): DemoCase {
  const lower = remoteCase.story.toLowerCase();
  return {
    id: remoteCase.id,
    title: remoteCase.title,
    story: remoteCase.story,
    risk: lower.includes('urgent') || lower.includes('danger') || lower.includes('stroke') || lower.includes('bleeding') ? 'red' : lower.includes('child') || lower.includes('oxygen') ? 'amber' : 'green',
    hero: remoteCase.hero,
    language: remoteCase.language,
    demoMode: remoteCase.demo_mode,
    expectedTrackStrength: remoteCase.expected_track_strength,
    patient: remoteCase.intake.patient,
    transcript: buildTranscriptFromIntake(remoteCase.intake)
  };
}

function extractAssessment(result: DiagnosisEnvelope): MediScribeAssessment | undefined {
  return (
    result?.data?.agentic?.assessment ||
    result?.data?.agentic?.stored?.assessment ||
    result?.data?.stored?.assessment ||
    result?.data?.ai?.assessment ||
    result?.data?.assessment ||
    result?.assessment
  );
}

function impactProof(demo: DemoCase) {
  if (demo.id.includes('maternal')) return 'Danger signs stay visible and referral starts before sync.';
  if (demo.id.includes('stroke')) return 'Speech and weakness cues escalate while the golden hour still matters.';
  if (demo.id.includes('child')) return 'Low-oxygen and feeding risk turn into same-day escalation.';
  if (demo.demoMode === 'offline') return 'The full path still works with no network.';
  return 'Structured triage, ranked reasoning, and a cleaner handoff.';
}

function launchHint(demo: DemoCase) {
  return demo.demoMode === 'offline' ? 'Tap to open the offline emergency path.' : demo.hero ? 'Tap to open a preloaded diagnosis.' : 'Tap to review and run diagnosis.';
}

function shortPromise(demo: DemoCase) {
  if (demo.id.includes('maternal')) return '32-week maternal emergency';
  if (demo.id.includes('stroke')) return 'Golden-hour stroke rescue';
  if (demo.id.includes('child')) return 'Child respiratory risk';
  return demo.title;
}
