import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';

function getAssessment(result: any) {
  return result?.data?.ai?.assessment || result?.data?.stored?.assessment || result?.data?.assessment || result?.assessment;
}

export function DiagnosisResult({ result }: { result: any }) {
  const assessment = getAssessment(result);
  if (!assessment) return null;
  const urgent = ['immediate', 'emergent'].includes(assessment.urgency);

  return (
    <Card>
      <View style={[styles.badge, urgent ? styles.badgeDanger : styles.badgeStable]}>
        <Text style={[styles.badgeText, urgent ? styles.badgeDangerText : styles.badgeStableText]}>
          {assessment.urgency?.toUpperCase()} - Category {assessment.triage_category}
        </Text>
      </View>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeDanger: {
    backgroundColor: '#fee2e2'
  },
  badgeStable: {
    backgroundColor: '#dcfce7'
  },
  badgeText: {
    fontWeight: '800'
  },
  badgeDangerText: {
    color: colors.accent
  },
  badgeStableText: {
    color: colors.success
  },
  summary: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22
  },
  heading: {
    color: colors.ink,
    fontWeight: '800',
    marginTop: 8
  },
  row: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10
  },
  rowTitle: {
    fontWeight: '700'
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8
  }
});
