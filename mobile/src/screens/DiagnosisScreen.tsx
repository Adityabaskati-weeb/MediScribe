import React, { useState } from 'react';
import { View } from 'react-native';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { SymptomChecker } from '../components/SymptomChecker';
import { ChartOCR } from '../components/ChartOCR';
import { VoiceInput } from '../components/VoiceInput';
import { analyzeMedicalCase } from '../services/gemmaService';
import { saveDiagnosis } from '../services/databaseService';

export function DiagnosisScreen() {
  const [result, setResult] = useState<any>(null);
  const analyze = async (symptoms: string) => {
    const response = await analyzeMedicalCase({
      patient: { age_years: 35, gender: 'unknown' },
      chief_complaint: symptoms,
      symptoms: [symptoms]
    });
    setResult(response);
    if (response?.assessment) saveDiagnosis(`consultation-${Date.now()}`, response.assessment);
  };

  return (
    <View>
      <VoiceInput onTranscript={analyze} />
      <ChartOCR onText={analyze} />
      <SymptomChecker onAnalyze={analyze} />
      <DiagnosisResult result={result} />
    </View>
  );
}
