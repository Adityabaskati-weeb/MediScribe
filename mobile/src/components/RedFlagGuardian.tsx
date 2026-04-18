import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { evaluateGuardian } from '../utils/clinicalDecisionSupport';

export function RedFlagGuardian({ text, patient }: { text: string; patient?: any }) {
  const flags = evaluateGuardian(text, patient);
  const hasRed = flags.some((flag) => flag.level === 'red');

  return (
    <Card style={[styles.card, hasRed && styles.dangerCard]}>
      <Text style={styles.eyebrow}>Red Flag Guardian</Text>
      <Text style={styles.heading}>{hasRed ? 'Danger signs detected' : 'Safety check active'}</Text>
      {flags.map((flag) => (
        <View style={[styles.flag, flag.level === 'red' && styles.redFlag, flag.level === 'amber' && styles.amberFlag]} key={flag.title}>
          <Text style={[styles.flagTitle, flag.level === 'red' && styles.redText, flag.level === 'amber' && styles.amberText]}>{flag.title}</Text>
          <Text style={styles.message}>{flag.message}</Text>
          <Text style={styles.action}>{flag.action}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong
  },
  dangerCard: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#efb2ac'
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900'
  },
  flag: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12
  },
  redFlag: {
    borderColor: '#efb2ac'
  },
  amberFlag: {
    borderColor: '#f0cf8f'
  },
  flagTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900'
  },
  redText: {
    color: colors.accent
  },
  amberText: {
    color: colors.warning
  },
  message: {
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 21
  },
  action: {
    color: colors.primaryDark,
    fontWeight: '900',
    lineHeight: 21
  }
});
