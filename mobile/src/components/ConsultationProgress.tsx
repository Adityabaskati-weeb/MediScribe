import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../styles/ThemeContext';

const steps = ['Patient', 'Voice', 'Summary', 'AI', 'Care'];

export function ConsultationProgress({ current }: { current: number }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === current;
        const complete = stepNumber < current;
        return (
          <View style={styles.step} key={step}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: active || complete ? theme.colors.primary : theme.colors.surfaceMuted,
                  borderColor: active ? theme.colors.secondary : theme.colors.border
                }
              ]}
            >
              <Text style={[styles.dotText, { color: active || complete ? '#ffffff' : theme.colors.muted }]}>
                {stepNumber}
              </Text>
            </View>
            <Text style={[styles.label, { color: active ? theme.colors.ink : theme.colors.muted }]}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 10
  },
  step: {
    alignItems: 'center',
    flex: 1,
    gap: 6
  },
  dot: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  dotText: {
    fontSize: 12,
    fontWeight: '900'
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center'
  }
});
