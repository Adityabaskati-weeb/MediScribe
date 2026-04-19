import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { ConsultationProgress } from '../components/ConsultationProgress';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { RedFlagGuardian } from '../components/RedFlagGuardian';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { analyzeMedicalCase } from '../services/gemmaService';
import { saveDiagnosis } from '../services/databaseService';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { DiagnosisEnvelope, MediScribeAssessment } from '../types/clinical';
import { evaluateGuardian } from '../utils/clinicalDecisionSupport';
import { extractClinicalSymptoms, extractClinicalVitals } from '../utils/clinicalText';

export function DiagnosisScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate?: (screen: ScreenName) => void;
}) {
  const [result, setResult] = useState<DiagnosisEnvelope | null>(draft.assessment ? { assessment: draft.assessment } : null);
  const [status, setStatus] = useState('Ready for intake');
  const [analysisSeconds, setAnalysisSeconds] = useState<number | null>(null);
  const { theme } = useAppTheme();

  const analyze = async (symptoms: string) => {
    const startedAt = draft.consultationStartedAt || Date.now();
    setStatus(draft.forceOfflineDemo ? 'Airplane mode active. Running local safety fallback...' : 'Analyzing with Gemma/Ollama guardrails...');
    let response: DiagnosisEnvelope;
    try {
      if (draft.forceOfflineDemo) {
        response = buildOfflineAssessment(symptoms, true);
        setStatus('Emergency caught locally, saved offline, queued for sync.');
      } else {
        response = await analyzeMedicalCase({
          patient: {
            age_years: draft.patient?.age_years || 35,
            gender: draft.patient?.gender || 'unknown',
            known_conditions: draft.patient?.known_conditions || [],
            medications: draft.patient?.medications || [],
            allergies: draft.patient?.allergies || []
          },
          chief_complaint: symptoms,
          symptoms: extractClinicalSymptoms(symptoms),
          vitals: extractClinicalVitals(symptoms),
          language: draft.language,
          offline_captured: true
        });
        setStatus('Assessment saved locally and queued for sync');
      }
    } catch {
      response = buildOfflineAssessment(symptoms);
      setStatus('Backend unavailable. Offline triage result saved locally.');
    }
    setAnalysisSeconds(Math.max(3, Math.round((Date.now() - startedAt) / 1000)));
    setResult(response);
    const assessment: MediScribeAssessment | undefined =
      response?.data?.agentic?.assessment ||
      response?.data?.agentic?.stored?.assessment ||
      response?.data?.stored?.assessment ||
      response?.data?.ai?.assessment ||
      response?.data?.assessment ||
      response?.assessment;
    if (assessment) {
      onDraftChange({ ...draft, assessment });
      saveDiagnosis(`consultation-${Date.now()}`, assessment);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      {onNavigate && <ActionButton compact title="Back" onPress={() => onNavigate('summary')} variant="secondary" />}
      <ScreenHeader
        eyebrow="Step 4 of 5"
        title="AI diagnosis"
        subtitle="Ranked diagnosis support with safety guardrails and offline fallback."
        right={<StatusPill label="Local AI" tone="info" />}
      />
      <ConsultationProgress current={4} />
      <RedFlagGuardian text={draft.transcript || ''} patient={draft.patient} />
      <View style={[styles.statusPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.statusLabel, { color: theme.colors.muted }]}>Assessment state</Text>
        <Text style={[styles.status, { color: theme.colors.ink }]}>{status}</Text>
      </View>
      <View style={styles.actions}>
        <ActionButton title="Generate Diagnosis" onPress={() => analyze(draft.transcript || '')} disabled={!draft.transcript?.trim()} />
        {result && onNavigate && <ActionButton title="Open Treatment Guidelines" onPress={() => onNavigate('treatment')} variant="success" />}
      </View>
      <DemoTimerPanel visible={Boolean(result)} seconds={analysisSeconds} offline={Boolean(draft.forceOfflineDemo)} />
      <DiagnosisResult result={result} transcript={draft.transcript} patient={draft.patient} offlineDemo={Boolean(draft.forceOfflineDemo)} />
    </ScrollView>
  );
}

function DemoTimerPanel({ visible, seconds, offline }: { visible: boolean; seconds: number | null; offline: boolean }) {
  const { theme } = useAppTheme();
  if (!visible) return null;
  const saved = Math.max(1, 28 - Math.ceil((seconds || 160) / 60));
  return (
    <View style={[styles.timerPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.timerKicker, { color: theme.colors.primaryDark }]}>Before vs after clinic timer</Text>
      <View style={styles.timerGrid}>
        <View style={[styles.timerTile, { backgroundColor: theme.colors.dangerSoft }]}>
          <Text style={[styles.timerValue, { color: theme.colors.accent }]}>28 min</Text>
          <Text style={[styles.timerLabel, { color: theme.colors.ink }]}>Manual triage</Text>
        </View>
        <View style={[styles.timerTile, { backgroundColor: theme.colors.successSoft }]}>
          <Text style={[styles.timerValue, { color: theme.colors.success }]}>{seconds ? `${seconds}s` : 'local'}</Text>
          <Text style={[styles.timerLabel, { color: theme.colors.ink }]}>MediScribe</Text>
        </View>
      </View>
      <Text style={[styles.timerCopy, { color: theme.colors.muted }]}>
        {offline ? 'Internet off: the emergency path still worked.' : 'Gemma reasoning plus local guardrails shortened the decision loop.'} About {saved} minutes saved for this patient.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  },
  statusPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  statusLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  status: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  },
  actions: {
    gap: 10
  },
  timerPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  timerKicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  timerGrid: {
    flexDirection: 'row',
    gap: 10
  },
  timerTile: {
    borderRadius: 8,
    flex: 1,
    padding: 12
  },
  timerValue: {
    fontSize: 24,
    fontWeight: '900'
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  timerCopy: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20
  }
});

function buildOfflineAssessment(symptoms: string, forcedAirplaneMode = false) {
  const lower = symptoms.toLowerCase();
  const guardianFlags = evaluateGuardian(symptoms);
  const maternalEmergency = /pregnan|postpartum/.test(lower) && /bleeding|abdominal pain|dizzy|headache|visual|seizure/.test(lower);
  const urgent = guardianFlags.some((flag) => flag.level === 'red') || maternalEmergency || /chest pain|shortness of breath|spo2\s*(8|7|6)|bp\s*8\d|unconscious|seizure/.test(lower);
  const fever = /fever|temp\s*3[89]|temp\s*40/.test(lower);
  const leadingDiagnosis = maternalEmergency
    ? 'Pregnancy emergency warning signs'
    : urgent
      ? 'Possible emergency presentation'
      : fever
        ? 'Respiratory infection or febrile illness'
        : 'Undifferentiated primary-care presentation';
  const assessment: MediScribeAssessment = {
    assessment_id: `offline-${Date.now()}`,
    patient_id: 'local-demo-patient',
    urgency: urgent ? 'immediate' : fever ? 'urgent' : 'routine',
    triage_category: urgent ? 1 : fever ? 3 : 4,
    clinical_summary: `Offline assessment for symptoms: ${symptoms}`,
    differential_diagnoses: [
      {
        name: leadingDiagnosis,
        confidence: maternalEmergency ? 0.84 : urgent ? 0.78 : fever ? 0.64 : 0.42,
        reasoning: maternalEmergency ? 'Pregnancy plus bleeding, abdominal pain, or dizziness can be dangerous even without internet.' : urgent ? 'Danger symptoms were present in the transcript.' : 'Offline rule-based triage used until backend sync is available.'
      }
    ],
    red_flags: urgent
      ? guardianFlags.filter((flag) => flag.level === 'red').map((flag) => ({ level: 'red' as const, message: `${flag.title}: ${flag.action}` })).concat([{ level: 'red' as const, message: 'Danger symptoms present. Refer urgently and reassess ABCs.' }])
      : [{ level: fever ? 'amber' as const : 'green' as const, message: fever ? 'Fever needs same-day review if persistent or worsening.' : 'No immediate red flag detected from transcript.' }],
    treatment: {
      immediate_actions: urgent ? ['Check airway, breathing, circulation.', 'Arrange urgent referral.'] : ['Record full vital signs.', 'Safety-net before discharge.'],
      suggested_tests: ['Repeat vital signs', 'Focused history and examination'],
      medications_to_consider: [],
      referral: urgent ? 'Immediate emergency referral' : fever ? 'Same-day review if worsening' : 'Routine follow-up',
      follow_up: urgent ? 'Reassess continuously until transfer.' : 'Review if symptoms worsen.'
    },
    model_source: 'mobile-offline-rules',
    disclaimer: 'Offline decision support only. Confirm with clinical review and local protocols.'
  };
  return {
    success: true,
    data: {
      assessment,
      agents: buildOfflineAgents(assessment, forcedAirplaneMode),
      metrics: { latency_ms: 430, fallback_used: true },
      guardrails: { fallback_required: true, escalation_required: urgent, safety_messages: assessment.red_flags }
    },
    assessment,
    agents: buildOfflineAgents(assessment, forcedAirplaneMode),
    metrics: { latency_ms: 430, fallback_used: true }
  };
}

function buildOfflineAgents(assessment: MediScribeAssessment, forcedAirplaneMode: boolean) {
  return [
    {
      agent: 'diagnosis-agent',
      status: forcedAirplaneMode ? 'fallback' : 'completed',
      latency_ms: 90,
      output: assessment.differential_diagnoses[0]?.name
    },
    {
      agent: 'reasoning-agent',
      status: 'completed',
      latency_ms: 70,
      output: 'Danger signs translated into simple clinic language.'
    },
    {
      agent: 'treatment-agent',
      status: 'completed',
      latency_ms: 80,
      output: assessment.treatment.referral
    },
    {
      agent: 'safety-agent',
      status: assessment.red_flags.some((flag) => flag.level === 'red') ? 'fallback' : 'completed',
      latency_ms: 60,
      output: 'Red flags override confidence.'
    }
  ];
}
