export type Gender = 'female' | 'male' | 'other' | 'unknown';
export type Urgency = 'immediate' | 'emergent' | 'urgent' | 'routine';
export type CaptureSource = 'form' | 'voice' | 'ocr' | 'mixed';

export interface ClinicalVitals {
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  temperature_c?: number;
  glucose_mg_dl?: number;
}

export interface PatientProfile {
  patient_id?: string;
  name?: string;
  age_years: number;
  gender: Gender;
  pregnancy_weeks?: number;
  postpartum_days?: number;
  known_conditions?: string[];
  medications?: string[];
  allergies?: string[];
}

export interface ClinicalIntake {
  patient: PatientProfile;
  chief_complaint: string;
  symptoms?: string[];
  vitals?: ClinicalVitals;
  notes?: string[];
  language?: string;
  offline_captured?: boolean;
}

export interface IntakeCapture {
  source: CaptureSource;
  raw_text: string;
  patient_hint?: PatientProfile;
  language?: string;
  offline_captured?: boolean;
}

export interface SafetySignal {
  level: 'red' | 'amber' | 'green';
  message: string;
}

export interface DifferentialDiagnosis {
  name: string;
  confidence: number;
  reasoning: string;
}

export interface TreatmentRecommendation {
  immediate_actions: string[];
  suggested_tests: string[];
  medications_to_consider: string[];
  referral: string;
  follow_up: string;
}

export interface MediScribeAssessment {
  assessment_id: string;
  patient_id: string;
  created_at: string;
  urgency: Urgency;
  triage_category: number;
  red_flags: SafetySignal[];
  differential_diagnoses: DifferentialDiagnosis[];
  treatment: TreatmentRecommendation;
  clinical_summary: string;
  model_source: string;
  disclaimer: string;
}

export interface StoredAssessment {
  intake: ClinicalIntake;
  assessment: MediScribeAssessment;
}

export interface QueuedIntake {
  draft_id: string;
  status: 'queued' | 'assessed' | 'synced' | 'cancelled';
  created_at: string;
  updated_at: string;
  intake: ClinicalIntake;
  source: CaptureSource;
  raw_text: string;
}
