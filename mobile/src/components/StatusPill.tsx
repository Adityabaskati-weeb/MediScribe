import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';

export function StatusPill({
  label,
  tone = 'info'
}: {
  label: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
}) {
  const toneStyles = {
    info: styles.info,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger
  };
  const dotStyles = {
    info: styles.infoDot,
    success: styles.successDot,
    warning: styles.warningDot,
    danger: styles.dangerDot
  };
  const textStyles = {
    info: styles.infoText,
    success: styles.successText,
    warning: styles.warningText,
    danger: styles.dangerText
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
