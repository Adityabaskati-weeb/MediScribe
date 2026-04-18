import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text } from 'react-native';
import type { ScreenName } from '../App';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { SymptomChecker } from '../components/SymptomChecker';
import { ChartOCR } from '../components/ChartOCR';
import { VoiceInput } from '../components/VoiceInput';
import { analyzeMedicalCase } from '../services/gemmaService';
import { saveDiagnosis } from '../services/databaseService';

export function DiagnosisScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState('Ready for intake');

  const analyze = async (symptoms: string) => {
    setStatus('Analyzing with Gemma/Ollama guardrails...');
    const response = await analyzeMedicalCase({
      patient: { age_years: 35, gender: 'unknown' },
      chief_complaint: symptoms,
      symptoms: [symptoms]
    });
    setResult(response);
    const assessment = response?.data?.stored?.assessment || response?.data?.ai?.assessment || response?.assessment;
    if (assessment) saveDiagnosis(`consultation-${Date.now()}`, assessment);
    setStatus('Assessment saved locally and queued for sync');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onNavigate && <Button title="Back" onPress={() => onNavigate('home')} />}
      <Text style={styles.title}>Clinical intake</Text>
      <Text style={styles.status}>{status}</Text>
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
  title: {
    fontSize: 26,
    fontWeight: '800'
  },
  status: {
    color: '#42645b'
  }
});
