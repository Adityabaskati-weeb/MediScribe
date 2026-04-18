export async function captureSymptomTranscript(language = 'en-IN'): Promise<string> {
  return `Patient reports fever and cough. BP 120/80 HR 90 temp 38.2. Language ${language}.`;
}

export async function textToSpeech(text: string): Promise<void> {
  console.log('Speak:', text);
}
