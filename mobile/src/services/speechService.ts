export async function captureSymptomTranscript(language = 'en-IN'): Promise<string> {
  return `Speech capture placeholder for ${language}. Connect native recognition during device build.`;
}

export async function textToSpeech(text: string): Promise<void> {
  console.log('Speak:', text);
}
