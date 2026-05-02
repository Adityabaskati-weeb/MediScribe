import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { captureMedicalChartImage, parseExtractedMedicalData } from '../services/ocrService';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { ChartCaptureMode } from '../types/clinical';

type ChartCapturePayload = {
  text: string;
  imageUri?: string;
  mode: ChartCaptureMode;
  confidence?: number;
};

export function ChartOCR({ onCapture }: { onCapture: (payload: ChartCapturePayload) => void }) {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [chartText, setChartText] = useState('');
  const [status, setStatus] = useState('Capture a chart photo, then confirm the extracted text before diagnosis.');
  const [captureMode, setCaptureMode] = useState<ChartCaptureMode>('manual-confirmation');
  const [confidence, setConfidence] = useState<number | undefined>();
  const { theme } = useAppTheme();
  const c = theme.colors;

  const scan = async (source: 'camera' | 'library') => {
    setStatus(source === 'camera' ? 'Opening camera...' : 'Opening gallery...');
    try {
      const result = await captureMedicalChartImage(source);
      setImageUri(result.imageUri);
      setChartText(result.extractedText || '');
      setCaptureMode(result.mode);
      setConfidence(result.confidence || undefined);
      setStatus(result.note);
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
    setStatus('Chart text parsed and added to triage. The image stays attached to this visit.');
    onCapture({
      text: summary,
      imageUri,
      mode: captureMode,
      confidence
    });
  };

  const useSampleChart = () => {
    const text = 'Complaint: fever and cough. BP 120/80 HR 90 SpO2 96 temp 38.2. Meds: paracetamol.';
    setChartText(text);
    setCaptureMode('sample-chart');
    setConfidence(1);
    setStatus('Sample chart loaded. Tap Analyze Chart Text to continue.');
  };

  return (
    <Card>
      <Text style={[styles.eyebrow, { color: c.primary }]}>Chart Scan Assist</Text>
      <Text style={[styles.heading, { color: c.ink }]}>Scan vitals and clinic notes</Text>
      <View style={[styles.statusBox, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
        <Text style={[styles.copy, { color: c.ink }]}>{status}</Text>
      </View>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      {(captureMode || confidence) ? (
        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: captureMode === 'vision-assist' ? c.successSoft : c.warningSoft }]}>
            <Text style={[styles.metaText, { color: captureMode === 'vision-assist' ? c.success : c.warning }]}>
              {captureMode === 'vision-assist' ? 'AI extract ready' : captureMode === 'sample-chart' ? 'Sample chart' : 'Manual confirmation'}
            </Text>
          </View>
          {typeof confidence === 'number' ? (
            <View style={[styles.metaPill, { backgroundColor: c.infoSoft }]}>
              <Text style={[styles.metaText, { color: c.primaryDark }]}>Confidence {Math.round(confidence * 100)}%</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.actions}>
        <ActionButton title="Open Camera" variant="secondary" onPress={() => scan('camera')} />
        <ActionButton title="Choose Photo" variant="secondary" onPress={() => scan('library')} />
        <ActionButton title="Use Sample Chart" variant="secondary" onPress={useSampleChart} />
      </View>
      <TextInput
        multiline
        numberOfLines={5}
        placeholder="Example: Complaint: fever and cough. BP 120/80 HR 90 SpO2 96 temp 38.2. Meds: paracetamol."
        placeholderTextColor={c.quiet}
        style={[styles.input, { backgroundColor: c.surfaceSoft, borderColor: c.border, color: c.ink }]}
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  metaPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  metaText: {
    fontSize: 12,
    fontWeight: '800'
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
