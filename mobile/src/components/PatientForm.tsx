import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export function PatientForm({ onSubmit }: { onSubmit: (patient: any) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('unknown');
  const [conditions, setConditions] = useState('');

  const canSubmit = name.trim().length > 1 && Number(age) > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Patient registration</Text>
      <TextInput style={styles.input} placeholder="Patient name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Age" keyboardType="number-pad" value={age} onChangeText={setAge} />
      <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} />
      <TextInput style={styles.input} placeholder="Known conditions" value={conditions} onChangeText={setConditions} />
      <Button
        title="Register and Continue"
        disabled={!canSubmit}
        onPress={() => onSubmit({
          name,
          age_years: Number(age),
          gender,
          known_conditions: conditions.split(',').map((item) => item.trim()).filter(Boolean)
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 12,
    padding: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: '700'
  },
  input: {
    borderColor: '#b7c9c4',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  }
});
