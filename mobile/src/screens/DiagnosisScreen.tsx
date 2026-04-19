import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { RedFlagGuardian } from '../components/RedFlagGuardian';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { analyzeMedicalCase } from '../services/gemmaService';
import { saveDiagnosis } from '../services/databaseService';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
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
  const [result, setResult] = useState<any>(draft.assessment ? { assessment: draft.assessment } : null);
  const [status, setStatus] = useState('Ready for intake');
  const { theme } = useAppTheme();

  const analyze = async (symptoms: string) => {
    setStatus('Analyzing with Gemma/Ollama guardrails...');
    let response: any;
    try {
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
    } catch {
      response = buildOfflineAssessment(symptoms);
      setStatus('Backend unavailable. Offline triage result saved locally.');
    }
    setResult(response);
    const assessment =
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
      <RedFlagGuardian text={draft.transcript || ''} patient={draft.patient} />
      <View style={[styles.statusPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.statusLabel, { color: theme.colors.muted }]}>Assessment state</Text>
        <Text style={[styles.status, { color: theme.colors.ink }]}>{status}</Text>
      </View>
      <View style={styles.actions}>
        <ActionButton title="Generate Diagnosis" onPress={() => analyze(draft.transcript || '')} disabled={!draft.transcript?.trim()} />
        {result && onNavigate && <ActionButton title="Open Treatment Guidelines" onPress={() => onNavigate('treatment')} variant="success" />}
      </View>
      <DiagnosisResult result={result} />
    </ScrollView>
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
  }
});

function buildOfflineAssessment(symptoms: string) {
  const lower = symptoms.toLowerCase();
  const guardianFlags = evaluateGuardian(symptoms);
  const urgent = guardianFlags.some((flag) => flag.level === 'red') || /chest pain|shortness of breath|spo2\s*(8|7|6)|bp\s*8\d|unconscious|seizure/.test(lower);
  const fever = /fever|temp\s*3[89]|temp\s*40/.test(lower);
  const assessment = {
    assessment_id: `offline-${Date.now()}`,
    patient_id: 'local-demo-patient',
    urgency: urgent ? 'immediate' : fever ? 'urgent' : 'routine',
    triage_category: urgent ? 1 : fever ? 3 : 4,
    clinical_summary: `Offline assessment for symptoms: ${symptoms}`,
    differential_diagnoses: [
      {
        name: urgent ? 'Possible emergency presentation' : fever ? 'Respiratory infection or febrile illness' : 'Undifferentiated primary-care presentation',
        confidence: urgent ? 0.78 : fever ? 0.64 : 0.42,
        reasoning: urgent ? 'Danger symptoms were present in the transcript.' : 'Offline rule-based triage used until backend sync is available.'
      }
    ],
    red_flags: urgent
      ? guardianFlags.filter((flag) => flag.level === 'red').map((flag) => ({ level: 'red', message: `${flag.title}: ${flag.action}` })).concat([{ level: 'red', message: 'Danger symptoms present. Refer urgently and reassess ABCs.' }])
      : [{ level: fever ? 'amber' : 'green', message: fever ? 'Fever needs same-day review if persistent or worsening.' : 'No immediate red flag detected from transcript.' }],
    treatment: {
      immediate_actions: urgent ? ['Check airway, breathing, circulation.', 'Arrange urgent referral.'] : ['Record full vital signs.', 'Safety-net before discharge.'],
      suggested_tests: ['Repeat vital signs', 'Focused history and examination'],
      medications_to_consider: [],
      referral: urgent ? 'Immediate emergency referral' : fever ? 'Same-day review if worsening' : 'Routine follow-up',
      follow_up: urgent ? 'Reassess continuously until transfer.' : 'Review if symptoms worsen.'
    },
    model_source: 'mobile-offline-rules',
    disclaimer: 'Offline decision support only. Confirm with clinical judgement and local protocols.'
  };
  return { success: true, data: { assessment }, assessment };
}
