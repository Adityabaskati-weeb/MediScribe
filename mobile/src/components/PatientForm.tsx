import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';

export function PatientForm({ onSubmit }: { onSubmit: (patient: any) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('unknown');
  const [conditions, setConditions] = useState('');

  const canSubmit = name.trim().length > 1 && Number(age) > 0;

  return (
    <Card>
      <Text style={styles.eyebrow}>Patient profile</Text>
      <Text style={styles.heading}>Patient registration</Text>
      <TextInput style={styles.input} placeholder="Patient name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Age" keyboardType="number-pad" value={age} onChangeText={setAge} />
      <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} />
      <TextInput style={styles.input} placeholder="Known conditions" value={conditions} onChangeText={setConditions} />
      <ActionButton
        title="Register and Continue"
        disabled={!canSubmit}
        onPress={() => onSubmit({
          name,
          age_years: Number(age),
          gender,
          known_conditions: conditions.split(',').map((item) => item.trim()).filter(Boolean)
        })}
      />
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
    fontWeight: '700'
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  }
});
