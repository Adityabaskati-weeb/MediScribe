import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii } from '../styles/theme';

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
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        compact && styles.compact,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{title}</Text>
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
  primary: {
    backgroundColor: colors.primary
  } as ViewStyle,
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  } as ViewStyle,
  danger: {
    backgroundColor: colors.accent
  } as ViewStyle,
  success: {
    backgroundColor: colors.secondary
  } as ViewStyle,
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
  },
  secondaryLabel: {
    color: colors.primaryDark
  }
});
