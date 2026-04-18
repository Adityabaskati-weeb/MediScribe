import React from 'react';
import { Button, View } from 'react-native';
import { startSpeechRecognition } from '../services/speechService';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  return (
    <View>
      <Button title="Capture Symptoms by Voice" onPress={async () => onTranscript((await startSpeechRecognition()).text)} />
    </View>
  );
}
