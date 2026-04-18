export type ExtractedVitals = {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  temperature_c?: number;
};

export function extractClinicalVitals(text: string): ExtractedVitals {
  const bp = text.match(/bp\s*[:\-]?\s*(\d{2,3})\s*\/\s*(\d{2,3})/i);
  return {
    ...(bp ? { systolic_bp: Number(bp[1]), diastolic_bp: Number(bp[2]) } : {}),
    ...numberMatch(text, 'heart_rate', /\b(?:hr|heart rate|pulse)\s*[:\-]?\s*(\d{2,3})\b/i),
    ...numberMatch(text, 'oxygen_saturation', /\b(?:spo2|oxygen|o2 sat)\s*[:\-]?\s*(\d{2,3})\s*%?\b/i),
    ...numberMatch(text, 'respiratory_rate', /\b(?:rr|respiratory rate)\s*[:\-]?\s*(\d{1,2})\b/i),
    ...numberMatch(text, 'temperature_c', /\b(?:temp|temperature)\s*[:\-]?\s*(\d{2}(?:\.\d)?)\b/i)
  };
}

export function extractClinicalSymptoms(text: string) {
  const known = [
    'fever',
    'cough',
    'chest pain',
    'shortness of breath',
    'headache',
    'vomiting',
    'rash',
    'weakness',
    'abdominal pain',
    'bleeding',
    'left arm pain',
    'dizziness'
  ];
  const found = known.filter((item) => text.toLowerCase().includes(item));
  return found.length ? found : [text.slice(0, 160)];
}

function numberMatch(text: string, key: string, pattern: RegExp) {
  const value = text.match(pattern)?.[1];
  return value ? { [key]: Number(value) } : {};
}
