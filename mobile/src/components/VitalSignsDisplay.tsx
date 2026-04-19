import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { useAppTheme } from '../styles/ThemeContext';

type Vital = {
  label: string;
  value: string | number;
  unit: string;
  normal: string;
  numeric?: number;
  range?: [number, number];
  cue: string;
};

export function VitalSignsDisplay({ vitals }: { vitals: Record<string, string | number> }) {
  const rows: Vital[] = [
    { label: 'Blood pressure', value: vitals.BP || '--', unit: 'mmHg', normal: '90/60 to 140/90', cue: 'BP' },
    { label: 'Heart rate', value: vitals.HR || '--', unit: 'bpm', normal: '60 to 100', numeric: asNumber(vitals.HR), range: [60, 100], cue: 'HR' },
    { label: 'Oxygen', value: vitals.SpO2 || '--', unit: '%', normal: '95 to 100', numeric: asNumber(vitals.SpO2), range: [95, 100], cue: 'O2' },
    { label: 'Temperature', value: vitals.Temp || '--', unit: 'C', normal: '36.5 to 37.5', numeric: asNumber(vitals.Temp), range: [36.5, 37.5], cue: 'TEMP' }
  ];
  const { theme } = useAppTheme();

  return (
    <Card>
      <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Interactive vitals</Text>
      <Text style={[styles.title, { color: theme.colors.ink }]}>Vital signs snapshot</Text>
      <View style={styles.grid}>
        {rows.map((vital, index) => <VitalCard vital={vital} index={index} key={vital.label} />)}
      </View>
    </Card>
  );
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function VitalCard({ vital, index }: { vital: Vital; index: number }) {
  const slide = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const { theme } = useAppTheme();
  const abnormal = vital.numeric !== undefined && vital.range ? vital.numeric < vital.range[0] || vital.numeric > vital.range[1] : false;
  const color = abnormal ? theme.colors.warning : theme.colors.success;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, delay: index * 90, duration: 360, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, delay: index * 90, duration: 360, useNativeDriver: true })
    ]).start();
    let loop: Animated.CompositeAnimation | undefined;
    if (abnormal) {
      loop = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true })
      ]));
      loop.start();
    }
    return () => loop?.stop();
  }, [abnormal, index, opacity, pulse, slide]);

  return (
    <Animated.View
      style={[
        styles.vital,
        {
          backgroundColor: theme.colors.surfaceSoft,
          borderColor: color,
          opacity,
          transform: [{ translateY: slide }, { scale: pulse }]
        }
      ]}
    >
      <View style={styles.vitalHeader}>
        <Text style={[styles.cue, { color }]}>{vital.cue}</Text>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.vitalLabel, { color: theme.colors.muted }]}>{vital.label}</Text>
      <Text style={[styles.vitalValue, { color: theme.colors.ink }]}>{vital.value}</Text>
      <Text style={[styles.vitalUnit, { color: theme.colors.muted }]}>{vital.unit}</Text>
      <Text style={[styles.normal, { color: theme.colors.quiet }]}>Normal: {vital.normal}</Text>
      {abnormal && <Text style={[styles.warning, { color: theme.colors.warning }]}>Abnormal</Text>}
    </Animated.View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  vital: {
    borderRadius: 8,
    borderWidth: 2,
    minHeight: 154,
    padding: 12,
    width: '48%'
  },
  vitalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cue: {
    fontSize: 11,
    fontWeight: '900'
  },
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10
  },
  vitalLabel: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4
  },
  vitalUnit: {
    fontSize: 11,
    fontWeight: '800'
  },
  normal: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 8
  },
  warning: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'uppercase'
  }
});
