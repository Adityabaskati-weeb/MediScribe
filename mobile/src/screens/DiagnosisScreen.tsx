import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { SymptomChecker } from '../components/SymptomChecker';
import { ChartOCR } from '../components/ChartOCR';
import { VoiceInput } from '../components/VoiceInput';
import { analyzeMedicalCase } from '../services/gemmaService';
import { saveDiagnosis } from '../services/databaseService';
import { colors } from '../styles/theme';

export function DiagnosisScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState('Ready for intake');

  const analyze = async (symptoms: string) => {
    setStatus('Analyzing with Gemma/Ollama guardrails...');
    let response: any;
    try {
      response = await analyzeMedicalCase({
        patient: { age_years: 35, gender: 'unknown' },
        chief_complaint: symptoms,
        symptoms: [symptoms]
      });
      setStatus('Assessment saved locally and queued for sync');
    } catch {
      response = buildOfflineAssessment(symptoms);
      setStatus('Backend unavailable. Offline triage result saved locally.');
    }
    setResult(response);
    const assessment = response?.data?.stored?.assessment || response?.data?.ai?.assessment || response?.data?.assessment || response?.assessment;
    if (assessment) saveDiagnosis(`consultation-${Date.now()}`, assessment);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onNavigate && <ActionButton title="Back" onPress={() => onNavigate('home')} variant="secondary" />}
      <View style={styles.header}>
        <Text style={styles.kicker}>Clinical intake</Text>
        <Text style={styles.title}>Capture symptoms and triage risk</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      <VoiceInput onTranscript={analyze} />
      <ChartOCR onText={analyze} />
      <SymptomChecker onAnalyze={analyze} />
      <DiagnosisResult result={result} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20
  },
  header: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800'
  },
  status: {
    color: colors.muted,
    lineHeight: 20
  }
});

function buildOfflineAssessment(symptoms: string) {
  const lower = symptoms.toLowerCase();
  const urgent = /chest pain|shortness of breath|spo2\s*(8|7|6)|bp\s*8\d|unconscious|seizure/.test(lower);
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
      ? [{ level: 'red', message: 'Danger symptoms present. Refer urgently and reassess ABCs.' }]
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
