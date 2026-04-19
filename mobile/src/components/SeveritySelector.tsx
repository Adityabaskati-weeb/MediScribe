import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { ActionButton } from './ActionButton';
import { MedicalPulseAnimation } from './MedicalPulseAnimation';
import { useAppTheme } from '../styles/ThemeContext';
import { triggerHaptic } from '../utils/microInteractions';

function labelForSeverity(value: number) {
  if (value <= 3) return 'Mild';
  if (value <= 6) return 'Moderate';
  return 'Severe';
}

function descriptionForSeverity(value: number) {
  if (value <= 3) return 'Manageable. Monitor for change and continue intake.';
  if (value <= 6) return 'Needs attention. Check vitals and ask follow-up questions.';
  return 'High concern. Look for red flags and prepare referral if needed.';
}

export function SeveritySelector({
  symptom,
  onSubmit
}: {
  symptom: string;
  onSubmit: (severity: number) => void;
}) {
  const [severity, setSeverity] = useState(5);
  const [trackWidth, setTrackWidth] = useState(260);
  const pulse = useRef(new Animated.Value(1)).current;
  const { theme } = useAppTheme();
  const tone = severity <= 3 ? 'success' : severity <= 6 ? 'warning' : 'danger';
  const color = tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.accent;

  const updateSeverity = (value: number) => {
    const clean = Math.max(1, Math.min(10, Math.round(value)));
    setSeverity(clean);
    triggerHaptic(clean >= 7 ? 'warning' : 'light');
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 120, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 120, useNativeDriver: true })
    ]).start();
  };

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => updateSeverity((evt.nativeEvent.locationX / trackWidth) * 10),
    onPanResponderMove: (evt) => updateSeverity((evt.nativeEvent.locationX / trackWidth) * 10)
  });

  return (
    <Card>
      <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Severity selector</Text>
      <Text style={[styles.title, { color: theme.colors.ink }]}>How severe is {symptom || 'the main symptom'}?</Text>
      <Animated.View style={[styles.animationRow, { transform: [{ scale: pulse }] }]}>
        <MedicalPulseAnimation label={labelForSeverity(severity).slice(0, 3).toUpperCase()} tone={tone} />
        <View style={styles.scoreBlock}>
          <Text style={[styles.score, { color }]}>{severity}/10</Text>
          <Text style={[styles.scoreLabel, { color: theme.colors.muted }]}>{labelForSeverity(severity)}</Text>
        </View>
      </Animated.View>
      <View
        style={[styles.sliderTrack, { backgroundColor: theme.colors.surfaceMuted }]}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width || 260)}
        {...responder.panHandlers}
      >
        <View style={[styles.sliderFill, { backgroundColor: color, width: `${severity * 10}%` }]} />
        <View style={[styles.thumb, { backgroundColor: color, left: `${Math.max(0, severity * 10 - 5)}%` }]} />
      </View>
      <View style={styles.ticks}>
        <Text style={[styles.tick, { color: theme.colors.muted }]}>1</Text>
        <Text style={[styles.tick, { color: theme.colors.muted }]}>5</Text>
        <Text style={[styles.tick, { color: theme.colors.muted }]}>10</Text>
      </View>
      <Text style={[styles.description, { color: theme.colors.muted }]}>{descriptionForSeverity(severity)}</Text>
      <ActionButton title="Add severity to note" onPress={() => onSubmit(severity)} variant="secondary" />
    </Card>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26
  },
  animationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center'
  },
  scoreBlock: {
    gap: 4
  },
  score: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '900'
  },
  sliderTrack: {
    borderRadius: 8,
    height: 22,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%'
  },
  sliderFill: {
    height: 22
  },
  thumb: {
    borderColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 3,
    height: 28,
    marginTop: -25,
    position: 'absolute',
    width: 28
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tick: {
    fontSize: 12,
    fontWeight: '900'
  },
  description: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center'
  }
});
