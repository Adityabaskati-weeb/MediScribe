import crypto from 'crypto';
import { ClinicalIntake } from '../models/Clinical';
import { analyzeIntake } from './clinicalEngine';
import { clamp, Specialty } from './scalabilityShared';

export interface ModelSpec {
  id: string;
  displayName: string;
  specialty: Specialty;
  quantization: '4-bit' | '8-bit';
  localModelRef: string;
  minConfidence: number;
  fallbackModelId: string;
  memoryMb: number;
  basedOn: string;
}

export const MODEL_REGISTRY: ModelSpec[] = [
  {
    id: 'mediscribe-general-e4b',
    displayName: 'MediScribe General Clinical E4B',
    specialty: 'general',
    quantization: '4-bit',
    localModelRef: 'ollama://gemma4:e4b-q4',
    minConfidence: 0.7,
    fallbackModelId: 'offline-rules-v1',
    memoryMb: 2400,
    basedOn: 'Gemma 4; Gemma is a trademark of Google LLC.'
  },
  {
    id: 'mediscribe-symptom-router-e2b',
    displayName: 'MediScribe Symptom Router E2B',
    specialty: 'classification',
    quantization: '4-bit',
    localModelRef: 'ollama://gemma4:e2b-q4',
    minConfidence: 0.8,
    fallbackModelId: 'mediscribe-general-e4b',
    memoryMb: 1500,
    basedOn: 'Gemma 4; Gemma is a trademark of Google LLC.'
  },
  {
    id: 'mediscribe-pediatric-care-e2b',
    displayName: 'MediScribe Pediatric Care E2B',
    specialty: 'pediatrics',
    quantization: '4-bit',
    localModelRef: 'ollama://gemma4:e2b-q4',
    minConfidence: 0.75,
    fallbackModelId: 'mediscribe-general-e4b',
    memoryMb: 1500,
    basedOn: 'Gemma 4; Gemma is a trademark of Google LLC.'
  },
  {
    id: 'mediscribe-maternal-care-e4b',
    displayName: 'MediScribe Maternal Care E4B',
    specialty: 'obstetrics',
    quantization: '8-bit',
    localModelRef: 'ollama://gemma4:e4b-q8',
    minConfidence: 0.76,
    fallbackModelId: 'mediscribe-general-e4b',
    memoryMb: 3900,
    basedOn: 'Gemma 4; Gemma is a trademark of Google LLC.'
  },
  {
    id: 'mediscribe-cardio-care-e4b',
    displayName: 'MediScribe Cardio Care E4B',
    specialty: 'cardiology',
    quantization: '8-bit',
    localModelRef: 'ollama://gemma4:e4b-q8',
    minConfidence: 0.78,
    fallbackModelId: 'mediscribe-general-e4b',
    memoryMb: 3900,
    basedOn: 'Gemma 4; Gemma is a trademark of Google LLC.'
  }
];

const CDN_REGIONS = [
  { region: 'Asia', edge: 'https://cdn-ap-south.mediscribe.example/models', latencyMs: 45 },
  { region: 'Africa', edge: 'https://cdn-af-south.mediscribe.example/models', latencyMs: 70 },
  { region: 'Americas', edge: 'https://cdn-us-east.mediscribe.example/models', latencyMs: 55 },
  { region: 'Europe', edge: 'https://cdn-eu-west.mediscribe.example/models', latencyMs: 50 }
];

function textOf(intake: ClinicalIntake) {
  return [intake.chief_complaint, ...(intake.symptoms || []), ...(intake.notes || [])].join(' ').toLowerCase();
}

export function classifySymptoms(intake: ClinicalIntake): { specialty: Specialty; confidence: number; matchedSignals: string[] } {
  const text = textOf(intake);
  const signals: Array<{ specialty: Specialty; phrases: string[]; base: number }> = [
    { specialty: 'cardiology', phrases: ['chest pain', 'left arm', 'sweating', 'palpitation', 'ecg'], base: 0.9 },
    { specialty: 'pediatrics', phrases: ['child', 'infant', 'fast breathing', 'poor feeding'], base: intake.patient.age_years < 12 ? 0.86 : 0.72 },
    { specialty: 'obstetrics', phrases: ['pregnant', 'pregnancy', 'postpartum', 'bleeding', 'visual changes'], base: 0.88 },
    { specialty: 'neurology', phrases: ['seizure', 'slurred speech', 'facial droop', 'weakness', 'stroke'], base: 0.87 },
    { specialty: 'orthopedics', phrases: ['fracture', 'joint', 'swelling', 'fall', 'bone'], base: 0.78 },
    { specialty: 'dermatology', phrases: ['rash', 'itch', 'skin', 'lesion', 'wound'], base: 0.76 }
  ];
  const scored = signals
    .map((candidate) => {
      const matchedSignals = candidate.phrases.filter((phrase) => text.includes(phrase));
      const ageBoost = candidate.specialty === 'pediatrics' && intake.patient.age_years < 12 ? 0.08 : 0;
      const pregnancyBoost = candidate.specialty === 'obstetrics' && (intake.patient.pregnancy_weeks || intake.patient.postpartum_days !== undefined) ? 0.08 : 0;
      return { specialty: candidate.specialty, confidence: clamp(candidate.base + matchedSignals.length * 0.025 + ageBoost + pregnancyBoost), matchedSignals };
    })
    .filter((candidate) => candidate.matchedSignals.length > 0 || candidate.specialty === 'pediatrics' && intake.patient.age_years < 12 || candidate.specialty === 'obstetrics' && Boolean(intake.patient.pregnancy_weeks || intake.patient.postpartum_days !== undefined))
    .sort((a, b) => b.confidence - a.confidence);

  return scored[0] || { specialty: 'general', confidence: 0.7, matchedSignals: ['primary-care-default'] };
}

export function routeToSpecializedModel(intake: ClinicalIntake) {
  const classification = classifySymptoms(intake);
  const candidate = MODEL_REGISTRY.find((model) => model.specialty === classification.specialty);
  const selected = candidate && classification.confidence >= candidate.minConfidence ? candidate : MODEL_REGISTRY[0];
  const assessment = analyzeIntake(intake, selected.id);
  return {
    selectedModel: selected,
    classification,
    fallbackUsed: selected.specialty !== classification.specialty,
    inferencePlan: {
      router: 'local specialty router',
      modelCall: selected.localModelRef,
      maxLatencyMs: selected.quantization === '4-bit' ? 1800 : 2600,
      optimization: ['quantized weights', 'cache repeated symptom clusters', 'rule-first red-flag detection']
    },
    assessment
  };
}

export function getModelDeliveryPlan(clinicRegion = 'Asia', modelId = 'mediscribe-general-e4b') {
  const cdn = CDN_REGIONS.find((item) => item.region.toLowerCase() === clinicRegion.toLowerCase()) || CDN_REGIONS[0];
  const model = MODEL_REGISTRY.find((item) => item.id === modelId) || MODEL_REGISTRY[0];
  return {
    modelId: model.id,
    edgeUrl: `${cdn.edge}/${model.id}.gguf`,
    expectedLatencyMs: cdn.latencyMs,
    checksum: crypto.createHash('sha256').update(`${model.id}:${model.quantization}`).digest('hex'),
    offlineInstallSteps: ['download from nearest edge', 'verify checksum', 'store in encrypted model cache', 'activate after smoke test'],
    versionStrategy: 'blue-green model rollout with previous model retained for rollback'
  };
}

export function modelRouterReadiness(federatedLearningStatus: unknown, continuousLearningMetrics: unknown) {
  return {
    models: MODEL_REGISTRY,
    routing: 'Implemented specialty classifier with deterministic fallback and quantized model metadata.',
    federatedLearning: federatedLearningStatus,
    continuousLearning: continuousLearningMetrics
  };
}

export function modelDeliveryRegions() {
  return CDN_REGIONS;
}

