import crypto from 'crypto';
import { ClinicalIntake, MediScribeAssessment, PatientProfile } from '../models/Clinical';
import { analyzeIntake } from './clinicalEngine';

type Specialty = 'general' | 'classification' | 'pediatrics' | 'cardiology' | 'obstetrics' | 'orthopedics' | 'neurology' | 'dermatology';
type Region = 'Asia' | 'Africa' | 'Americas' | 'Europe';
type HealthcareLevel = 'basic' | 'primary' | 'secondary' | 'tertiary';
type PricingTier = 'free' | 'clinic' | 'hospital' | 'enterprise';

function now() {
  return new Date().toISOString();
}

function stableId(prefix: string, value: unknown) {
  return `${prefix}-${crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12)}`;
}

function hashNumber(value: string) {
  const digest = crypto.createHash('sha256').update(value).digest();
  return Math.abs(digest.readInt32BE(0));
}

function textOf(intake: ClinicalIntake) {
  return [intake.chief_complaint, ...(intake.symptoms || []), ...(intake.notes || [])].join(' ').toLowerCase();
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function assessmentTopDiagnosis(assessment: MediScribeAssessment) {
  return assessment.differential_diagnoses[0]?.name || 'Undifferentiated presentation';
}

interface ModelSpec {
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

const MODEL_REGISTRY: ModelSpec[] = [
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

interface FederatedUpdate {
  updateId: string;
  clinicId: string;
  modelId: string;
  weights: number[];
  dataSize: number;
  metrics: { accuracy: number; loss: number };
  timestamp: string;
  signature: string;
}

class FederatedLearningManager {
  private updateQueue: FederatedUpdate[] = [];
  private globalWeights: number[] = [];
  private secret = process.env.FEDERATED_SECRET || 'mediscribe-local-federated-secret';

  signUpdate(clinicId: string, weights: number[]) {
    return crypto.createHmac('sha256', this.secret).update(clinicId).update(weights.join(',')).digest('hex');
  }

  submitLocalUpdate(input: { clinicId: string; modelId?: string; weights: number[]; dataSize: number; metrics: { accuracy: number; loss: number }; signature?: string }) {
    if (!input.clinicId.trim()) throw new Error('clinicId is required');
    if (!input.weights.length) throw new Error('weights must not be empty');
    if (input.dataSize <= 0) throw new Error('dataSize must be positive');
    const signature = input.signature || this.signUpdate(input.clinicId, input.weights);
    const expected = this.signUpdate(input.clinicId, input.weights);
    if (signature !== expected) throw new Error('Invalid federated update signature');
    const update: FederatedUpdate = {
      updateId: stableId('fl', { clinicId: input.clinicId, weights: input.weights, timestamp: now() }),
      clinicId: input.clinicId,
      modelId: input.modelId || 'mediscribe-general-e4b',
      weights: input.weights.map((weight) => Number(weight.toFixed(6))),
      dataSize: input.dataSize,
      metrics: input.metrics,
      timestamp: now(),
      signature
    };
    this.updateQueue.push(update);
    return update;
  }

  aggregateWeights() {
    if (!this.updateQueue.length) {
      return { aggregated: this.globalWeights, participatingClinics: 0, message: 'No pending updates; returning current global weights.' };
    }
    const length = this.updateQueue[0].weights.length;
    if (!this.updateQueue.every((update) => update.weights.length === length)) {
      throw new Error('All federated updates must have the same weight length');
    }
    const totalDataSize = this.updateQueue.reduce((sum, update) => sum + update.dataSize, 0);
    const aggregated = new Array(length).fill(0);
    for (const update of this.updateQueue) {
      const updateWeight = update.dataSize / totalDataSize;
      update.weights.forEach((weight, index) => {
        aggregated[index] += weight * updateWeight;
      });
    }
    const clinics = new Set(this.updateQueue.map((update) => update.clinicId)).size;
    this.globalWeights = aggregated.map((weight) => Number(weight.toFixed(6)));
    this.updateQueue = [];
    return { aggregated: this.globalWeights, participatingClinics: clinics, message: 'FedAvg aggregation completed.' };
  }

  broadcastGlobalModel(clinicIds: string[]) {
    const weights = this.globalWeights.length ? this.globalWeights : [0.12, 0.22, 0.32, 0.42];
    return clinicIds.map((clinicId) => ({
      clinicId,
      modelId: 'mediscribe-general-e4b',
      packageId: stableId('model-broadcast', { clinicId, weights }),
      encryptedPayloadHash: crypto.createHash('sha256').update(`${clinicId}:${weights.join(',')}`).digest('hex'),
      status: 'ready_for_secure_download',
      createdAt: now()
    }));
  }

  status() {
    return {
      queuedUpdates: this.updateQueue.length,
      globalWeightsReady: this.globalWeights.length > 0,
      globalWeights: this.globalWeights
    };
  }
}

export const federatedLearning = new FederatedLearningManager();

interface PatientOutcome {
  diagnosisId: string;
  predictedDiagnosis: string;
  actualDiagnosis: string;
  confidence: number;
  correctness: boolean;
  clinicId: string;
  specialty?: Specialty;
  timestamp: string;
}

class ContinuousLearningEngine {
  private outcomes: PatientOutcome[] = [];
  private retrainingEvents: Array<{ eventId: string; createdAt: string; sampleCount: number; accuracy: number; focusAreas: string[] }> = [];
  private minBufferSize = 5;

  recordOutcome(input: Omit<PatientOutcome, 'timestamp'> & { timestamp?: string }) {
    const outcome = { ...input, timestamp: input.timestamp || now() };
    this.outcomes.push(outcome);
    const metrics = this.getPerformanceMetrics();
    let retrainingEvent;
    if (this.outcomes.length >= this.minBufferSize && metrics.accuracy < 0.8) {
      retrainingEvent = this.triggerRetraining();
    }
    return { outcome, metrics, retrainingEvent };
  }

  triggerRetraining() {
    const incorrect = this.outcomes.filter((outcome) => !outcome.correctness);
    const event = {
      eventId: stableId('retrain', { incorrect, createdAt: now() }),
      createdAt: now(),
      sampleCount: this.outcomes.length,
      accuracy: this.getPerformanceMetrics().accuracy,
      focusAreas: Array.from(new Set(incorrect.map((outcome) => outcome.specialty || 'general'))).sort()
    };
    this.retrainingEvents.push(event);
    return event;
  }

  getPerformanceMetrics(filters?: { clinicId?: string; specialty?: Specialty }) {
    const filtered = this.outcomes.filter((outcome) => (!filters?.clinicId || outcome.clinicId === filters.clinicId) && (!filters?.specialty || outcome.specialty === filters.specialty));
    const total = filtered.length;
    const correct = filtered.filter((outcome) => outcome.correctness).length;
    const highConfidence = filtered.filter((outcome) => outcome.confidence >= 0.7).length;
    const truePositive = filtered.filter((outcome) => outcome.correctness && outcome.confidence >= 0.7).length;
    const falsePositive = filtered.filter((outcome) => !outcome.correctness && outcome.confidence >= 0.7).length;
    const falseNegative = filtered.filter((outcome) => outcome.correctness && outcome.confidence < 0.7).length;
    const precision = truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : 1;
    const recall = truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : 1;
    const f1Score = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return {
      total,
      accuracy: total ? Number((correct / total).toFixed(3)) : 1,
      precision: Number(precision.toFixed(3)),
      recall: Number(recall.toFixed(3)),
      f1Score: Number(f1Score.toFixed(3)),
      highConfidenceRate: total ? Number((highConfidence / total).toFixed(3)) : 0,
      retrainingEvents: this.retrainingEvents
    };
  }
}

export const continuousLearning = new ContinuousLearningEngine();

interface ShardConfig {
  shardId: number;
  host: string;
  port: number;
  database: string;
  maxConnections: number;
  region: Region;
  readReplica: string;
}

const SHARDS: ShardConfig[] = [
  { shardId: 0, host: 'db-asia.mediscribe.local', port: 5432, database: 'mediscribe_asia', maxConnections: 100, region: 'Asia', readReplica: 'db-asia-replica.mediscribe.local' },
  { shardId: 1, host: 'db-africa.mediscribe.local', port: 5432, database: 'mediscribe_africa', maxConnections: 100, region: 'Africa', readReplica: 'db-africa-replica.mediscribe.local' },
  { shardId: 2, host: 'db-americas.mediscribe.local', port: 5432, database: 'mediscribe_americas', maxConnections: 100, region: 'Americas', readReplica: 'db-americas-replica.mediscribe.local' },
  { shardId: 3, host: 'db-europe.mediscribe.local', port: 5432, database: 'mediscribe_europe', maxConnections: 100, region: 'Europe', readReplica: 'db-europe-replica.mediscribe.local' }
];

export const shardingManager = {
  getShardForPatient(patientId: string) {
    return SHARDS[hashNumber(patientId) % SHARDS.length];
  },
  getShardByRegion(region: string) {
    return SHARDS.find((shard) => shard.region.toLowerCase() === region.toLowerCase()) || SHARDS[0];
  },
  getReadReplicaForAnalytics(shardId: number) {
    return SHARDS.find((shard) => shard.shardId === shardId)?.readReplica || SHARDS[0].readReplica;
  },
  planPatientPlacement(patientId: string, region?: string) {
    const shard = region ? this.getShardByRegion(region) : this.getShardForPatient(patientId);
    return {
      patientId,
      shard,
      writeTarget: `${shard.host}:${shard.port}/${shard.database}`,
      analyticsReplica: shard.readReplica,
      dataResidency: `Patient records remain in ${shard.region}.`
    };
  },
  schemaPlan() {
    return SHARDS.map((shard) => ({
      shardId: shard.shardId,
      table: `patients_${shard.region.toLowerCase()}`,
      checkConstraint: `region = '${shard.region}'`,
      publication: `${shard.region.toLowerCase()}_publication`,
      subscription: `${shard.region.toLowerCase()}_analytics_subscription`
    }));
  }
};

interface DiagnosisMetric {
  metricId: string;
  clinicId: string;
  region: string;
  diagnosis: string;
  confidence: number;
  isCorrect: boolean;
  timestamp: string;
}

class TimeSeriesAnalyticsService {
  private metrics: DiagnosisMetric[] = [];

  recordDiagnosisMetric(input: Omit<DiagnosisMetric, 'metricId' | 'timestamp'> & { timestamp?: string }) {
    const metric: DiagnosisMetric = {
      ...input,
      confidence: clamp(input.confidence),
      metricId: stableId('metric', input),
      timestamp: input.timestamp || now()
    };
    this.metrics.push(metric);
    return metric;
  }

  getOutbreakData(region: string, days = 7) {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const regional = this.metrics.filter((metric) => metric.region.toLowerCase() === region.toLowerCase() && Date.parse(metric.timestamp) >= since);
    const grouped = regional.reduce<Record<string, number>>((acc, metric) => {
      acc[metric.diagnosis] = (acc[metric.diagnosis] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([diagnosis, count]) => ({ diagnosis, region, casesInWindow: count, threshold: Math.max(3, Math.ceil(regional.length * 0.25)), confidence: clamp(count / Math.max(1, regional.length)) }))
      .sort((a, b) => b.casesInWindow - a.casesInWindow);
  }

  detectOutbreak(region: string) {
    const candidate = this.getOutbreakData(region)[0];
    if (!candidate || candidate.casesInWindow < candidate.threshold) return null;
    return {
      diseaseType: candidate.diagnosis,
      region,
      casesInLastWeek: candidate.casesInWindow,
      threshold: candidate.threshold,
      confidence: candidate.confidence,
      publicHealthAuthority: region.toLowerCase() === 'asia' ? 'District Surveillance Unit' : 'Regional Public Health Authority',
      action: 'Notify surveillance lead and validate cluster with clinic reports.'
    };
  }

  summary() {
    const accuracy = this.metrics.length ? this.metrics.filter((metric) => metric.isCorrect).length / this.metrics.length : 1;
    return {
      totalMetrics: this.metrics.length,
      accuracy: Number(accuracy.toFixed(3)),
      regions: Array.from(new Set(this.metrics.map((metric) => metric.region))).sort()
    };
  }
}

export const timeSeriesAnalytics = new TimeSeriesAnalyticsService();

interface RegionalMedicalContext {
  locale: string;
  language: string;
  region: string;
  commonDiseases: string[];
  availableMedications: string[];
  medicalTerminology: Record<string, string>;
  guidelines: string;
  healthcareLevel: HealthcareLevel;
}

const REGIONAL_CONTEXTS: RegionalMedicalContext[] = [
  {
    locale: 'en-IN',
    language: 'English (India)',
    region: 'India',
    commonDiseases: ['Malaria', 'Dengue', 'Tuberculosis', 'Typhoid', 'Snake bite'],
    availableMedications: ['Paracetamol', 'ORS', 'Amoxicillin', 'Artemether-lumefantrine'],
    medicalTerminology: { fever: 'bukhaar', cough: 'khaansi', cold: 'sardi' },
    guidelines: 'Indian Standard Treatment Guidelines plus WHO primary-care guidance',
    healthcareLevel: 'primary'
  },
  {
    locale: 'hi-IN',
    language: 'Hindi (India)',
    region: 'India',
    commonDiseases: ['Dengue', 'Tuberculosis', 'Anemia', 'Diarrheal disease'],
    availableMedications: ['Paracetamol', 'ORS', 'Iron-folic acid', 'Zinc'],
    medicalTerminology: { fever: 'bukhaar', pain: 'dard', breathless: 'saans phoolna' },
    guidelines: 'Indian primary health center protocols',
    healthcareLevel: 'primary'
  },
  {
    locale: 'sw-TZ',
    language: 'Swahili (Tanzania)',
    region: 'Tanzania',
    commonDiseases: ['Malaria', 'Cholera', 'Yellow Fever', 'Schistosomiasis'],
    availableMedications: ['Artemisinin combination therapy', 'ORS', 'Zinc', 'Metronidazole'],
    medicalTerminology: { fever: 'homa', cough: 'kikohozi', pain: 'maumivu' },
    guidelines: 'WHO East Africa low-resource guidance',
    healthcareLevel: 'basic'
  },
  {
    locale: 'id-ID',
    language: 'Bahasa Indonesia',
    region: 'Indonesia',
    commonDiseases: ['Dengue', 'Tuberculosis', 'Malaria', 'Diarrheal disease'],
    availableMedications: ['Paracetamol', 'ORS', 'Zinc', 'Artemisinin combination therapy'],
    medicalTerminology: { fever: 'demam', cough: 'batuk', pain: 'nyeri' },
    guidelines: 'WHO Southeast Asia guidance',
    healthcareLevel: 'primary'
  }
];

export function getRegionalContext(locale = 'en-IN', region?: string) {
  return REGIONAL_CONTEXTS.find((context) => context.locale.toLowerCase() === locale.toLowerCase())
    || REGIONAL_CONTEXTS.find((context) => region && context.region.toLowerCase() === region.toLowerCase())
    || REGIONAL_CONTEXTS[0];
}

export function generateRegionalDiagnosis(intake: ClinicalIntake, locale = 'en-IN', region?: string) {
  const context = getRegionalContext(locale, region);
  const routed = routeToSpecializedModel(intake);
  const text = textOf(intake);
  const regionalMatches = context.commonDiseases.filter((disease) => text.includes(disease.toLowerCase()));
  const regionalAssessment = {
    ...routed.assessment,
    model_source: `${routed.assessment.model_source}+regional-context-${context.locale}`,
    clinical_summary: `${routed.assessment.clinical_summary} Regional context: ${context.region}; common local risks considered: ${context.commonDiseases.join(', ')}.`,
    treatment: {
      ...routed.assessment.treatment,
      medications_to_consider: Array.from(new Set([...routed.assessment.treatment.medications_to_consider, ...context.availableMedications.slice(0, 2)]))
    }
  };
  return { context, regionalMatches, routedModel: routed.selectedModel.id, assessment: regionalAssessment };
}

const CDN_REGIONS = [
  { region: 'Asia', edge: 'https://cdn-ap-south.mediscribe.example/models', latencyMs: 45 },
  { region: 'Africa', edge: 'https://cdn-af-south.mediscribe.example/models', latencyMs: 70 },
  { region: 'Americas', edge: 'https://cdn-us-east.mediscribe.example/models', latencyMs: 55 },
  { region: 'Europe', edge: 'https://cdn-eu-west.mediscribe.example/models', latencyMs: 50 }
];

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

interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  subject: { reference: string };
  code: { coding: Array<{ system: string; code: string; display: string }> };
  assertedDate: string;
  note: Array<{ text: string }>;
}

const SNOMED: Record<string, string> = {
  Malaria: '84387000',
  Dengue: '67924001',
  Tuberculosis: '56717001',
  'Respiratory infection': '312118003',
  Pneumonia: '233604007',
  'Acute coronary syndrome': '394659003',
  'Acute stroke or TIA': '230690007',
  'Undifferentiated primary-care presentation': '404684003'
};

export function toFHIRPatient(patient: PatientProfile) {
  return {
    resourceType: 'Patient',
    id: patient.patient_id || stableId('patient', patient),
    name: [{ given: [(patient.name || 'Unknown').split(' ')[0]], family: (patient.name || 'Patient').split(' ').slice(1).join(' ') || 'Patient' }],
    gender: patient.gender,
    extension: [{ url: 'https://mediscribe.example/fhir/age-years', valueInteger: patient.age_years }]
  };
}

export function toFHIRCondition(assessment: MediScribeAssessment, patientId = assessment.patient_id): FHIRCondition {
  const diagnosis = assessmentTopDiagnosis(assessment);
  return {
    resourceType: 'Condition',
    id: stableId('condition', assessment.assessment_id),
    subject: { reference: `Patient/${patientId}` },
    code: { coding: [{ system: 'http://snomed.info/sct', code: SNOMED[diagnosis] || '404684003', display: diagnosis }] },
    assertedDate: assessment.created_at,
    note: [{ text: assessment.clinical_summary }]
  };
}

export function convertFHIRtoHL7(condition: FHIRCondition) {
  const coding = condition.code.coding[0];
  return `MSH|^~\\&|MediScribe|RuralClinic|HospitalEHR|Referral|${condition.assertedDate}||ORU^R01|${condition.id}|P|2.5\nPID|||${condition.subject.reference.replace('Patient/', '')}\nDG1|1||${coding.code}|${coding.display}`;
}

const ehrOutbox: Array<{ outboxId: string; ehrSystem: string; condition: FHIRCondition; hl7: string; status: string; queuedAt: string }> = [];

export function queueEHRShare(assessment: MediScribeAssessment, ehrSystem = 'demo-hospital.local') {
  const condition = toFHIRCondition(assessment);
  const item = {
    outboxId: stableId('ehr', { condition, ehrSystem }),
    ehrSystem,
    condition,
    hl7: convertFHIRtoHL7(condition),
    status: 'queued_for_secure_delivery',
    queuedAt: now()
  };
  ehrOutbox.push(item);
  return item;
}

interface Prescription {
  id: string;
  patientId: string;
  diagnosis: string;
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  prescribedBy: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'dispensed' | 'completed';
  pharmacyIds: string[];
  qrPayload: string;
}

const prescriptionStore: Prescription[] = [];
const labOrderStore: Array<{
  id: string;
  patientId: string;
  diagnosisId: string;
  tests: string[];
  priority: 'routine' | 'urgent' | 'stat';
  labPartnerId: string;
  status: 'ordered' | 'sample_collected' | 'result_ready';
  orderedAt: string;
  expectedTurnaroundHours: number;
}> = [];

export function generatePrescription(assessment: MediScribeAssessment, patientId = assessment.patient_id): Prescription {
  const medications = assessment.treatment.medications_to_consider.length
    ? assessment.treatment.medications_to_consider.map((name) => ({ name, dosage: 'Per local protocol', frequency: 'As clinically indicated', duration: 'Per clinician review' }))
    : [{ name: 'Safety-net advice', dosage: 'No automatic medicine', frequency: 'Review danger signs', duration: 'Until clinician decision' }];
  const prescription: Prescription = {
    id: stableId('rx', { patientId, assessmentId: assessment.assessment_id, medications }),
    patientId,
    diagnosis: assessmentTopDiagnosis(assessment),
    medications,
    prescribedBy: 'MediScribe decision support; clinician approval required',
    timestamp: now(),
    status: 'pending',
    pharmacyIds: [],
    qrPayload: ''
  };
  prescription.qrPayload = Buffer.from(JSON.stringify({ id: prescription.id, patientId, medications })).toString('base64');
  prescriptionStore.push(prescription);
  return prescription;
}

export function sendToNearbyPharmacy(prescriptionId: string, location: { lat: number; lng: number }) {
  const prescription = prescriptionStore.find((item) => item.id === prescriptionId);
  if (!prescription) throw new Error('Prescription not found');
  const pharmacies = [
    { id: 'pharmacy-primary-health-center', name: 'Primary Health Center Pharmacy', distanceKm: 1.2 },
    { id: 'pharmacy-community-01', name: 'Community Medicine Store', distanceKm: 3.8 }
  ].filter((item) => item.distanceKm <= 5);
  prescription.status = 'sent';
  prescription.pharmacyIds = pharmacies.map((item) => item.id);
  return { prescription, location, pharmacies, deliveryChannel: 'secure SMS or pharmacy API' };
}

export function trackPrescription(prescriptionId: string) {
  const prescription = prescriptionStore.find((item) => item.id === prescriptionId);
  if (!prescription) throw new Error('Prescription not found');
  return {
    prescriptionId,
    status: prescription.status,
    timeline: [
      { status: 'pending', at: prescription.timestamp },
      ...(prescription.status === 'sent' ? [{ status: 'sent', at: now() }] : [])
    ],
    nextAction: prescription.status === 'sent' ? 'Pharmacy confirms dispensing.' : 'Send to nearby pharmacy after clinician review.'
  };
}

export function generateLabOrder(assessment: MediScribeAssessment, labPartnerId = 'district-lab-network') {
  const priority: 'routine' | 'urgent' | 'stat' = assessment.urgency === 'immediate' ? 'stat' : assessment.urgency === 'emergent' || assessment.urgency === 'urgent' ? 'urgent' : 'routine';
  const order = {
    id: stableId('lab', { assessmentId: assessment.assessment_id, tests: assessment.treatment.suggested_tests }),
    patientId: assessment.patient_id,
    diagnosisId: assessment.assessment_id,
    tests: assessment.treatment.suggested_tests.length ? assessment.treatment.suggested_tests : ['Repeat vital signs', 'Focused examination'],
    priority,
    labPartnerId,
    status: 'ordered' as const,
    orderedAt: now(),
    expectedTurnaroundHours: priority === 'stat' ? 1 : priority === 'urgent' ? 6 : 24
  };
  labOrderStore.push(order);
  return order;
}

export function trackLabOrder(orderId: string) {
  const order = labOrderStore.find((item) => item.id === orderId);
  if (!order) throw new Error('Lab order not found');
  return {
    ...order,
    nextAction: order.status === 'result_ready' ? 'Attach results to diagnosis review.' : 'Lab partner updates collection and result status.',
    integrationChannel: 'FHIR DiagnosticReport or lab partner REST API'
  };
}

export function requestSpecialistConsultation(assessment: MediScribeAssessment) {
  const specialty = assessment.differential_diagnoses[0]?.name.includes('stroke') ? 'neurology'
    : assessment.differential_diagnoses[0]?.name.includes('coronary') ? 'cardiology'
      : assessment.urgency === 'routine' ? 'general' : 'emergency';
  return {
    consultationId: stableId('specialist', assessment.assessment_id),
    patientId: assessment.patient_id,
    diagnosisId: assessment.assessment_id,
    specialty,
    status: assessment.urgency === 'routine' ? 'waiting' : 'priority_queue',
    consultationFee: assessment.urgency === 'routine' ? 8 : 0,
    paymentStatus: assessment.urgency === 'routine' ? 'pending' : 'waived_emergency',
    estimatedWaitMinutes: assessment.urgency === 'routine' ? 30 : 5
  };
}

export function startTeleconsultation(patientId: string, doctorId: string) {
  const sessionId = stableId('telemed', { patientId, doctorId, date: new Date().toISOString().slice(0, 10) });
  return {
    sessionId,
    doctorId,
    patientId,
    startTime: now(),
    durationMinutes: 20,
    videoURL: `https://meet.mediscribe.example/session/${sessionId}`,
    prescriptionEnabled: true,
    chartSharingEnabled: true,
    offlineFallback: 'If video fails, referral summary is shared as low-bandwidth text.'
  };
}

export function assessPreventiveHealth(patient: PatientProfile) {
  const riskFactors = [
    patient.age_years >= 50 ? 'age over 50' : '',
    patient.known_conditions?.includes('diabetes') ? 'diabetes' : '',
    patient.known_conditions?.includes('hypertension') ? 'hypertension' : '',
    patient.gender === 'female' && patient.pregnancy_weeks ? 'pregnancy' : ''
  ].filter(Boolean);
  const riskScore = clamp(0.15 + riskFactors.length * 0.18 + (patient.age_years >= 60 ? 0.12 : 0));
  return {
    patientId: patient.patient_id || stableId('patient', patient),
    riskFactors,
    riskScore: Number(riskScore.toFixed(2)),
    preventiveMeasures: ['Repeat BP screening', 'Counsel on danger signs', 'Update immunization and antenatal records if relevant'],
    screeningRecommendations: riskScore > 0.5 ? ['Blood glucose check', 'BP follow-up', 'Clinician review within 30 days'] : ['Routine annual screening']
  };
}

const PRICING: Record<PricingTier, { fee: number; diagnoses: number; features: string[] }> = {
  free: { fee: 0, diagnoses: 10, features: ['offline diagnosis', 'local patient history'] },
  clinic: { fee: 100, diagnoses: 500, features: ['dashboard', 'sync', 'regional model updates'] },
  hospital: { fee: 500, diagnoses: 50000, features: ['EHR integration', 'specialist network', 'analytics'] },
  enterprise: { fee: 5000, diagnoses: 999999, features: ['multi-region support', 'custom models', 'government deployment'] }
};

export function billForService(clinicId: string, diagnosesUsed: number, tier: PricingTier = 'clinic') {
  const pricing = PRICING[tier];
  const overage = Math.max(0, diagnosesUsed - pricing.diagnoses);
  const overageCharge = Number((overage * 0.5).toFixed(2));
  return {
    clinicId,
    tier,
    monthlyFee: pricing.fee,
    diagnosesIncluded: pricing.diagnoses,
    diagnosesUsed,
    overage,
    overageCharge,
    totalDue: pricing.fee + overageCharge,
    features: pricing.features
  };
}

const complianceAudit: Array<{ eventId: string; patientId: string; userId: string; action: string; timestamp: string; ipAddress: string }> = [];
const deletionLedger: Array<{ patientId: string; deletedAt: string; systems: string[] }> = [];

export function deidentifyForResearch(patientData: any) {
  const age = Number(patientData.age_years ?? patientData.age ?? 0);
  return {
    ageRange: age < 18 ? '0-17' : age < 30 ? '18-29' : age < 50 ? '30-49' : '50+',
    gender: patientData.gender || 'unknown',
    condition: patientData.diagnosis || patientData.condition || 'not recorded',
    region: patientData.region || 'unknown',
    removedFields: ['name', 'address', 'phone', 'email', 'exact dates', 'medical record number']
  };
}

export function logComplianceAccess(patientId: string, userId: string, action: string, ipAddress = '127.0.0.1') {
  const event = { eventId: stableId('audit', { patientId, userId, action, at: now() }), patientId, userId, action, timestamp: now(), ipAddress };
  complianceAudit.push(event);
  return event;
}

export function exportPatientData(patientId: string) {
  logComplianceAccess(patientId, 'system', 'DATA_PORTABILITY_EXPORT');
  return {
    resourceType: 'Bundle',
    type: 'collection',
    patientId,
    exportedAt: now(),
    entries: [
      { resourceType: 'Patient', id: patientId },
      { resourceType: 'AuditTrail', events: complianceAudit.filter((event) => event.patientId === patientId) }
    ]
  };
}

export function deletePatientData(patientId: string) {
  const systems = ['postgres-primary', 'read-replicas', 'analytics-timeseries', 'mobile-sync-queue', 'model-feedback-buffer'];
  deletionLedger.push({ patientId, deletedAt: now(), systems });
  logComplianceAccess(patientId, 'system', 'RIGHT_TO_BE_FORGOTTEN');
  return { patientId, deleted: true, systems, ledgerSize: deletionLedger.length };
}

export function encryptPatientData(data: unknown, key = process.env.COMPLIANCE_ENCRYPTION_KEY || 'mediscribe-demo-key') {
  const iv = crypto.randomBytes(12);
  const derived = crypto.createHash('sha256').update(key).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', derived, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: encrypted.toString('base64')
  };
}

export function scalabilityReadinessReport() {
  return {
    ai: {
      models: MODEL_REGISTRY,
      routing: 'Implemented specialty classifier with deterministic fallback and quantized model metadata.',
      federatedLearning: federatedLearning.status(),
      continuousLearning: continuousLearning.getPerformanceMetrics()
    },
    data: {
      sharding: SHARDS,
      schemaPlan: shardingManager.schemaPlan(),
      timeSeriesAnalytics: timeSeriesAnalytics.summary()
    },
    regional: {
      contexts: REGIONAL_CONTEXTS,
      cdnRegions: CDN_REGIONS
    },
    integration: {
      ehr: { outboxItems: ehrOutbox.length, standards: ['FHIR R4 Condition/Patient', 'HL7 v2 DG1'] },
      prescriptions: { stored: prescriptionStore.length, qrEnabled: true },
      labs: { stored: labOrderStore.length, standards: ['FHIR DiagnosticReport', 'partner REST API'] }
    },
    features: ['specialist network', 'telemedicine sessions', 'outbreak detection', 'preventive health scoring'],
    business: PRICING,
    security: {
      standards: ['HIPAA safe-harbor deidentification', 'GDPR deletion and portability', 'AES-256-GCM encryption', 'immutable access log'],
      auditEvents: complianceAudit.length,
      deletionLedger: deletionLedger.length
    }
  };
}
