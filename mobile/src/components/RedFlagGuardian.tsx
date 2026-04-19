import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { PatientProfile } from '../types/clinical';
import { evaluateGuardian } from '../utils/clinicalDecisionSupport';

export function RedFlagGuardian({ text, patient }: { text: string; patient?: PatientProfile }) {
  const flags = evaluateGuardian(text, patient);
  const hasRed = flags.some((flag) => flag.level === 'red');
  const { theme } = useAppTheme();
  const c = theme.colors;

  return (
    <Card style={[styles.card, hasRed && { backgroundColor: c.dangerSoft, borderColor: c.accent }]}>
      <Text style={[styles.eyebrow, { color: c.primary }]}>Red Flag Guardian</Text>
      <Text style={[styles.heading, { color: c.ink }]}>{hasRed ? 'Danger signs detected' : 'Safety check active'}</Text>
      {flags.map((flag) => (
        <View
          style={[
            styles.flag,
            { backgroundColor: c.surface, borderColor: c.border },
            flag.level === 'red' && { borderColor: c.accent },
            flag.level === 'amber' && { borderColor: c.warning }
          ]}
          key={flag.title}
        >
          <Text style={[styles.flagTitle, { color: flag.level === 'red' ? c.accent : flag.level === 'amber' ? c.warning : c.ink }]}>{flag.title}</Text>
          <Text style={[styles.message, { color: c.ink }]}>{flag.message}</Text>
          <Text style={[styles.action, { color: c.primaryDark }]}>{flag.action}</Text>
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
