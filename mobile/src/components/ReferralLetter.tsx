import React, { useMemo, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { MediScribeAssessment, PatientProfile } from '../types/clinical';
import { buildReferralLetter } from '../utils/clinicalDecisionSupport';

export function ReferralLetter({ patient, transcript, assessment }: { patient?: PatientProfile; transcript?: string; assessment?: MediScribeAssessment }) {
  const letter = useMemo(() => buildReferralLetter({ patient, transcript, assessment }), [patient, transcript, assessment]);
  const [copied, setCopied] = useState(false);
  const { theme } = useAppTheme();
  const c = theme.colors;

  const share = async () => {
    setCopied(false);
    try {
      await Share.share({ title: 'MediScribe Referral Summary', message: letter });
    } catch {
      setCopied(true);
    }
  };

  return (
    <Card>
      <Text style={[styles.eyebrow, { color: c.primary }]}>Referral handoff</Text>
      <Text style={[styles.heading, { color: c.ink }]}>Clean summary for transfer</Text>
      <View style={[styles.handoffCard, { backgroundColor: isUrgent(assessment) ? c.dangerSoft : c.surfaceSoft, borderColor: isUrgent(assessment) ? c.accent : c.border }]}>
        <View style={styles.handoffTop}>
          <View>
            <Text style={[styles.handoffKicker, { color: isUrgent(assessment) ? c.accent : c.primaryDark }]}>Transfer snapshot</Text>
            <Text style={[styles.handoffTitle, { color: c.ink }]}>{cleanReferralText(assessment?.treatment?.referral, isUrgent(assessment))}</Text>
          </View>
          <Text style={[styles.handoffBadge, { backgroundColor: isUrgent(assessment) ? c.accent : c.success }]}>
            {isUrgent(assessment) ? 'URGENT' : 'READY'}
          </Text>
        </View>
        <View style={styles.handoffGrid}>
          <HandoffTile label="Patient" value={`${patient?.name || 'Unnamed'} | ${patient?.age_years || '--'} yrs`} />
          <HandoffTile label="Risk" value={assessment?.urgency || 'review'} />
          <HandoffTile label="Main concern" value={assessment?.differential_diagnoses?.[0]?.name || 'Clinical review'} />
          <HandoffTile label="Offline status" value="Saved on device" />
        </View>
      </View>
      <TextInput multiline editable={false} value={letter} style={[styles.letter, { backgroundColor: c.surfaceSoft, borderColor: c.border, color: c.ink }]} />
      <ActionButton title="Share Referral Summary" onPress={share} variant="secondary" />
      {copied && <Text style={[styles.note, { color: c.muted }]}>Sharing is not available on this device. Use the text above for handoff.</Text>}
    </Card>
  );
}

function HandoffTile({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.handoffTile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.handoffTileLabel, { color: theme.colors.muted }]}>{label}</Text>
      <Text style={[styles.handoffTileValue, { color: theme.colors.ink }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function isUrgent(assessment?: MediScribeAssessment) {
  return Boolean(assessment && ['immediate', 'emergent'].includes(assessment.urgency));
}

function cleanReferralText(referral?: string, urgent = false) {
  if (urgent) return 'Emergency transfer now';
  if (!referral) return 'Clinical review required';
  return referral
    .replace(/^Immediate emergency referral$/i, 'Emergency transfer now')
    .replace(/^Urgent clinician review$/i, 'Urgent clinician review today')
    .replace(/^Same-day review$/i, 'Same-day clinical review')
    .replace(/^Routine follow-up$/i, 'Routine follow-up');
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  handoffCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12
  },
  handoffTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  handoffKicker: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  handoffTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
    marginTop: 3
  },
  handoffBadge: {
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  handoffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  handoffTile: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 68,
    padding: 9,
    width: '48%'
  },
  handoffTileLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  handoffTileValue: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: 4
  },
  letter: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    minHeight: 210,
    padding: 12,
    textAlignVertical: 'top'
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  }
});
