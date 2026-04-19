import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MedicalPulseAnimation } from '../components/MedicalPulseAnimation';
import { useAppTheme } from '../styles/ThemeContext';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const { theme } = useAppTheme();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
    const timer = setTimeout(onDone, 1700);
    return () => clearTimeout(timer);
  }, [fade, onDone, scale, slide]);

  return (
    <View style={[styles.container, { backgroundColor: theme.mode === 'dark' ? '#07171d' : theme.colors.primaryDark }]}>
      <Animated.View style={[styles.panel, { opacity: fade, transform: [{ translateY: slide }, { scale }] }]}>
        <MedicalPulseAnimation label="MS" tone="success" />
        <Text style={styles.brand}>MediScribe</Text>
        <Text style={styles.tagline}>Medical AI for everyone</Text>
        <View style={styles.statusRow}>
          <Text style={styles.status}>Offline ready</Text>
          <Text style={styles.status}>Gemma powered</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  panel: {
    alignItems: 'center',
    gap: 12
  },
  brand: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42
  },
  tagline: {
    color: '#d7eee8',
    fontSize: 15,
    fontWeight: '800'
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8
  },
  status: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7
  }
});
