import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../App';
import { useAppTheme } from '../styles/ThemeContext';
import { triggerHaptic } from '../utils/microInteractions';

const tabs: Array<{ screen: ScreenName; label: string; mark: string }> = [
  { screen: 'home', label: 'Home', mark: 'H' },
  { screen: 'newPatient', label: 'Consult', mark: 'C' },
  { screen: 'history', label: 'History', mark: 'R' },
  { screen: 'settings', label: 'Settings', mark: 'S' }
];

export function BottomTabBar({ active, onNavigate }: { active: ScreenName; onNavigate: (screen: ScreenName) => void }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {tabs.map((tab) => {
        const focused = active === tab.screen || (tab.screen === 'newPatient' && ['voice', 'summary', 'diagnosis', 'treatment'].includes(active));
        return (
          <Pressable
            accessibilityRole="button"
            key={tab.screen}
            onPress={() => {
              triggerHaptic('light');
              onNavigate(tab.screen);
            }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.mark, { backgroundColor: focused ? theme.colors.primary : theme.colors.surfaceMuted }]}>
              <Text style={[styles.markText, { color: focused ? '#ffffff' : theme.colors.muted }]}>{tab.mark}</Text>
            </View>
            <Text style={[styles.label, { color: focused ? theme.colors.primaryDark : theme.colors.muted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 72,
    paddingHorizontal: 10,
    paddingTop: 8
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    justifyContent: 'center'
  },
  pressed: {
    opacity: 0.72
  },
  mark: {
    alignItems: 'center',
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 34
  },
  markText: {
    fontSize: 12,
    fontWeight: '900'
  },
  label: {
    fontSize: 11,
    fontWeight: '900'
  }
});
