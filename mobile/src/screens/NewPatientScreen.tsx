import React from 'react';
import { Button, ScrollView, StyleSheet, Text } from 'react-native';
import type { ScreenName } from '../App';
import { PatientForm } from '../components/PatientForm';
import { createPatient } from '../services/databaseService';

export function NewPatientScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Back" onPress={() => onNavigate('home')} />
      <Text style={styles.title}>Register patient</Text>
      <PatientForm onSubmit={(patient) => {
        createPatient(patient);
        onNavigate('diagnosis');
      }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '800'
  }
});
