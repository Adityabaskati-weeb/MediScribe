import { ClinicalIntake } from '../models/Clinical';
import { runAgenticMedicalAssessment } from './agentOrchestrator';
import { analyzeIntake } from './clinicalEngine';
import { analyzeMedicalCase, MedicalPrompt } from './gemmaService';

export interface DiagnosisResult {
  primaryDiagnosis: string;
  alternativeDiagnoses: string[];
  confidenceScores: number[];
  clinicalReasoning: string;
  recommendedDiagnosticTests: string[];
  suggestedTreatment: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      availability: 'common' | 'specialty' | 'rare';
    }>;
    nonPharmacological: string[];
    followUpInDays: number;
  };
  warningFlags: string[];
  referralRecommendation: boolean;
  referralSpecialty?: string;
}

export async function analyzeClinicalIntake(payload: ClinicalIntake) {
  return runAgenticMedicalAssessment(payload);
}

export async function generateDiagnosis(medicalData: MedicalPrompt): Promise<DiagnosisResult> {
  try {
    const gemmaResponse = await analyzeMedicalCase(medicalData);
    const diagnosis = validateDiagnosisResponse(gemmaResponse);
    addClinicalWarnings(diagnosis, medicalData);
    return diagnosis;
  } catch {
    const fallback = buildFallbackDiagnosis(medicalData);
    addClinicalWarnings(fallback, medicalData);
    return fallback;
  }
}

function validateDiagnosisResponse(response: any): DiagnosisResult {
  return {
    primaryDiagnosis: response.primaryDiagnosis || 'Undifferentiated clinical presentation',
    alternativeDiagnoses: response.alternativeDiagnoses || response.alternative_diagnoses || [],
    confidenceScores: response.confidenceScores || response.confidence_scores || [0.5],
    clinicalReasoning: response.clinicalReasoning || response.clinical_reasoning || 'Clinical reasoning not supplied.',
    recommendedDiagnosticTests: response.recommendedDiagnosticTests || response.recommendedTests || response.recommended_tests || [],
    suggestedTreatment: {
      medications: response.suggestedTreatment?.medications || response.medications || [],
      nonPharmacological: response.suggestedTreatment?.nonPharmacological || response.nonPharmacological || ['Follow local clinical protocol.'],
      followUpInDays: response.suggestedTreatment?.followUpInDays || response.followUpDays || 7
    },
    warningFlags: response.warningFlags || response.warning_flags || [],
    referralRecommendation: Boolean(response.referralRecommendation || response.referralRequired),
    referralSpecialty: response.referralSpecialty
  };
}

function addClinicalWarnings(diagnosis: DiagnosisResult, medicalData: MedicalPrompt): void {
  const vitals: Record<string, any> = medicalData.vitals || {};
  const temperature = vitals.temperature ?? vitals.temperature_c;
  const respiratoryRate = vitals.respiratoryRate ?? vitals.respiratory_rate;
  const systolic = vitals.systolic_bp ?? vitals.systolic;
  const oxygen = vitals.oxygen_saturation ?? vitals.spo2;
  const symptoms = medicalData.symptoms.map((symptom) => symptom.toLowerCase());

  if (temperature && temperature > 40) {
    diagnosis.warningFlags.push('CRITICAL: Fever > 40C - monitor closely and consider urgent referral.');
  }

  if (respiratoryRate && respiratoryRate > 30) {
    diagnosis.warningFlags.push('ALERT: Rapid breathing (RR > 30) - consider respiratory infection, sepsis, or metabolic issue.');
  }

  if (systolic && systolic < 90) {
    diagnosis.warningFlags.push('CRITICAL: Systolic BP < 90 mmHg - shock risk, refer urgently.');
  }

  if (oxygen && oxygen < 90) {
    diagnosis.warningFlags.push('CRITICAL: Oxygen saturation < 90% - respiratory emergency risk.');
  }

  if (symptoms.some((symptom) => symptom.includes('chest')) && symptoms.some((symptom) => symptom.includes('breath'))) {
    diagnosis.warningFlags.push('Chest pain plus shortness of breath - consider cardiac event, refer urgently.');
  }

  if (diagnosis.warningFlags.length > 0) {
    diagnosis.referralRecommendation = true;
  }
}

function buildFallbackDiagnosis(medicalData: MedicalPrompt): DiagnosisResult {
  const intake: ClinicalIntake = {
    patient: {
      age_years: medicalData.patientAge,
      gender: medicalData.gender === 'M' ? 'male' : medicalData.gender === 'F' ? 'female' : 'unknown',
      known_conditions: medicalData.medicalHistory || [],
      medications: medicalData.medications || []
    },
    chief_complaint: medicalData.symptoms[0] || 'Clinical presentation',
    symptoms: medicalData.symptoms,
    vitals: medicalData.vitals as any,
    offline_captured: true
  };
  const assessment = analyzeIntake(intake, 'deterministic-fallback-for-gemma');
  return {
    primaryDiagnosis: assessment.differential_diagnoses[0]?.name || 'Undifferentiated clinical presentation',
    alternativeDiagnoses: assessment.differential_diagnoses.slice(1).map((item) => item.name),
    confidenceScores: assessment.differential_diagnoses.map((item) => item.confidence),
    clinicalReasoning: assessment.clinical_summary,
    recommendedDiagnosticTests: assessment.treatment.suggested_tests,
    suggestedTreatment: {
      medications: assessment.treatment.medications_to_consider.map((name) => ({
        name,
        dosage: 'per local protocol',
        frequency: 'per local protocol',
        duration: 'per local protocol',
        availability: 'common' as const
      })),
      nonPharmacological: assessment.treatment.immediate_actions,
      followUpInDays: assessment.urgency === 'routine' ? 7 : 1
    },
    warningFlags: assessment.red_flags.map((flag) => flag.message),
    referralRecommendation: ['immediate', 'emergent'].includes(assessment.urgency),
    referralSpecialty: assessment.treatment.referral
  };
}

export async function getFollowUpRecommendations(
  patientId: string,
  previousDiagnosis: DiagnosisResult
): Promise<{
  expectedImprovement: string;
  redFlags: string[];
  nextCheckupDate: string;
  followUpTests: string[];
}> {
  const followUpInDays = previousDiagnosis.suggestedTreatment.followUpInDays || 7;
  return {
    expectedImprovement: `Improvement expected in ${followUpInDays} days for patient ${patientId}.`,
    redFlags: previousDiagnosis.warningFlags,
    nextCheckupDate: new Date(Date.now() + followUpInDays * 24 * 60 * 60 * 1000).toISOString(),
    followUpTests: previousDiagnosis.recommendedDiagnosticTests
  };
}
