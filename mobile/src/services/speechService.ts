export interface SpeechResult {
  text: string;
  language: string;
  confidence: number;
  source: 'native' | 'demo-fallback';
  note?: string;
}

export async function startSpeechRecognition(language = 'en-IN'): Promise<SpeechResult> {
  const text = await captureSymptomTranscript(language);
  return {
    text,
    language,
    confidence: 0.72,
    source: 'demo-fallback',
    note: 'Browser preview uses demo dictation. Install the native dev build for real microphone speech.'
  };
}

export async function isNativeSpeechAvailable(): Promise<boolean> {
  return false;
}

export async function captureSymptomTranscript(language = 'en-IN'): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));
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
    source: 'web-demo-speech'
  });
}

export function getSpeechSupportMessage() {
  return 'Browser and Expo Go use demo dictation. Use the custom native build for real microphone speech recognition.';
}
