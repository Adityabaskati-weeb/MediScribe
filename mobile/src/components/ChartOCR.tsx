import React from 'react';
import { Button } from 'react-native';
import { captureAndOCRMedicalChart, parseExtractedMedicalData } from '../services/ocrService';

export function ChartOCR({ onText }: { onText: (text: string) => void }) {
  return <Button title="Scan Chart" onPress={async () => {
    const text = await captureAndOCRMedicalChart();
    await parseExtractedMedicalData(text);
    onText(text);
  }} />;
}
