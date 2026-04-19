import { ClinicalIntake } from '../models/Clinical';
import { routeToSpecializedModel } from './modelRouterService';
import { HealthcareLevel, Region, clamp, hashNumber, stableId } from './scalabilityShared';

interface ShardConfig {
  shardId: number;
  host: string;
  port: number;
  database: string;
  maxConnections: number;
  region: Region;
  readReplica: string;
}

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

interface DiagnosisMetric {
  metricId: string;
  clinicId: string;
  region: string;
  diagnosis: string;
  confidence: number;
  isCorrect: boolean;
  timestamp: string;
}

const SHARDS: ShardConfig[] = [
  { shardId: 0, host: 'db-asia.mediscribe.local', port: 5432, database: 'mediscribe_asia', maxConnections: 100, region: 'Asia', readReplica: 'db-asia-replica.mediscribe.local' },
  { shardId: 1, host: 'db-africa.mediscribe.local', port: 5432, database: 'mediscribe_africa', maxConnections: 100, region: 'Africa', readReplica: 'db-africa-replica.mediscribe.local' },
  { shardId: 2, host: 'db-americas.mediscribe.local', port: 5432, database: 'mediscribe_americas', maxConnections: 100, region: 'Americas', readReplica: 'db-americas-replica.mediscribe.local' },
  { shardId: 3, host: 'db-europe.mediscribe.local', port: 5432, database: 'mediscribe_europe', maxConnections: 100, region: 'Europe', readReplica: 'db-europe-replica.mediscribe.local' }
];

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

function now() {
  return new Date().toISOString();
}

function textOf(intake: ClinicalIntake) {
  return [intake.chief_complaint, ...(intake.symptoms || []), ...(intake.notes || [])].join(' ').toLowerCase();
}

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

export function regionalReadiness(cdnRegions: unknown) {
  return {
    contexts: REGIONAL_CONTEXTS,
    cdnRegions
  };
}

export function dataScalingReadiness() {
  return {
    sharding: SHARDS,
    schemaPlan: shardingManager.schemaPlan(),
    timeSeriesAnalytics: timeSeriesAnalytics.summary()
  };
}
