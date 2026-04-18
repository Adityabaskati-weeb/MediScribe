import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';

function getAssessment(result: any) {
  return (
    result?.data?.agentic?.assessment ||
    result?.data?.agentic?.stored?.assessment ||
    result?.data?.ai?.assessment ||
    result?.data?.stored?.assessment ||
    result?.data?.assessment ||
    result?.assessment
  );
}

export function DiagnosisResult({ result }: { result: any }) {
  const assessment = getAssessment(result);
  if (!assessment) return null;
  const urgent = ['immediate', 'emergent'].includes(assessment.urgency);

  return (
    <Card>
      <View style={[styles.alertPanel, urgent ? styles.alertDanger : styles.alertStable]}>
        <Text style={[styles.alertTitle, urgent ? styles.badgeDangerText : styles.badgeStableText]}>
          {urgent ? 'Emergency alert' : 'Clinical decision support'}
        </Text>
        <Text style={styles.alertCopy}>
          {assessment.urgency?.toUpperCase()} - Triage category {assessment.triage_category}
        </Text>
      </View>
      <Text style={styles.summary}>{assessment.clinical_summary}</Text>

      <Text style={styles.heading}>Top 3 possible diagnoses</Text>
      {(assessment.differential_diagnoses || []).slice(0, 3).map((item: any, index: number) => (
        <View style={styles.row} key={item.name}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <View style={styles.confidenceTrack}>
              <View style={[styles.confidenceFill, { width: `${Math.max(8, Math.round((item.confidence || 0) * 100))}%` }]} />
            </View>
            <Text style={styles.reason}>Confidence {Math.round((item.confidence || 0) * 100)}%</Text>
            <Text style={styles.reason}>Why: {item.reasoning}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.heading}>Red flags</Text>
      {(assessment.red_flags || []).map((item: any, index: number) => (
        <Text style={styles.flag} key={`${item.message}-${index}`}>{item.level}: {item.message}</Text>
      ))}

      <Text style={styles.heading}>Recommended next steps</Text>
      {(assessment.treatment?.immediate_actions || []).map((action: string) => <Text style={styles.step} key={action}>- {action}</Text>)}
      <Text style={styles.referral}>Referral: {assessment.treatment?.referral}</Text>
      <Text style={styles.step}>Follow-up: {assessment.treatment?.follow_up}</Text>
      <Text style={styles.disclaimer}>{assessment.disclaimer}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  alertPanel: {
    borderRadius: 8,
    gap: 4,
    padding: 14
  },
  alertDanger: {
    backgroundColor: '#fee2e2'
  },
  alertStable: {
    backgroundColor: '#dcfce7'
  },
  alertTitle: {
    fontSize: 19,
    fontWeight: '900'
  },
  alertCopy: {
    color: colors.ink,
    fontWeight: '900'
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
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8
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
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    color: colors.warning,
    fontWeight: '800',
    lineHeight: 22,
    padding: 10
  },
  step: {
    color: colors.ink,
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
  }
});
