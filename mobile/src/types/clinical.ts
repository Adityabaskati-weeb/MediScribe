export type Gender = 'female' | 'male' | 'other' | 'unknown' | string;
export type Urgency = 'immediate' | 'emergent' | 'urgent' | 'routine';

export type PatientProfile = {
  id?: string;
  patient_id?: string;
  name?: string;
  age_years: number;
  gender: Gender;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  weight_kg?: number;
  pregnancy_weeks?: number;
  postpartum_days?: number;
  known_conditions?: string[];
  medications?: string[];
  allergies?: string[];
};

export type ClinicalVitals = {
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  temperature_c?: number;
  glucose_mg_dl?: number;
};

export type SafetySignal = {
  level: 'red' | 'amber' | 'green';
  message: string;
};

export type DifferentialDiagnosis = {
  name: string;
  confidence: number;
  reasoning: string;
};

export type TreatmentRecommendation = {
  immediate_actions: string[];
  suggested_tests: string[];
  medications_to_consider: string[];
  referral: string;
  follow_up: string;
};

export type MediScribeAssessment = {
  assessment_id: string;
  patient_id: string;
  created_at?: string;
  urgency: Urgency;
  triage_category: number;
  red_flags: SafetySignal[];
  differential_diagnoses: DifferentialDiagnosis[];
  treatment: TreatmentRecommendation;
  clinical_summary: string;
  model_source: string;
  disclaimer: string;
};

export type DiagnosisEnvelope = {
  success?: boolean;
  data?: {
    assessment?: MediScribeAssessment;
    stored?: { assessment?: MediScribeAssessment };
    ai?: { assessment?: MediScribeAssessment };
    agents?: AgentStep[];
    metrics?: { latency_ms?: number; fallback_used?: boolean };
    guardrails?: {
      fallback_required?: boolean;
      escalation_required?: boolean;
      safety_messages?: SafetySignal[];
    };
    agentic?: {
      assessment?: MediScribeAssessment;
      stored?: { assessment?: MediScribeAssessment };
      agents?: AgentStep[];
      metrics?: { latency_ms?: number; fallback_used?: boolean };
      guardrails?: {
        fallback_required?: boolean;
        escalation_required?: boolean;
        safety_messages?: SafetySignal[];
      };
    };
  };
  assessment?: MediScribeAssessment;
  agents?: AgentStep[];
  metrics?: { latency_ms?: number; fallback_used?: boolean };
};

export type AgentStep = {
  agent: 'diagnosis-agent' | 'reasoning-agent' | 'treatment-agent' | 'safety-agent' | string;
  status: 'completed' | 'fallback' | string;
  latency_ms?: number;
  output?: unknown;
};

export type ConsultationDraft = {
  patient?: PatientProfile;
  transcript?: string;
  chartText?: string;
  assessment?: MediScribeAssessment;
  demoCaseId?: string;
  forceOfflineDemo?: boolean;
  consultationStartedAt?: number;
  language: string;
};
