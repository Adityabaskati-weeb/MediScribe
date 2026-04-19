import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MedicalPulseAnimation } from './MedicalPulseAnimation';
import { useAppTheme } from '../styles/ThemeContext';
import type { MediScribeAssessment, SafetySignal } from '../types/clinical';
import { triggerHaptic } from '../utils/microInteractions';

type DiagnosisResultsCardProps = {
  assessment: MediScribeAssessment;
  onSave?: () => void;
  onConsult?: () => void;
};

export function DiagnosisResultsCard({ assessment, onSave, onConsult }: DiagnosisResultsCardProps) {
  const slide = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { theme } = useAppTheme();
  const top = assessment?.differential_diagnoses?.[0];
  const topConfidence = Math.max(0.05, top?.confidence || 0.42);
  const urgent = ['immediate', 'emergent'].includes(assessment?.urgency);
  const color = urgent ? theme.colors.accent : topConfidence >= 0.75 ? theme.colors.success : theme.colors.warning;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true })
    ]).start();
  }, [opacity, slide, topConfidence]);

  if (!assessment) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY: slide }] }]}>
      <View style={[styles.primary, { backgroundColor: color }]}>
        <MedicalPulseAnimation label={urgent ? 'REF' : 'DX'} tone={urgent ? 'danger' : 'success'} />
        <Text style={styles.label}>{urgent ? 'Emergency diagnosis support' : 'Primary diagnosis support'}</Text>
        <Text style={styles.diagnosis}>{top?.name || 'Needs clinical assessment'}</Text>
        <View style={styles.confidenceCircle}>
          <Text style={styles.confidenceValue}>{Math.round(topConfidence * 100)}%</Text>
          <Text style={styles.confidenceLabel}>confidence</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Why this diagnosis?</Text>
        <Text style={[styles.reason, { color: theme.colors.muted }]}>{top?.reasoning || assessment.clinical_summary}</Text>
      </View>

      {assessment.red_flags?.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Important alerts</Text>
          {assessment.red_flags.slice(0, 3).map((flag: SafetySignal, index: number) => (
            <Text style={[styles.alert, { color: theme.colors.ink }]} key={`${flag.message}-${index}`}>{flag.level.toUpperCase()}: {flag.message}</Text>
          ))}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Recommended treatment path</Text>
        {(assessment.treatment?.immediate_actions || []).slice(0, 4).map((action: string, index: number) => (
          <View style={styles.step} key={action}>
            <Text style={[styles.stepNumber, { backgroundColor: theme.colors.infoSoft, color: theme.colors.primaryDark }]}>{index + 1}</Text>
            <Text style={[styles.stepText, { color: theme.colors.ink }]}>{action}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            triggerHaptic('success');
            onSave?.();
          }}
        >
          <Text style={styles.actionText}>Save assessment</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.primary }]}
          onPress={() => {
            triggerHaptic('warning');
            onConsult?.();
          }}
        >
          <Text style={[styles.secondaryText, { color: theme.colors.primaryDark }]}>Consult doctor</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12
  },
  primary: {
    alignItems: 'center',
    borderRadius: 8,
    gap: 10,
    padding: 18
  },
  label: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  diagnosis: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'center'
  },
  confidenceCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 82,
    minWidth: 118,
    padding: 12
  },
  confidenceValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900'
  },
  confidenceLabel: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 11,
    fontWeight: '900'
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  reason: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21
  },
  alert: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10
  },
  stepNumber: {
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '900',
    minWidth: 30,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center'
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  },
  actions: {
    gap: 10
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2
  },
  actionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900'
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '900'
  }
});
