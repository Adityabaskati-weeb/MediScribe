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

export interface GemmaMedicalAssessment {
  primaryDiagnosis: string;
  alternativeDiagnoses: string[];
  confidenceScores: number[];
  clinicalReasoning: string;
  recommendedDiagnosticTests: string[];
  suggestedTreatment: {
    medications: Array<{ name: string; dosage: string; frequency: string; duration: string; availability: 'common' | 'specialty' | 'rare' }>;
    nonPharmacological: string[];
    followUpInDays: number;
  };
  warningFlags: string[];
  referralRecommendation: boolean;
  referralSpecialty?: string;
}

export async function getGemmaResponse(prompt: string, systemPrompt: string): Promise<string> {
  const response = await axios.post(`${OLLAMA_API}/api/generate`, {
    model: OLLAMA_MODEL,
    prompt,
    system: systemPrompt,
    stream: false,
    options: { temperature: 0.1, num_predict: 700 }
  });
  return response.data.response;
}

export async function analyzeMedicalCase(medicalData: MedicalPrompt): Promise<GemmaMedicalAssessment> {
  const systemPrompt = `You are Dr. Priya, an experienced rural health specialist.
Use WHO-style low-resource guidance, flag dangerous conditions, recommend practical tests,
and return valid JSON for rural health workers.`;

  const prompt = buildDetailedPatientPrompt(medicalData);
  const response = await getGemmaResponse(prompt, systemPrompt);
  return validateGemmaAssessment(parseResponse(response));
}

export async function translateSymptoms(symptoms: string, language: string): Promise<string> {
  return getGemmaResponse(
    `Translate these medical symptoms from ${language} to English while preserving clinical terminology: "${symptoms}"`,
    'You are a concise medical translator.'
  );
}

function buildDetailedPatientPrompt(data: MedicalPrompt) {
  return `
PATIENT PRESENTATION
Age: ${data.patientAge}
Gender: ${data.gender}
Symptoms: ${(data.symptoms || []).join(', ')}
Vitals: ${JSON.stringify(data.vitals || {})}
Medical history: ${(data.medicalHistory || []).join(', ') || 'None recorded'}
Medications: ${(data.medications || []).join(', ') || 'None recorded'}

Return JSON with primaryDiagnosis, alternativeDiagnoses, confidenceScores,
clinicalReasoning, recommendedDiagnosticTests, suggestedTreatment, warningFlags,
referralRecommendation, and referralSpecialty.
`;
}

function parseResponse(response: string): unknown {
  try {
    return JSON.parse(response);
  } catch {
    return parseUnstructuredResponse(response);
  }
}

function parseUnstructuredResponse(response: string): Partial<GemmaMedicalAssessment> {
  const lines = response.split('\n').map((line) => line.trim()).filter(Boolean);
  return {
    primaryDiagnosis: lines.find((line) => /diagnosis/i.test(line)) || 'Undifferentiated clinical presentation',
    alternativeDiagnoses: lines.filter((line) => /alternative|differential/i.test(line)).slice(0, 2),
    confidenceScores: [0.55, 0.35, 0.25],
    clinicalReasoning: response.slice(0, 800),
    recommendedDiagnosticTests: lines.filter((line) => /test|cbc|ecg|x-ray|malaria|glucose/i.test(line)).slice(0, 4),
    suggestedTreatment: {
      medications: [],
      nonPharmacological: ['Assess danger signs and follow local protocol.'],
      followUpInDays: 2
    },
    warningFlags: lines.filter((line) => /urgent|danger|refer|emergency/i.test(line)).slice(0, 4),
    referralRecommendation: /urgent|refer|emergency/i.test(response)
  };
}

function validateGemmaAssessment(response: any): GemmaMedicalAssessment {
  return {
    primaryDiagnosis: response.primaryDiagnosis || response.primary_diagnosis || 'Undifferentiated clinical presentation',
    alternativeDiagnoses: response.alternativeDiagnoses || response.alternative_diagnoses || [],
    confidenceScores: response.confidenceScores || response.confidence_scores || [0.5],
    clinicalReasoning: response.clinicalReasoning || response.clinical_reasoning || 'Clinical reasoning not supplied by model.',
    recommendedDiagnosticTests: response.recommendedDiagnosticTests || response.recommended_tests || [],
    suggestedTreatment: {
      medications: response.suggestedTreatment?.medications || response.medications || [],
      nonPharmacological: response.suggestedTreatment?.nonPharmacological || response.nonPharmacological || [],
      followUpInDays: response.suggestedTreatment?.followUpInDays || response.followUpDays || 7
    },
    warningFlags: response.warningFlags || response.warning_flags || [],
    referralRecommendation: Boolean(response.referralRecommendation || response.referralRequired),
    referralSpecialty: response.referralSpecialty
  };
}
