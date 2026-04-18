import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';

export function SymptomChecker({ onAnalyze }: { onAnalyze: (symptoms: string) => void }) {
  const [symptoms, setSymptoms] = useState('');
  return (
    <View>
      <TextInput placeholder="Symptoms" value={symptoms} onChangeText={setSymptoms} />
      <Button title="Analyze" onPress={() => onAnalyze(symptoms)} />
    </View>
  );
}
