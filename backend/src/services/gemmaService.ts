import axios from 'axios';

const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';

export interface MedicalPrompt {
  patientAge: number;
  gender: 'M' | 'F' | 'O' | 'unknown';
  symptoms: string[];
  vitals?: Record<string, unknown>;
  medicalHistory?: string[];
  medications?: string[];
}

export async function getGemmaResponse(prompt: string, systemPrompt: string): Promise<string> {
  const response = await axios.post(`${OLLAMA_API}/api/generate`, {
    model: OLLAMA_MODEL,
    prompt,
    system: systemPrompt,
    stream: false
  });
  return response.data.response;
}
