import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { ActionButton } from './ActionButton';
import { useAppTheme } from '../styles/ThemeContext';
import { triggerHaptic } from '../utils/microInteractions';

export type SymptomOption = {
  id: string;
  label: string;
  category: string;
  cue: string;
};

const symptoms: SymptomOption[] = [
  { id: 'fever', label: 'Fever', category: 'body', cue: 'TEMP' },
  { id: 'cough', label: 'Cough', category: 'respiratory', cue: 'LUNG' },
  { id: 'fatigue', label: 'Fatigue', category: 'general', cue: 'REST' },
  { id: 'headache', label: 'Headache', category: 'neuro', cue: 'HEAD' },
  { id: 'nausea', label: 'Nausea', category: 'gi', cue: 'GI' },
  { id: 'sore-throat', label: 'Sore throat', category: 'respiratory', cue: 'THROAT' },
  { id: 'body-ache', label: 'Body ache', category: 'body', cue: 'PAIN' },
  { id: 'breathless', label: 'Shortness of breath', category: 'respiratory', cue: 'O2' }
];

export function InteractiveSymptomSelector({ onContinue }: { onContinue: (selected: SymptomOption[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { theme } = useAppTheme();

  const toggle = (id: string) => {
    triggerHaptic(selected.includes(id) ? 'light' : 'success');
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectedSymptoms = symptoms.filter((symptom) => selected.includes(symptom.id));

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Symptom checker</Text>
          <Text style={[styles.title, { color: theme.colors.ink }]}>Tap symptoms seen today</Text>
        </View>
        <View style={[styles.count, { backgroundColor: theme.colors.infoSoft }]}>
          <Text style={[styles.countText, { color: theme.colors.primaryDark }]}>{selected.length}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {symptoms.map((symptom) => (
          <SymptomCard
            key={symptom.id}
            symptom={symptom}
            selected={selected.includes(symptom.id)}
            onPress={() => toggle(symptom.id)}
          />
        ))}
      </View>
      <ActionButton
        title={`Continue with ${selected.length || 'selected'} symptoms`}
        onPress={() => onContinue(selectedSymptoms)}
        disabled={!selectedSymptoms.length}
        variant="secondary"
      />
    </Card>
  );
}

function SymptomCard({ symptom, selected, onPress }: { symptom: SymptomOption; selected: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { theme } = useAppTheme();

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={[
          styles.symptomCard,
          {
            backgroundColor: selected ? theme.colors.infoSoft : theme.colors.surfaceSoft,
            borderColor: selected ? theme.colors.primary : theme.colors.border
          }
        ]}
      >
        <Text style={[styles.cue, { color: selected ? theme.colors.primaryDark : theme.colors.muted }]}>{symptom.cue}</Text>
        <Text style={[styles.symptomLabel, { color: selected ? theme.colors.primaryDark : theme.colors.ink }]}>{symptom.label}</Text>
        {selected && <Text style={[styles.selectedMark, { color: theme.colors.success }]}>Selected</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26
  },
  count: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  countText: {
    fontSize: 18,
    fontWeight: '900'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  cardWrap: {
    width: '48%'
  },
  symptomCard: {
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
    minHeight: 104,
    justifyContent: 'center',
    padding: 12
  },
  cue: {
    fontSize: 11,
    fontWeight: '900'
  },
  symptomLabel: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20
  },
  selectedMark: {
    fontSize: 11,
    fontWeight: '900'
  }
});
