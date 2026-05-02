import axios from 'axios';

const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b';

export interface ChartVisionExtraction {
  extracted_text: string;
  confidence: number;
  note: string;
  mode: 'vision-assist' | 'manual-confirmation';
}

export async function extractChartVisionText(imageBase64: string): Promise<ChartVisionExtraction> {
  try {
    const response = await axios.post(`${OLLAMA_API}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: [
        'You are extracting text from a rural clinic chart image.',
        'Read only what is visible. Do not guess missing values.',
        'Return compact JSON with keys: extracted_text, confidence, note.',
        'Keep extracted_text plain and preserve numbers, medicine names, and abbreviations.'
      ].join(' '),
      images: [stripDataUrlPrefix(imageBase64)],
      stream: false,
      options: { temperature: 0.05, top_p: 0.9, top_k: 40, num_predict: 450 }
    }, { timeout: 20000 });

    return normalizeVisionResponse(response.data?.response);
  } catch {
    return {
      extracted_text: '',
      confidence: 0,
      note: 'Vision assist unavailable. Keep the chart photo and confirm the visible text manually.',
      mode: 'manual-confirmation'
    };
  }
}

function stripDataUrlPrefix(imageBase64: string) {
  return imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
}

function normalizeVisionResponse(raw: unknown): ChartVisionExtraction {
  const fallback: ChartVisionExtraction = {
    extracted_text: '',
    confidence: 0,
    note: 'Vision assist ran, but text still needs manual confirmation.',
    mode: 'manual-confirmation'
  };

  if (typeof raw !== 'string' || !raw.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    const extractedText = typeof parsed.extracted_text === 'string'
      ? parsed.extracted_text.trim()
      : typeof parsed.text === 'string'
        ? parsed.text.trim()
        : '';
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : extractedText ? 0.62 : 0;
    const note = typeof parsed.note === 'string' && parsed.note.trim()
      ? parsed.note.trim()
      : extractedText
        ? 'AI-assisted chart extraction complete. Please confirm the text before diagnosis.'
        : fallback.note;

    return {
      extracted_text: extractedText,
      confidence,
      note,
      mode: extractedText ? 'vision-assist' : 'manual-confirmation'
    };
  } catch {
    const extractedText = raw.trim();
    return {
      extracted_text: extractedText,
      confidence: extractedText ? 0.55 : 0,
      note: extractedText
        ? 'AI-assisted chart extraction returned plain text. Please confirm it before diagnosis.'
        : fallback.note,
      mode: extractedText ? 'vision-assist' : 'manual-confirmation'
    };
  }
}
