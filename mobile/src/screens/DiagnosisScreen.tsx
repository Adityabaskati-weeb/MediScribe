import React, { useState } from 'react';
import { View } from 'react-native';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { SymptomChecker } from '../components/SymptomChecker';
import { analyzeMedicalCase } from '../services/gemmaService';

export function DiagnosisScreen() {
  const [result, setResult] = useState<any>(null);
  return (
    <View>
      <SymptomChecker onAnalyze={async (symptoms) => setResult(await analyzeMedicalCase({
        patient: { age_years: 35, gender: 'unknown' },
        chief_complaint: symptoms,
        symptoms: [symptoms]
      }))} />
      <DiagnosisResult result={result} />
    </View>
  );
}
