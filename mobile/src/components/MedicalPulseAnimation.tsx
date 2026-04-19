import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../styles/ThemeContext';

export function MedicalPulseAnimation({ label = 'AI', tone = 'info' }: { label?: string; tone?: 'info' | 'success' | 'warning' | 'danger' }) {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;
  const { theme } = useAppTheme();
  const color = tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : tone === 'danger' ? theme.colors.accent : theme.colors.primary;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.14, duration: 850, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.88, duration: 850, useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.12, duration: 850, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 850, useNativeDriver: true })
        ])
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, scale]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, { borderColor: color, opacity, transform: [{ scale }] }]} />
      <View style={[styles.core, { backgroundColor: color }]}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
    width: 96
  },
  ring: {
    borderRadius: 8,
    borderWidth: 3,
    height: 84,
    position: 'absolute',
    width: 84
  },
  core: {
    alignItems: 'center',
    borderRadius: 8,
    height: 58,
    justifyContent: 'center',
    width: 58
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900'
  }
});
