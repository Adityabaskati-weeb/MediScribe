import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { getSpeechSupportMessage, isNativeSpeechAvailable, startSpeechRecognition } from '../services/speechService';
import { speechLocaleForLanguage, t } from '../utils/i18n';

export function VoiceInput({ language, onTranscript }: { language: string; onTranscript: (text: string) => void }) {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState(t(language, 'useDemoOrType'));
  const [loading, setLoading] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const pulse = React.useRef(new Animated.Value(0)).current;
  const { theme } = useAppTheme();
  const c = theme.colors;

  useEffect(() => {
    setStatus(t(language, 'useDemoOrType'));
  }, [language]);

  useEffect(() => {
    isNativeSpeechAvailable()
      .then(setNativeAvailable)
      .catch(() => setNativeAvailable(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 650, useNativeDriver: true })
      ])
    ).start();
  }, [loading, pulse]);

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
        <View style={styles.headerText}>
          <Text style={[styles.eyebrow, { color: c.primary }]}>Voice intake</Text>
          <Text style={[styles.heading, { color: c.ink }]}>{t(language, 'dictateSymptoms')}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: nativeAvailable ? c.successSoft : c.warningSoft }]}>
          <Text style={[styles.pillText, { color: nativeAvailable ? c.success : c.warning }]}>
            {nativeAvailable ? t(language, 'nativeMic') : t(language, 'demoMode')}
          </Text>
        </View>
      </View>

      <View style={[styles.statusPanel, { backgroundColor: loading ? c.successSoft : c.surfaceMuted, borderColor: loading ? c.success : c.border }]}>
        <Text style={[styles.statusLabel, { color: c.muted }]}>Live capture state</Text>
        <Text style={[styles.help, { color: c.ink }]}>{status}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={capture}
        style={({ pressed }) => [
          styles.micButton,
          { backgroundColor: loading ? c.secondary : theme.mode === 'dark' ? '#114653' : c.primaryDark, borderColor: loading ? c.success : c.secondary },
          pressed && styles.micPressed,
          loading && styles.micDisabled
        ]}
      >
        <Animated.View
          style={[
            styles.pulseHalo,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) }]
            }
          ]}
        />
        <View style={styles.ringOuter}>
          <View style={styles.ringMiddle}>
            <View style={[styles.ringCore, { backgroundColor: c.secondary }]}>
              <Text style={styles.ringText}>{loading ? 'LIVE' : 'MIC'}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.micLabel}>{nativeAvailable ? t(language, 'startSpeaking') : t(language, 'demoVoice')}</Text>
        <Text style={styles.micHint}>Offline first - {language} - tap to capture</Text>
      </Pressable>

      <View style={styles.waveform}>
        {[18, 32, 48, 28, 56, 36, 22, 42, 26].map((height, index) => (
          <View style={[styles.waveBar, { height, backgroundColor: index % 2 ? c.primary : c.secondary }]} key={`${height}-${index}`} />
        ))}
      </View>
      {loading && <ActivityIndicator color={c.primary} />}

      <View style={styles.transcriptHeader}>
        <Text style={[styles.transcriptLabel, { color: c.muted }]}>Structured note</Text>
        <Text style={[styles.transcriptMeta, { color: c.quiet }]}>Manual backup always works</Text>
      </View>
      <TextInput
        multiline
        numberOfLines={4}
        placeholder={t(language, 'transcriptPlaceholder')}
        placeholderTextColor={c.quiet}
        style={[styles.input, { backgroundColor: c.surfaceSoft, borderColor: c.border, color: c.ink }]}
        value={transcript}
        onChangeText={setTranscript}
      />
      <ActionButton title={t(language, 'analyzeTyped')} onPress={submit} disabled={!transcript.trim() || loading} variant="secondary" />
      <Text style={[styles.note, { color: c.muted }]}>{t(language, 'speechSupport')}</Text>
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
  headerText: {
    flex: 1,
    gap: 3
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25
  },
  pill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  pillText: {
    fontSize: 11,
    fontWeight: '900'
  },
  statusPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 12
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  help: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  },
  micButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 2,
    gap: 10,
    minHeight: 220,
    justifyContent: 'center',
    padding: 18,
    position: 'relative',
    width: '100%'
  },
  micPressed: {
    opacity: 0.86
  },
  micDisabled: {
    opacity: 0.5
  },
  ringOuter: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    height: 104,
    justifyContent: 'center',
    width: 104
  },
  pulseHalo: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    height: 122,
    position: 'absolute',
    top: 26,
    width: 122
  },
  ringMiddle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    height: 82,
    justifyContent: 'center',
    width: 82
  },
  ringCore: {
    alignItems: 'center',
    borderRadius: 8,
    height: 62,
    justifyContent: 'center',
    width: 62
  },
  ringText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900'
  },
  micLabel: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center'
  },
  micHint: {
    color: '#d7eee8',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center'
  },
  waveform: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 66
  },
  waveBar: {
    borderRadius: 6,
    width: 9
  },
  transcriptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  transcriptMeta: {
    fontSize: 11,
    fontWeight: '800'
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 98,
    padding: 12,
    textAlignVertical: 'top'
  },
  note: {
    fontSize: 12,
    lineHeight: 17
  }
});
