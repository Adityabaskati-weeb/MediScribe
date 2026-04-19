import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';

export function StatusPill({
  label,
  tone = 'info'
}: {
  label: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
}) {
  const { theme } = useAppTheme();
  const toneStyles = {
    info: { backgroundColor: theme.colors.infoSoft },
    success: { backgroundColor: theme.colors.successSoft },
    warning: { backgroundColor: theme.colors.warningSoft },
    danger: { backgroundColor: theme.colors.dangerSoft }
  };
  const dotStyles = {
    info: { backgroundColor: theme.colors.primary },
    success: { backgroundColor: theme.colors.success },
    warning: { backgroundColor: theme.colors.warning },
    danger: { backgroundColor: theme.colors.accent }
  };
  const textStyles = {
    info: { color: theme.colors.primaryDark },
    success: { color: theme.colors.success },
    warning: { color: theme.colors.warning },
    danger: { color: theme.colors.accent }
  };

  return (
    <View style={[styles.pill, toneStyles[tone]]}>
      <View style={[styles.dot, dotStyles[tone]]} />
      <Text style={[styles.label, textStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 10
  },
  label: {
    fontSize: 12,
    fontWeight: '900'
  },
  dot: {
    borderRadius: 5,
    height: 9,
    width: 9
  },
  info: {
    backgroundColor: colors.infoSoft
  },
  success: {
    backgroundColor: colors.successSoft
  },
  warning: {
    backgroundColor: colors.warningSoft
  },
  danger: {
    backgroundColor: colors.dangerSoft
  },
  infoDot: {
    backgroundColor: colors.primary
  },
  successDot: {
    backgroundColor: colors.success
  },
  warningDot: {
    backgroundColor: colors.warning
  },
  dangerDot: {
    backgroundColor: colors.accent
  },
  infoText: {
    color: colors.primaryDark
  },
  successText: {
    color: colors.success
  },
  warningText: {
    color: colors.warning
  },
  dangerText: {
    color: colors.accent
  }
});
