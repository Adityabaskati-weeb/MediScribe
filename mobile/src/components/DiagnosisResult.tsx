import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { DiagnosisResultsCard } from './DiagnosisResultsCard';
import { useToast } from '../context/ToastContext';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { AgentStep, DiagnosisEnvelope, DifferentialDiagnosis, MediScribeAssessment, PatientProfile, SafetySignal } from '../types/clinical';

function getAssessment(result: DiagnosisEnvelope | null): MediScribeAssessment | undefined {
  return (
    result?.data?.agentic?.assessment ||
    result?.data?.agentic?.stored?.assessment ||
    result?.data?.ai?.assessment ||
    result?.data?.stored?.assessment ||
    result?.data?.assessment ||
    result?.assessment
  );
}

function getAgents(result: DiagnosisEnvelope | null): AgentStep[] {
  return result?.data?.agentic?.agents || result?.data?.agents || result?.agents || [];
}

export function DiagnosisResult({
  result,
  transcript = '',
  patient,
  offlineDemo = false
}: {
  result: DiagnosisEnvelope | null;
  transcript?: string;
  patient?: PatientProfile;
  offlineDemo?: boolean;
}) {
  const assessment = getAssessment(result);
  const agents = getAgents(result);
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const c = theme.colors;
  if (!assessment) return null;
  const urgent = ['immediate', 'emergent'].includes(assessment.urgency);

  return (
    <Card style={[urgent && { borderColor: c.accent, borderLeftColor: c.accent, borderLeftWidth: 6 }]}>
      <EmergencyCatchHero assessment={assessment} transcript={transcript} offlineDemo={offlineDemo} />
      <LocalIntelligenceCard urgent={urgent} offlineDemo={offlineDemo} />
      <DiagnosisResultsCard
        assessment={assessment}
        onSave={() => showToast('Assessment saved for offline sync', 'success')}
        onConsult={() => showToast('Doctor review request queued', urgent ? 'warning' : 'info')}
      />
      <View style={[styles.alertPanel, { backgroundColor: urgent ? c.dangerSoft : c.successSoft, borderColor: urgent ? c.accent : c.success }]}>
        {urgent && <Text style={[styles.commandText, { color: c.accent }]}>REFER NOW</Text>}
        <Text style={[styles.alertTitle, { color: urgent ? c.accent : c.success }]}>
          {urgent ? 'Emergency alert' : 'Clinical decision support'}
        </Text>
        <Text style={[styles.alertCopy, { color: c.ink }]}>
          {assessment.urgency?.toUpperCase()} - Triage category {assessment.triage_category}
        </Text>
      </View>
      <Text style={[styles.summary, { color: c.ink }]}>{assessment.clinical_summary}</Text>

      <View style={[styles.workerPanel, { backgroundColor: urgent ? c.dangerSoft : c.infoSoft, borderColor: urgent ? c.accent : c.primary }]}>
        <Text style={[styles.workerTitle, { color: urgent ? c.accent : c.primaryDark }]}>For the health worker</Text>
        <Text style={[styles.workerCopy, { color: c.ink }]}>{plainLanguageExplanation(assessment, transcript, patient, offlineDemo)}</Text>
      </View>

      <CarePathwayTimeline urgent={urgent} offlineDemo={offlineDemo} />

      {urgent && (
        <View style={[styles.referralCommand, { backgroundColor: c.accent }]}>
          <Text style={styles.referralCommandTitle}>Refer now</Text>
          <Text style={styles.referralCommandCopy}>Do not wait for sync. Repeat vitals, monitor the patient, and arrange transfer.</Text>
        </View>
      )}

      <Text style={[styles.heading, { color: c.ink }]}>AI Safety Council</Text>
      <View style={styles.agentGrid}>
        {buildCouncilAgents(assessment, agents, offlineDemo).map((agent) => (
          <View
            style={[
              styles.agentCard,
              {
                backgroundColor: agent.agent === 'safety-agent' && urgent ? c.dangerSoft : c.surfaceSoft,
                borderColor: agent.status === 'fallback' ? c.warning : agent.agent === 'safety-agent' && urgent ? c.accent : c.border,
                borderLeftColor: agent.agent === 'safety-agent' && urgent ? c.accent : agent.status === 'fallback' ? c.warning : c.primary,
                borderLeftWidth: 4
              }
            ]}
            key={agent.agent}
          >
            <Text style={[styles.agentName, { color: c.ink }]}>{agent.label}</Text>
            <Text style={[styles.agentStatus, { color: agent.status === 'fallback' ? c.warning : c.success }]}>
              {agent.status === 'fallback' ? 'Safety fallback' : 'Checked'}
            </Text>
            <Text style={[styles.agentOutput, { color: c.muted }]}>{agent.output}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.heading, { color: c.ink }]}>Top 3 possible diagnoses</Text>
      {(assessment.differential_diagnoses || []).slice(0, 3).map((item: DifferentialDiagnosis, index: number) => (
        <View style={[styles.row, { backgroundColor: c.surfaceSoft, borderColor: c.border }]} key={item.name}>
          <View style={[styles.rank, { backgroundColor: c.primary }]}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.rowBody}>
            <Text style={[styles.rowTitle, { color: c.ink }]}>{item.name}</Text>
            <View style={[styles.confidenceTrack, { backgroundColor: c.surfaceMuted }]}>
              <View style={[styles.confidenceFill, { backgroundColor: c.secondary, width: `${Math.max(8, Math.round((item.confidence || 0) * 100))}%` }]} />
            </View>
            <Text style={[styles.reason, { color: c.muted }]}>Confidence {Math.round((item.confidence || 0) * 100)}%</Text>
            <Text style={[styles.reason, { color: c.muted }]}>Why: {item.reasoning}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.heading, { color: c.ink }]}>Red flags</Text>
      {(assessment.red_flags || []).map((item: SafetySignal, index: number) => (
        <View style={[styles.flag, { backgroundColor: c.warningSoft, borderColor: c.warning }]} key={`${item.message}-${index}`}>
          <Text style={[styles.flagLevel, { color: c.warning }]}>{item.level}</Text>
          <Text style={[styles.flagMessage, { color: c.ink }]}>{item.message}</Text>
        </View>
      ))}

      <Text style={[styles.heading, { color: c.ink }]}>Recommended next steps</Text>
      {(assessment.treatment?.immediate_actions || []).map((action: string, index: number) => (
        <View style={styles.stepRow} key={action}>
          <Text style={[styles.stepIndex, { backgroundColor: c.surfaceMuted, color: c.primaryDark }]}>{index + 1}</Text>
          <Text style={[styles.step, { color: c.ink }]}>{action}</Text>
        </View>
      ))}
      <Text style={[styles.referral, { color: urgent ? c.accent : c.primaryDark }]}>Referral plan: {cleanReferralText(assessment.treatment?.referral, urgent)}</Text>
      <Text style={[styles.step, { color: c.ink }]}>Follow-up: {assessment.treatment?.follow_up}</Text>
      <Text style={[styles.disclaimer, { color: c.muted }]}>{assessment.disclaimer}</Text>
    </Card>
  );
}

function EmergencyCatchHero({
  assessment,
  transcript,
  offlineDemo
}: {
  assessment: MediScribeAssessment;
  transcript: string;
  offlineDemo: boolean;
}) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const urgent = ['immediate', 'emergent'].includes(assessment.urgency);
  const top = assessment.differential_diagnoses?.[0]?.name || 'Clinical review needed';
  const catchReason = findCatchReason(assessment, transcript);

  return (
    <View
      style={[
        styles.catchHero,
        {
          backgroundColor: urgent ? c.dangerSoft : c.successSoft,
          borderColor: urgent ? c.accent : c.success
        }
      ]}
    >
      <View style={styles.catchTopRow}>
        <Text style={[styles.catchKicker, { color: urgent ? c.accent : c.success }]}>
          {urgent ? 'Emergency catch moment' : 'Safety check complete'}
        </Text>
        <Text style={[styles.catchBadge, { backgroundColor: urgent ? c.accent : c.success }]}>
          {urgent ? 'REFER NOW' : 'SAFE FLOW'}
        </Text>
      </View>
      <Text style={[styles.catchTitle, { color: c.ink }]}>
        {urgent ? 'MediScribe caught the danger before sync.' : 'MediScribe kept the visit structured.'}
      </Text>
      <Text style={[styles.catchCopy, { color: c.muted }]}>
        {catchReason}. {offlineDemo ? 'Airplane mode is active, so the referral path uses local safety logic.' : `Top concern: ${top}.`}
      </Text>
      <View style={styles.catchProofRow}>
        <ProofChip label={offlineDemo ? 'Internet off' : 'AI ready'} tone={offlineDemo ? 'danger' : 'info'} />
        <ProofChip label="Saved locally" tone="success" />
        <ProofChip label={urgent ? 'Red flags first' : 'Guardrails checked'} tone={urgent ? 'danger' : 'success'} />
      </View>
    </View>
  );
}

function LocalIntelligenceCard({ urgent, offlineDemo }: { urgent: boolean; offlineDemo: boolean }) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  return (
    <View style={[styles.intelligenceCard, { backgroundColor: c.surfaceSoft, borderColor: c.border }]}>
      <View>
        <Text style={[styles.intelligenceKicker, { color: c.primaryDark }]}>Local intelligence layer</Text>
        <Text style={[styles.intelligenceTitle, { color: c.ink }]}>Gemma 4 plus deterministic safety</Text>
      </View>
      <View style={styles.intelligenceGrid}>
        <IntelligenceTile label="Model" value="Gemma 4 via Ollama" tone="info" />
        <IntelligenceTile label="Mode" value={offlineDemo ? 'Offline fallback' : 'Local-first'} tone={offlineDemo ? 'danger' : 'success'} />
        <IntelligenceTile label="Safety" value={urgent ? 'Override active' : 'Guarded output'} tone={urgent ? 'danger' : 'success'} />
      </View>
    </View>
  );
}

function CarePathwayTimeline({ urgent, offlineDemo }: { urgent: boolean; offlineDemo: boolean }) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const steps = [
    { label: 'Intake', done: true, tone: 'info' },
    { label: 'Vitals', done: true, tone: 'info' },
    { label: offlineDemo ? 'Local rules' : 'Gemma review', done: true, tone: 'success' },
    { label: 'Safety check', done: true, tone: urgent ? 'danger' : 'success' },
    { label: urgent ? 'Referral' : 'Care plan', done: true, tone: urgent ? 'danger' : 'success' }
  ] as const;
  return (
    <View style={[styles.pathway, { backgroundColor: c.surfaceSoft, borderColor: c.border }]}>
      <Text style={[styles.pathwayTitle, { color: c.ink }]}>Care pathway</Text>
      <View style={styles.pathwayRail}>
        {steps.map((step, index) => {
          const palette = step.tone === 'danger'
            ? { bg: c.dangerSoft, fg: c.accent }
            : step.tone === 'success'
              ? { bg: c.successSoft, fg: c.success }
              : { bg: c.infoSoft, fg: c.primaryDark };
          return (
            <View style={styles.pathwayStep} key={step.label}>
              {index > 0 && <View style={[styles.pathwayLine, { backgroundColor: c.borderStrong }]} />}
              <View style={[styles.pathwayDot, { backgroundColor: palette.bg, borderColor: palette.fg }]}>
                <Text style={[styles.pathwayDotText, { color: palette.fg }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.pathwayLabel, { color: palette.fg }]}>{step.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function IntelligenceTile({ label, value, tone }: { label: string; value: string; tone: 'info' | 'success' | 'danger' }) {
  const { theme } = useAppTheme();
  const palette = {
    info: { bg: theme.colors.infoSoft, fg: theme.colors.primaryDark },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.accent }
  }[tone];
  return (
    <View style={[styles.intelligenceTile, { backgroundColor: palette.bg }]}>
      <Text style={[styles.intelligenceLabel, { color: palette.fg }]}>{label}</Text>
      <Text style={[styles.intelligenceValue, { color: theme.colors.ink }]}>{value}</Text>
    </View>
  );
}

function ProofChip({ label, tone }: { label: string; tone: 'info' | 'success' | 'danger' }) {
  const { theme } = useAppTheme();
  const palette = {
    info: { bg: theme.colors.infoSoft, fg: theme.colors.primaryDark },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.accent }
  }[tone];
  return (
    <View style={[styles.proofChip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.proofChipText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

function findCatchReason(assessment: MediScribeAssessment, transcript: string) {
  const red = assessment.red_flags?.find((flag) => flag.level === 'red')?.message;
  if (/pregnan/i.test(transcript) && /bleeding|abdominal pain|dizzy/i.test(transcript)) {
    return 'Pregnancy plus bleeding, abdominal pain, and dizziness are danger signs';
  }
  return red || 'Safety guardrails reviewed the symptoms and vitals';
}

function cleanReferralText(referral?: string, urgent = false) {
  if (urgent) return 'Emergency transfer now';
  if (!referral) return 'Follow local clinic protocol';
  return referral
    .replace(/^Immediate emergency referral$/i, 'Emergency transfer now')
    .replace(/^Urgent clinician review$/i, 'Urgent clinician review today')
    .replace(/^Same-day review$/i, 'Same-day clinical review')
    .replace(/^Routine follow-up$/i, 'Routine follow-up');
}

function plainLanguageExplanation(assessment: MediScribeAssessment, transcript: string, patient?: PatientProfile, offlineDemo = false) {
  const top = assessment.differential_diagnoses?.[0]?.name || 'this case';
  const redFlag = assessment.red_flags?.find((flag) => flag.level === 'red')?.message;
  const pregnancy = patient?.pregnancy_weeks || /pregnan/i.test(transcript);
  if (pregnancy && /bleeding|abdominal pain|dizzy|headache|visual/i.test(transcript)) {
    return 'Bleeding or severe pain during pregnancy can become life-threatening. Refer now, repeat vitals, and keep the patient monitored during transfer.';
  }
  if (assessment.urgency === 'immediate' || assessment.urgency === 'emergent') {
    return `Treat this as urgent because ${redFlag || top} was detected. Stabilize first, repeat vitals, and start transfer before paperwork or sync.`;
  }
  return offlineDemo
    ? 'The phone used local rules because the clinic is offline. No danger sign was missed, and the visit can sync later.'
    : `The leading concern is ${top}. Confirm vitals, ask the follow-up questions, and use local protocol before treatment.`;
}

function buildCouncilAgents(assessment: MediScribeAssessment, agents: AgentStep[], offlineDemo: boolean) {
  const agentMap = new Map(agents.map((agent) => [agent.agent, agent]));
  const top = assessment.differential_diagnoses?.[0]?.name || 'Needs assessment';
  const red = assessment.red_flags?.some((flag) => flag.level === 'red');
  return [
    {
      agent: 'diagnosis-agent',
      label: 'Diagnosis Agent',
      status: agentMap.get('diagnosis-agent')?.status || (offlineDemo ? 'fallback' : 'completed'),
      output: top
    },
    {
      agent: 'reasoning-agent',
      label: 'Reasoning Agent',
      status: agentMap.get('reasoning-agent')?.status || 'completed',
      output: red ? 'Danger signs explain the escalation.' : 'Symptoms and vitals support the ranked list.'
    },
    {
      agent: 'treatment-agent',
      label: 'Treatment Agent',
      status: agentMap.get('treatment-agent')?.status || 'completed',
      output: cleanReferralText(assessment.treatment?.referral, Boolean(red))
    },
    {
      agent: 'safety-agent',
      label: 'Safety Agent',
      status: agentMap.get('safety-agent')?.status || (red ? 'fallback' : 'completed'),
      output: red ? 'Blocked routine advice. Referral wins.' : 'No red flag override needed.'
    }
  ];
}

const styles = StyleSheet.create({
  alertPanel: {
    borderWidth: 1,
    borderRadius: 8,
    gap: 4,
    padding: 14
  },
  commandText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0
  },
  alertTitle: {
    fontSize: 19,
    fontWeight: '900'
  },
  alertCopy: {
    color: colors.ink,
    fontWeight: '900'
  },
  summary: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22
  },
  heading: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8
  },
  workerPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12
  },
  workerTitle: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  workerCopy: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22
  },
  referralCommand: {
    borderRadius: 8,
    gap: 4,
    padding: 14
  },
  referralCommandTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900'
  },
  referralCommandCopy: {
    color: '#fdebea',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  },
  agentGrid: {
    gap: 9
  },
  agentCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  agentName: {
    fontSize: 15,
    fontWeight: '900'
  },
  agentStatus: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  agentOutput: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18
  },
  row: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10
  },
  rank: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34
  },
  rankText: {
    color: '#ffffff',
    fontWeight: '900'
  },
  rowBody: {
    flex: 1,
    gap: 6
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900'
  },
  confidenceTrack: {
    backgroundColor: '#dbe8eb',
    borderRadius: 5,
    height: 9,
    overflow: 'hidden'
  },
  confidenceFill: {
    backgroundColor: colors.secondary,
    height: 9
  },
  reason: {
    color: colors.muted,
    lineHeight: 20
  },
  flag: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderColor: '#f0cf8f',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  flagLevel: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  flagMessage: {
    color: colors.ink,
    fontWeight: '800',
    lineHeight: 22
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10
  },
  stepIndex: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.primaryDark,
    fontWeight: '900',
    minWidth: 28,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: 'center'
  },
  step: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
  },
  referral: {
    color: colors.primaryDark,
    fontWeight: '900',
    lineHeight: 22
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8
  },
  catchHero: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 15
  },
  catchTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  catchKicker: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  catchBadge: {
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  catchTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28
  },
  catchCopy: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22
  },
  catchProofRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  proofChip: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  proofChipText: {
    fontSize: 11,
    fontWeight: '900'
  },
  intelligenceCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  intelligenceKicker: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  intelligenceTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2
  },
  intelligenceGrid: {
    gap: 8
  },
  intelligenceTile: {
    borderRadius: 8,
    gap: 3,
    padding: 10
  },
  intelligenceLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  intelligenceValue: {
    fontSize: 14,
    fontWeight: '900'
  },
  pathway: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12
  },
  pathwayTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  pathwayRail: {
    flexDirection: 'row'
  },
  pathwayStep: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    position: 'relative'
  },
  pathwayLine: {
    height: 2,
    left: '-50%',
    position: 'absolute',
    top: 16,
    width: '100%'
  },
  pathwayDot: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  pathwayDotText: {
    fontSize: 12,
    fontWeight: '900'
  },
  pathwayLabel: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center'
  }
});
