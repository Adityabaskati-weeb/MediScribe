import React, { useMemo, useState } from 'react';
import { Share, StyleSheet, Text, TextInput } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { buildReferralLetter } from '../utils/clinicalDecisionSupport';

export function ReferralLetter({ patient, transcript, assessment }: { patient?: any; transcript?: string; assessment?: any }) {
  const letter = useMemo(() => buildReferralLetter({ patient, transcript, assessment }), [patient, transcript, assessment]);
  const [copied, setCopied] = useState(false);

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
      <Text style={styles.eyebrow}>Referral letter</Text>
      <Text style={styles.heading}>Ready for hospital handoff</Text>
      <TextInput multiline editable={false} value={letter} style={styles.letter} />
      <ActionButton title="Share Referral Summary" onPress={share} variant="secondary" />
      {copied && <Text style={styles.note}>Sharing is not available on this device. Use the text above for handoff.</Text>}
    </Card>
  );
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
