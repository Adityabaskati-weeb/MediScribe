import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function getAssessment(result: any) {
  return result?.data?.ai?.assessment || result?.data?.stored?.assessment || result?.data?.assessment || result?.assessment;
}

export function DiagnosisResult({ result }: { result: any }) {
  const assessment = getAssessment(result);
  if (!assessment) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.badge}>{assessment.urgency?.toUpperCase()} - Category {assessment.triage_category}</Text>
      <Text style={styles.summary}>{assessment.clinical_summary}</Text>

      <Text style={styles.heading}>Top differentials</Text>
      {(assessment.differential_diagnoses || []).map((item: any) => (
        <View style={styles.row} key={item.name}>
          <Text style={styles.rowTitle}>{item.name} ({Math.round((item.confidence || 0) * 100)}%)</Text>
          <Text>{item.reasoning}</Text>
        </View>
      ))}

      <Text style={styles.heading}>Red flags</Text>
      {(assessment.red_flags || []).map((item: any, index: number) => (
        <Text key={`${item.message}-${index}`}>{item.level}: {item.message}</Text>
      ))}

      <Text style={styles.heading}>Treatment plan</Text>
      {(assessment.treatment?.immediate_actions || []).map((action: string) => <Text key={action}>- {action}</Text>)}
      <Text>Referral: {assessment.treatment?.referral}</Text>
      <Text>Follow-up: {assessment.treatment?.follow_up}</Text>
      <Text style={styles.disclaimer}>{assessment.disclaimer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 10,
    padding: 16
  },
  badge: {
    color: '#a12424',
    fontWeight: '800'
  },
  summary: {
    fontSize: 16,
    lineHeight: 22
  },
  heading: {
    fontWeight: '800',
    marginTop: 8
  },
  row: {
    borderColor: '#d9e5e1',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10
  },
  rowTitle: {
    fontWeight: '700'
  },
  disclaimer: {
    color: '#5d6f69',
    fontSize: 12,
    marginTop: 8
  }
});
