import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../App';

export function HomeScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>MediScribe</Text>
      <Text style={styles.title}>Rural clinic assistant</Text>
      <Text style={styles.copy}>
        Capture patient details, symptoms, voice notes, and chart text offline. Sync when the clinic is online.
      </Text>

      <View style={styles.actions}>
        <Button title="Register Patient" onPress={() => onNavigate('newPatient')} />
        <Button title="Start Diagnosis" onPress={() => onNavigate('diagnosis')} />
        <Button title="View History" onPress={() => onNavigate('history')} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Demo flow</Text>
        <Text>1. Register a patient.</Text>
        <Text>2. Capture symptoms by voice, OCR, or form.</Text>
        <Text>3. Review urgency, red flags, treatment, and referral.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 24
  },
  kicker: {
    color: '#11735f',
    fontWeight: '700'
  },
  title: {
    color: '#10201c',
    fontSize: 30,
    fontWeight: '800'
  },
  copy: {
    color: '#31443f',
    fontSize: 16,
    lineHeight: 23
  },
  actions: {
    gap: 10
  },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 8,
    padding: 16
  },
  panelTitle: {
    fontWeight: '700'
  }
});
