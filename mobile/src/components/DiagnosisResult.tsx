import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { DiagnosisResultsCard } from './DiagnosisResultsCard';
import { useToast } from '../context/ToastContext';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';

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
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const c = theme.colors;
  if (!assessment) return null;
  const urgent = ['immediate', 'emergent'].includes(assessment.urgency);

  return (
    <Card>
      <DiagnosisResultsCard
        assessment={assessment}
        onSave={() => showToast('Assessment saved for offline sync', 'success')}
        onConsult={() => showToast('Doctor review request queued', urgent ? 'warning' : 'info')}
      />
      <View style={[styles.alertPanel, { backgroundColor: urgent ? c.dangerSoft : c.successSoft, borderColor: urgent ? c.accent : c.success }]}>
        <Text style={[styles.alertTitle, { color: urgent ? c.accent : c.success }]}>
          {urgent ? 'Emergency alert' : 'Clinical decision support'}
        </Text>
        <Text style={[styles.alertCopy, { color: c.ink }]}>
          {assessment.urgency?.toUpperCase()} - Triage category {assessment.triage_category}
        </Text>
      </View>
      <Text style={[styles.summary, { color: c.ink }]}>{assessment.clinical_summary}</Text>

      <Text style={[styles.heading, { color: c.ink }]}>Top 3 possible diagnoses</Text>
      {(assessment.differential_diagnoses || []).slice(0, 3).map((item: any, index: number) => (
        <View style={[styles.row, { backgroundColor: c.surfaceSoft, borderColor: c.border }]} key={item.name}>
          <View style={[styles.rank, { backgroundColor: c.primary }]}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.rowBody}>
            <Text style={[styles.rowTitle, { color: c.ink }]}>{item.name}</Text>
            <View style={[styles.confidenceTrack, { backgroundColor: c.surfaceMuted }]}>
              <View style={[styles.confidenceFill, { backgroundColor: c.secondary, width: `${Math.max(8, Math.round((item.confidence || 0) * 100))}%` }]} />
            </View>
            <Text style={[styles.reason, { color: c.muted }]}>Confidence {Math.round((item.confidence || 0) * 100)}%</Text>
            <Text style={[styles.reason, { color: c.muted }]}>Why: {item.reasoning}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.heading, { color: c.ink }]}>Red flags</Text>
      {(assessment.red_flags || []).map((item: any, index: number) => (
        <View style={[styles.flag, { backgroundColor: c.warningSoft, borderColor: c.warning }]} key={`${item.message}-${index}`}>
          <Text style={[styles.flagLevel, { color: c.warning }]}>{item.level}</Text>
          <Text style={[styles.flagMessage, { color: c.ink }]}>{item.message}</Text>
        </View>
      ))}

      <Text style={[styles.heading, { color: c.ink }]}>Recommended next steps</Text>
      {(assessment.treatment?.immediate_actions || []).map((action: string, index: number) => (
        <View style={styles.stepRow} key={action}>
          <Text style={[styles.stepIndex, { backgroundColor: c.surfaceMuted, color: c.primaryDark }]}>{index + 1}</Text>
          <Text style={[styles.step, { color: c.ink }]}>{action}</Text>
        </View>
      ))}
      <Text style={[styles.referral, { color: c.primaryDark }]}>Referral: {assessment.treatment?.referral}</Text>
      <Text style={[styles.step, { color: c.ink }]}>Follow-up: {assessment.treatment?.follow_up}</Text>
      <Text style={[styles.disclaimer, { color: c.muted }]}>{assessment.disclaimer}</Text>
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
    backgroundColor: colors.dangerSoft,
    borderColor: '#efb2ac',
    borderWidth: 1
  },
  alertStable: {
    backgroundColor: colors.successSoft,
    borderColor: '#aadcc7',
    borderWidth: 1
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
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderColor: '#f0cf8f',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  flagLevel: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  flagMessage: {
    color: colors.ink,
    fontWeight: '800',
    lineHeight: 22
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10
  },
  stepIndex: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.primaryDark,
    fontWeight: '900',
    minWidth: 28,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: 'center'
  },
  step: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
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
