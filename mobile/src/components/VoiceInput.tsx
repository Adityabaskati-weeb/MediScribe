import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { getSpeechSupportMessage, isNativeSpeechAvailable, startSpeechRecognition } from '../services/speechService';
import { speechLocaleForLanguage, t } from '../utils/i18n';

export function VoiceInput({ language, onTranscript }: { language: string; onTranscript: (text: string) => void }) {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState(t(language, 'useDemoOrType'));
  const [loading, setLoading] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);

  useEffect(() => {
    setStatus(t(language, 'useDemoOrType'));
  }, [language]);

  useEffect(() => {
    isNativeSpeechAvailable()
      .then(setNativeAvailable)
      .catch(() => setNativeAvailable(false));
  }, []);

  const capture = async () => {
    setLoading(true);
    setStatus(nativeAvailable ? t(language, 'listening') : t(language, 'demoDictation'));
    try {
      const result = await startSpeechRecognition(speechLocaleForLanguage(language));
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
          <Text style={styles.heading}>{t(language, 'dictateSymptoms')}</Text>
        </View>
        <View style={[styles.pill, nativeAvailable ? styles.nativePill : styles.demoPill]}>
          <Text style={[styles.pillText, nativeAvailable ? styles.nativePillText : styles.demoPillText]}>
            {nativeAvailable ? t(language, 'nativeMic') : t(language, 'demoMode')}
          </Text>
        </View>
      </View>
      <Text style={styles.help}>{status}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={capture}
        style={({ pressed }) => [styles.micButton, pressed && styles.micPressed, loading && styles.micDisabled]}
      >
        <Text style={styles.micIcon}>Voice</Text>
        <Text style={styles.micLabel}>{nativeAvailable ? t(language, 'startSpeaking') : t(language, 'demoVoice')}</Text>
        <Text style={styles.micHint}>Ready offline</Text>
      </Pressable>
      <View style={styles.waveform}>
        {[18, 32, 48, 28, 56, 36, 22].map((height, index) => (
          <View style={[styles.waveBar, { height }]} key={`${height}-${index}`} />
        ))}
      </View>
      {loading && <ActivityIndicator />}
      <Text style={styles.transcriptLabel}>Structured note</Text>
      <TextInput
        multiline
        numberOfLines={4}
        placeholder={t(language, 'transcriptPlaceholder')}
        placeholderTextColor={colors.quiet}
        style={styles.input}
        value={transcript}
        onChangeText={setTranscript}
      />
      <ActionButton title={t(language, 'analyzeTyped')} onPress={submit} disabled={!transcript.trim() || loading} variant="secondary" />
      <Text style={styles.note}>{t(language, 'speechSupport')}</Text>
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
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    padding: 12
  },
  micButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryDark,
    borderColor: colors.secondary,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
    height: 168,
    justifyContent: 'center',
    width: '100%'
  },
  micPressed: {
    opacity: 0.86
  },
  micDisabled: {
    opacity: 0.5
  },
  micIcon: {
    color: '#d8f7ed',
    fontSize: 13,
    fontWeight: '900'
  },
  micLabel: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center'
  },
  micHint: {
    color: '#b9dfe8',
    fontSize: 12,
    fontWeight: '800'
  },
  waveform: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 64
  },
  waveBar: {
    backgroundColor: colors.secondary,
    borderRadius: 6,
    width: 10
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 90,
    padding: 12,
    textAlignVertical: 'top'
  },
  transcriptLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  }
});
