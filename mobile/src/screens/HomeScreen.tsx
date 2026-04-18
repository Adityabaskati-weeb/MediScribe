import React from 'react';
import { Button, Text, View } from 'react-native';
import type { ScreenName } from '../App';

export function HomeScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
  return (
    <View>
      <Text>MediScribe rural clinic assistant</Text>
      <Button title="New Patient" onPress={() => onNavigate('newPatient')} />
      <Button title="Start Diagnosis" onPress={() => onNavigate('diagnosis')} />
      <Button title="History" onPress={() => onNavigate('history')} />
    </View>
  );
}
