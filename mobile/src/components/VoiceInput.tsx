import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { getSpeechSupportMessage, isNativeSpeechAvailable, startSpeechRecognition } from '../services/speechService';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Use demo voice capture or type the dictated symptoms.');
  const [loading, setLoading] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);

  useEffect(() => {
    isNativeSpeechAvailable()
      .then(setNativeAvailable)
      .catch(() => setNativeAvailable(false));
  }, []);

  const capture = async () => {
    setLoading(true);
    setStatus(nativeAvailable ? 'Listening with native speech...' : 'Using Expo Go demo dictation...');
    try {
      const result = await startSpeechRecognition();
      setTranscript(result.text);
      setStatus(`${result.note || `Captured with ${Math.round(result.confidence * 100)}% confidence.`} Sending to triage...`);
      onTranscript(result.text);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : getSpeechSupportMessage());
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    const clean = transcript.trim();
    if (clean) onTranscript(clean);
  };

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Voice intake</Text>
          <Text style={styles.heading}>Dictate symptoms</Text>
        </View>
        <View style={[styles.pill, nativeAvailable ? styles.nativePill : styles.demoPill]}>
          <Text style={[styles.pillText, nativeAvailable ? styles.nativePillText : styles.demoPillText]}>
            {nativeAvailable ? 'Native mic' : 'Demo mode'}
          </Text>
        </View>
      </View>
      <Text style={styles.help}>{status}</Text>
      <ActionButton title={nativeAvailable ? 'Start Microphone Capture' : 'Use Demo Voice Dictation'} onPress={capture} disabled={loading} />
      {loading && <ActivityIndicator />}
      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Dictated transcript appears here. You can edit it before analysis."
        style={styles.input}
        value={transcript}
        onChangeText={setTranscript}
      />
      <ActionButton title="Analyze Typed Transcript" onPress={submit} disabled={!transcript.trim() || loading} variant="secondary" />
      <Text style={styles.note}>{getSpeechSupportMessage()}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
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
  pill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  nativePill: {
    backgroundColor: '#e7f7f0'
  },
  demoPill: {
    backgroundColor: '#fff7ed'
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  nativePillText: {
    color: colors.success
  },
  demoPillText: {
    color: colors.warning
  },
  help: {
    color: colors.muted,
    lineHeight: 20
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 90,
    padding: 12,
    textAlignVertical: 'top'
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  }
});
