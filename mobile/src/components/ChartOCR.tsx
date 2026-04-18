import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { captureAndOCRMedicalChart, parseExtractedMedicalData } from '../services/ocrService';
import { colors } from '../styles/theme';

export function ChartOCR({ onText }: { onText: (text: string) => void }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>Chart OCR</Text>
      <Text style={styles.heading}>Scan vitals and notes</Text>
      <Text style={styles.copy}>Use chart text as another clinical signal for offline triage.</Text>
      <ActionButton
        title="Scan Chart"
        variant="secondary"
        onPress={async () => {
          const text = await captureAndOCRMedicalChart();
          await parseExtractedMedicalData(text);
          onText(text);
        }}
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
    fontWeight: '800'
  },
  copy: {
    color: colors.muted,
    lineHeight: 20
  }
});
