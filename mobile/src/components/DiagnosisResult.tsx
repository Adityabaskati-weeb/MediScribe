import React from 'react';
import { Text, View } from 'react-native';

export function DiagnosisResult({ result }: { result: any }) {
  const assessment = result?.data?.ai?.assessment || result?.data?.stored?.assessment || result?.assessment;
  if (!assessment) return null;
  return (
    <View>
      <Text>{assessment.urgency?.toUpperCase()} - Category {assessment.triage_category}</Text>
      <Text>{assessment.clinical_summary}</Text>
    </View>
  );
}
