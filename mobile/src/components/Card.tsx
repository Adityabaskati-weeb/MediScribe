import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radii, shadow } from '../styles/theme';

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...shadow
  }
});
