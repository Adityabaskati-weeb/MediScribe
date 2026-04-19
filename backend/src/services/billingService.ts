import { PatientProfile } from '../models/Clinical';
import { PricingTier, clamp, stableId } from './scalabilityShared';

const PRICING: Record<PricingTier, { fee: number; diagnoses: number; features: string[] }> = {
  free: { fee: 0, diagnoses: 10, features: ['offline diagnosis', 'local patient history'] },
  clinic: { fee: 100, diagnoses: 500, features: ['dashboard', 'sync', 'regional model updates'] },
  hospital: { fee: 500, diagnoses: 50000, features: ['EHR integration', 'specialist network', 'analytics'] },
  enterprise: { fee: 5000, diagnoses: 999999, features: ['multi-region support', 'custom models', 'government deployment'] }
};

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

export function pricingReadiness() {
  return PRICING;
}

export function parsePricingTier(value: unknown): PricingTier {
  return value === 'free' || value === 'clinic' || value === 'hospital' || value === 'enterprise' ? value : 'clinic';
}

