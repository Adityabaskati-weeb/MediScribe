import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow && <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>{eyebrow}</Text>}
        <Text style={[styles.title, { color: theme.colors.ink }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{subtitle}</Text>}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between'
  },
  copy: {
    flex: 1,
    gap: 7
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});
