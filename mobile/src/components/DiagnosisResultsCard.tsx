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
  const confidenceBand = describeConfidence(topConfidence, urgent);
  const alternatives = (assessment?.differential_diagnoses || []).slice(1, 3);
  const nextMove = assessment?.treatment?.immediate_actions?.[0] || assessment?.treatment?.referral || 'Use local protocol';

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
        <View style={styles.primaryTop}>
          <View style={styles.primaryIntro}>
            <MedicalPulseAnimation label={urgent ? 'REF' : 'DX'} tone={urgent ? 'danger' : 'success'} />
            <View style={styles.primaryIntroText}>
              <Text style={styles.label}>{urgent ? 'Emergency diagnosis support' : 'Primary diagnosis support'}</Text>
              <Text style={styles.primarySignal}>{confidenceBand.label}</Text>
            </View>
          </View>
          <View style={styles.confidenceCard}>
            <Text style={styles.confidenceValue}>{Math.round(topConfidence * 100)}%</Text>
            <Text style={styles.confidenceLabel}>confidence</Text>
          </View>
        </View>
        <Text style={styles.diagnosis}>{top?.name || 'Needs clinical assessment'}</Text>
        <Text style={styles.primaryCopy}>{confidenceBand.copy}</Text>
        <View style={styles.primaryRail}>
          <View style={styles.primaryRailTrack}>
            <View style={[styles.primaryRailFill, { width: `${Math.max(10, Math.round(topConfidence * 100))}%` }]} />
          </View>
        </View>
        <View style={styles.quickFacts}>
          <QuickFact label="Urgency" value={assessment.urgency.toUpperCase()} />
          <QuickFact label="Triage" value={`Category ${assessment.triage_category}`} />
          <QuickFact label="Next move" value={shortenFact(nextMove)} />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Why this diagnosis?</Text>
        <Text style={[styles.reason, { color: theme.colors.muted }]}>{top?.reasoning || assessment.clinical_summary}</Text>
      </View>

      {alternatives.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Alternative considerations</Text>
          <View style={styles.alternativeGrid}>
            {alternatives.map((item, index) => (
              <View key={item.name} style={[styles.alternativeTile, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
                <Text style={[styles.alternativeRank, { color: theme.colors.primaryDark }]}>#{index + 2}</Text>
                <Text style={[styles.alternativeName, { color: theme.colors.ink }]}>{item.name}</Text>
                <Text style={[styles.alternativeMeta, { color: theme.colors.muted }]}>
                  {Math.round((item.confidence || 0) * 100)}% confidence
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

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

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.quickFact}>
      <Text style={styles.quickFactLabel}>{label}</Text>
      <Text style={styles.quickFactValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function describeConfidence(confidence: number, urgent: boolean) {
  if (urgent) {
    return {
      label: 'Red flags override score',
      copy: 'This result is being escalated because the danger pattern matters more than model certainty.'
    };
  }
  if (confidence >= 0.8) {
    return {
      label: 'High-confidence leading concern',
      copy: 'The symptoms and vitals are lining up strongly enough to guide the next clinical move.'
    };
  }
  if (confidence >= 0.6) {
    return {
      label: 'Moderate-confidence pattern',
      copy: 'This is a strong working lead, but the next questions and repeat vitals still matter.'
    };
  }
  return {
    label: 'Early working lead',
    copy: 'Use this as structured support while you gather more findings and follow local protocol.'
  };
}

function shortenFact(value: string) {
  return value.length > 42 ? `${value.slice(0, 39).trim()}...` : value;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12
  },
  primary: {
    borderRadius: 8,
    gap: 12,
    padding: 18
  },
  primaryTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
  primaryIntro: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12
  },
  primaryIntroText: {
    flex: 1,
    gap: 3
  },
  label: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  primarySignal: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18
  },
  diagnosis: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'left'
  },
  primaryCopy: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20
  },
  confidenceCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 76,
    minWidth: 104,
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
  primaryRail: {
    gap: 6
  },
  primaryRailTrack: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden'
  },
  primaryRailFill: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    height: 10
  },
  quickFacts: {
    flexDirection: 'row',
    gap: 8
  },
  quickFact: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minHeight: 66,
    padding: 10
  },
  quickFactLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  quickFactValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18
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
  alternativeGrid: {
    gap: 8
  },
  alternativeTile: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  alternativeRank: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  alternativeName: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20
  },
  alternativeMeta: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17
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
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
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
