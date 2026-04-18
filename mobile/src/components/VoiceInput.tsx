import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { getSpeechSupportMessage, startSpeechRecognition } from '../services/speechService';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Use demo voice capture or type the dictated symptoms.');
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    setStatus('Listening...');
    try {
      const result = await startSpeechRecognition();
      setTranscript(result.text);
      setStatus(result.note || `Captured with ${Math.round(result.confidence * 100)}% confidence.`);
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
    <View style={styles.card}>
      <Text style={styles.heading}>Voice symptoms</Text>
      <Text style={styles.help}>{status}</Text>
      <Button title="Capture Symptoms by Voice" onPress={capture} disabled={loading} />
      {loading && <ActivityIndicator />}
      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Dictated transcript appears here. You can edit it before analysis."
        style={styles.input}
        value={transcript}
        onChangeText={setTranscript}
      />
      <Button title="Analyze Voice Transcript" onPress={submit} disabled={!transcript.trim() || loading} />
      <Text style={styles.note}>{getSpeechSupportMessage()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 10,
    padding: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: '800'
  },
  help: {
    color: '#42645b'
  },
  input: {
    borderColor: '#b7c9c4',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 90,
    padding: 12,
    textAlignVertical: 'top'
  },
  note: {
    color: '#5f6f68',
    fontSize: 12,
    lineHeight: 17
  }
});
