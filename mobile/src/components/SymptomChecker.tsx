import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export function SymptomChecker({ onAnalyze }: { onAnalyze: (symptoms: string) => void }) {
  const [symptoms, setSymptoms] = useState('');
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Symptom intake</Text>
      <TextInput
        multiline
        numberOfLines={5}
        placeholder="Example: fever, cough, BP 120/80, HR 90, temp 38.2"
        style={styles.input}
        value={symptoms}
        onChangeText={setSymptoms}
      />
      <Button title="Analyze Symptoms" disabled={!symptoms.trim()} onPress={() => onAnalyze(symptoms)} />
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
    minHeight: 110,
    padding: 12,
    textAlignVertical: 'top'
  }
});
