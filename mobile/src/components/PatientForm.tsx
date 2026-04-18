import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';

export function PatientForm({ onSubmit }: { onSubmit: (patient: any) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  return (
    <View>
      <TextInput placeholder="Patient name" value={name} onChangeText={setName} />
      <TextInput placeholder="Age" keyboardType="number-pad" value={age} onChangeText={setAge} />
      <Button title="Register Patient" onPress={() => onSubmit({ name, age_years: Number(age), gender: 'unknown' })} />
    </View>
  );
}
