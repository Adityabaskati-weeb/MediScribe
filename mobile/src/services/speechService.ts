export interface SpeechResult {
  text: string;
  language: string;
  confidence: number;
  source: 'web-speech' | 'demo-fallback';
  note?: string;
}

export async function startSpeechRecognition(language = 'en-IN'): Promise<SpeechResult> {
  const text = await captureSymptomTranscript(language);
  return {
    text,
    language,
    confidence: 0.72,
    source: 'demo-fallback',
    note: 'Expo Go does not include native speech-to-text. This demo transcript keeps the clinical voice workflow testable.'
  };
}

export async function captureSymptomTranscript(language = 'en-IN'): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `Patient reports fever and cough. BP 120/80 HR 90 temp 38.2. Language ${language}.`;
}

export async function textToSpeech(text: string): Promise<void> {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    return;
  }
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
  return 'For real microphone speech-to-text on Android, create a custom development build with a native speech module. Expo Go uses the demo transcript/manual dictation fallback.';
}
