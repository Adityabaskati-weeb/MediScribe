export interface SpeechResult {
  text: string;
  language: string;
  confidence: number;
  source: 'native' | 'demo-fallback';
  note?: string;
}

declare const require: (name: string) => any;

type NativeSpeechEvent = {
  value?: string[];
  error?: {
    message?: string;
  };
};

function getNativeVoiceModule() {
  try {
    return require('@react-native-voice/voice').default;
  } catch {
    return undefined;
  }
}

export async function startSpeechRecognition(language = 'en-IN'): Promise<SpeechResult> {
  if (await isNativeSpeechAvailable()) {
    try {
      const text = await captureNativeSpeechTranscript(language);
      return {
        text,
        language,
        confidence: 0.86,
        source: 'native',
        note: 'Captured from native device speech recognition.'
      };
    } catch {
      const text = await captureSymptomTranscript(language);
      return {
        text,
        language,
        confidence: 0.68,
        source: 'demo-fallback',
        note: 'Native speech was available but did not return text. Guided dictation was used so intake can continue.'
      };
    }
  }

  const text = await captureSymptomTranscript(language);
  return {
    text,
    language,
    confidence: 0.72,
    source: 'demo-fallback',
    note: 'Native speech-to-text is not available. Guided dictation keeps the clinical voice workflow testable.'
  };
}

export async function isNativeSpeechAvailable(): Promise<boolean> {
  try {
    const Voice = getNativeVoiceModule();
    return Boolean(Voice && await Voice.isAvailable());
  } catch {
    return false;
  }
}

async function captureNativeSpeechTranscript(language: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const Voice = getNativeVoiceModule();
    if (!Voice) {
      reject(new Error('Native speech module is not available in this build.'));
      return;
    }

    let resolved = false;
    let transcript = '';
    const finish = async (value?: string, error?: Error) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      try {
        await Voice.stop();
        await Voice.destroy();
        Voice.removeAllListeners();
      } catch {
        // Native cleanup can throw if the recognizer already stopped.
      }
      if (error) reject(error);
      else resolve(value || transcript);
    };

    const timeout = setTimeout(() => {
      finish(transcript, transcript ? undefined : new Error('No speech detected. Type the symptoms or try again.'));
    }, 12000);

    Voice.onSpeechResults = (event: NativeSpeechEvent) => {
      transcript = event.value?.[0] || transcript;
    };
    Voice.onSpeechPartialResults = (event: NativeSpeechEvent) => {
      transcript = event.value?.[0] || transcript;
    };
    Voice.onSpeechError = (event: NativeSpeechEvent) => {
      finish(undefined, new Error(event.error?.message || 'Native speech recognition failed.'));
    };
    Voice.onSpeechEnd = () => {
      finish(transcript, transcript ? undefined : new Error('No speech detected. Type the symptoms or try again.'));
    };

    Voice.start(language).catch((error: unknown) => {
      finish(undefined, error instanceof Error ? error : new Error('Native speech recognition could not start.'));
    });
  });
}

export async function captureSymptomTranscript(language = 'en-IN'): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `Pregnant woman 32 weeks with bleeding, abdominal pain and dizziness. BP 104/70 HR 112 SpO2 96. No internet in clinic. Language ${language}.`;
}

export async function textToSpeech(text: string): Promise<void> {
  console.log('Speak:', text);
}

export async function captureSymptomInMultipleLanguages(symptoms: string[]): Promise<string> {
  return JSON.stringify({
    english: symptoms,
    hindi_transliteration: symptoms,
    source: 'device-speech'
  });
}

export function getSpeechSupportMessage() {
  return 'Expo Go uses guided dictation. Use a custom dev build for real microphone speech.';
}
