import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { radii } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { triggerHaptic } from '../utils/microInteractions';

export function ActionButton({
  title,
  onPress,
  disabled,
  compact,
  variant = 'primary'
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}) {
  const { theme } = useAppTheme();
  const variantStyle = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceSoft : theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
    danger: { backgroundColor: theme.colors.accent },
    success: { backgroundColor: theme.colors.secondary }
  }[variant] as ViewStyle;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        triggerHaptic(variant === 'danger' ? 'warning' : 'light');
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        compact && styles.compact,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && { color: theme.colors.primaryDark }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.md,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  compact: {
    alignSelf: 'flex-start',
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.86
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center'
  }
});
