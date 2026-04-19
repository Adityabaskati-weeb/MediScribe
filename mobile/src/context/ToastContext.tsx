import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../styles/ThemeContext';

type ToastTone = 'success' | 'warning' | 'danger' | 'info';

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const [opacity] = useState(new Animated.Value(0));
  const { theme } = useAppTheme();

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    setToast({ message, tone });
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true })
    ]).start(() => setToast(null));
  }, [opacity]);

  const value = useMemo(() => ({ showToast }), [showToast]);
  const toneColor = toast?.tone === 'success'
    ? theme.colors.success
    : toast?.tone === 'warning'
      ? theme.colors.warning
      : toast?.tone === 'danger'
        ? theme.colors.accent
        : theme.colors.primary;

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.host}>
        {children}
        {toast && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toast,
              {
                opacity,
                backgroundColor: theme.colors.surface,
                borderColor: toneColor,
                transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }]
              }
            ]}
          >
            <Text style={[styles.message, { color: theme.colors.ink }]}>{toast.message}</Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  host: {
    flex: 1
  },
  toast: {
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 88,
    elevation: 6,
    left: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'absolute',
    right: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  message: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center'
  }
});
