import { Platform, Vibration } from 'react-native';

export function triggerHaptic(type: 'light' | 'success' | 'warning' = 'light') {
  if (Platform.OS === 'web') return;
  const duration = type === 'success' ? 24 : type === 'warning' ? 36 : 12;
  Vibration.vibrate(duration);
}
