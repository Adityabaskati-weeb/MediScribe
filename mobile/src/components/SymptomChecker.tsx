import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';

export function SymptomChecker({ onAnalyze }: { onAnalyze: (symptoms: string) => void }) {
  const [symptoms, setSymptoms] = useState('');
  const { theme } = useAppTheme();
  const c = theme.colors;
  return (
    <Card>
      <Text style={[styles.eyebrow, { color: c.primary }]}>Manual intake</Text>
      <Text style={[styles.heading, { color: c.ink }]}>Symptom intake</Text>
      <TextInput
        multiline
        numberOfLines={5}
        placeholder="Example: fever, cough, BP 120/80, HR 90, temp 38.2"
        placeholderTextColor={c.quiet}
        style={[styles.input, { backgroundColor: c.surfaceSoft, borderColor: c.border, color: c.ink }]}
        value={symptoms}
        onChangeText={setSymptoms}
      />
      <ActionButton title="Analyze Symptoms" disabled={!symptoms.trim()} onPress={() => onAnalyze(symptoms)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900'
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 110,
    padding: 12,
    textAlignVertical: 'top'
  }
});
