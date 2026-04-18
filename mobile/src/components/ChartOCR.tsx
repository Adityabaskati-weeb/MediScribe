import React from 'react';
import { Button } from 'react-native';
import { captureAndOCRMedicalChart } from '../services/ocrService';

export function ChartOCR({ onText }: { onText: (text: string) => void }) {
  return <Button title="Scan Chart" onPress={async () => onText(await captureAndOCRMedicalChart())} />;
}
