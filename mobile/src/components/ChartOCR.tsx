import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { captureMedicalChartImage, parseExtractedMedicalData } from '../services/ocrService';
import { colors } from '../styles/theme';

export function ChartOCR({ onText }: { onText: (text: string) => void }) {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [chartText, setChartText] = useState('');
  const [status, setStatus] = useState('Capture a chart photo, then confirm the extracted text.');

  const scan = async (source: 'camera' | 'library') => {
    setStatus(source === 'camera' ? 'Opening camera...' : 'Opening gallery...');
    try {
      const result = await captureMedicalChartImage(source);
      setImageUri(result.imageUri);
      setStatus('Chart image captured. Enter visible chart text or paste OCR text.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to scan chart.');
    }
  };

  const submit = async () => {
    const text = chartText.trim();
    if (!text) {
      setStatus('Add chart text first: complaint, vitals, diagnosis, or medications.');
      return;
    }
    const parsed = await parseExtractedMedicalData(text);
    const summary = [
      text,
      Object.keys(parsed.vitals).length ? `Parsed vitals: ${JSON.stringify(parsed.vitals)}` : '',
      parsed.symptoms.length ? `Parsed symptoms: ${parsed.symptoms.join(', ')}` : '',
      parsed.medications.length ? `Medications: ${parsed.medications.join(', ')}` : ''
    ].filter(Boolean).join('\n');
    setStatus('Chart text parsed and added to triage.');
    onText(summary);
  };

  const useDemoChart = () => {
    const text = 'Complaint: fever and cough. BP 120/80 HR 90 SpO2 96 temp 38.2. Meds: paracetamol.';
    setChartText(text);
    setStatus('Demo chart loaded. Tap Analyze Chart Text to continue.');
  };

  return (
    <Card>
      <Text style={styles.eyebrow}>Chart OCR</Text>
      <Text style={styles.heading}>Scan vitals and notes</Text>
      <View style={styles.statusBox}>
        <Text style={styles.copy}>{status}</Text>
      </View>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      <View style={styles.actions}>
        <ActionButton title="Open Camera" variant="secondary" onPress={() => scan('camera')} />
        <ActionButton title="Choose Photo" variant="secondary" onPress={() => scan('library')} />
        <ActionButton title="Use Demo Chart" variant="secondary" onPress={useDemoChart} />
      </View>
      <TextInput
        multiline
        numberOfLines={5}
        placeholder="Example: Complaint: fever and cough. BP 120/80 HR 90 SpO2 96 temp 38.2. Meds: paracetamol."
        placeholderTextColor={colors.quiet}
        style={styles.input}
        value={chartText}
        onChangeText={setChartText}
      />
      <ActionButton
        title="Analyze Chart Text"
        onPress={submit}
        disabled={!chartText.trim()}
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
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21
  },
  statusBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  actions: {
    gap: 8
  },
  preview: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 180,
    width: '100%'
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 110,
    padding: 12,
    textAlignVertical: 'top'
  }
});
