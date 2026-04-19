import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../App';
import { useAppTheme } from '../styles/ThemeContext';

export function OfflineProofBanner({
  emergency = false,
  screen
}: {
  emergency?: boolean;
  screen: ScreenName;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const { theme } = useAppTheme();
  const c = theme.colors;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    ).start();
  }, [pulse]);

  const activeCare = ['voice', 'summary', 'diagnosis', 'treatment'].includes(screen);
  const title = emergency ? 'Critical command active' : activeCare ? 'Offline clinic workflow' : 'Offline ready';
  const message = emergency
    ? 'Safety rules are running locally. Refer now; sync can wait.'
    : 'SQLite saves visits on-device. Gemma 4 via Ollama can reason locally when available.';

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: emergency ? c.dangerSoft : c.surface,
          borderColor: emergency ? c.accent : c.border
        }
      ]}
    >
      <Animated.View
        style={[
          styles.beacon,
          {
            backgroundColor: emergency ? c.accent : c.success,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }]
          }
        ]}
      />
      <View style={styles.copyBlock}>
        <Text style={[styles.title, { color: emergency ? c.accent : c.primaryDark }]}>{title}</Text>
        <Text style={[styles.message, { color: c.muted }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <View style={[styles.statusBlock, { backgroundColor: emergency ? c.accent : c.success }]}>
        <Text style={styles.statusText}>{emergency ? 'REFER' : 'LOCAL'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  beacon: {
    borderRadius: 8,
    height: 18,
    width: 18
  },
  copyBlock: {
    flex: 1,
    gap: 2
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  message: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17
  },
  statusBlock: {
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 58,
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900'
  }
});
