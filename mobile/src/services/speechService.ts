export interface SpeechResult {
  text: string;
  language: string;
  confidence: number;
}

export async function startSpeechRecognition(language = 'en-IN'): Promise<SpeechResult> {
  const text = await captureSymptomTranscript(language);
  return { text, language, confidence: 0.9 };
}

export async function captureSymptomTranscript(language = 'en-IN'): Promise<string> {
  return `Patient reports fever and cough. BP 120/80 HR 90 temp 38.2. Language ${language}.`;
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
