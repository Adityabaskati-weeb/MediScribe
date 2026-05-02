import { ClinicalIntake } from '../models/Clinical';

export interface DemoCaseDefinition {
  id: string;
  title: string;
  story: string;
  language: string;
  hero: boolean;
  demo_mode: 'offline' | 'local-ai';
  expected_track_strength: Array<'health' | 'ollama' | 'safety' | 'inclusivity'>;
  intake: ClinicalIntake;
}

export const DEMO_CASES: DemoCaseDefinition[] = [
  {
    id: 'maternal-emergency-offline',
    title: 'Maternal emergency in no-network clinic',
    story: 'A rural health worker catches pregnancy danger signs offline and prepares a clean referral handoff before sync.',
    language: 'Hindi',
    hero: true,
    demo_mode: 'offline',
    expected_track_strength: ['health', 'ollama', 'safety', 'inclusivity'],
    intake: {
      patient: {
        name: 'Kavita Rao',
        age_years: 31,
        gender: 'female',
        pregnancy_weeks: 32,
        known_conditions: [],
        medications: ['iron folate'],
        allergies: []
      },
      chief_complaint: 'Pregnant woman with bleeding, abdominal pain, and dizziness',
      symptoms: ['bleeding', 'abdominal pain', 'dizziness'],
      vitals: {
        systolic_bp: 104,
        diastolic_bp: 70,
        heart_rate: 112,
        oxygen_saturation: 96
      },
      notes: ['No internet in clinic. Local-language consultation.'],
      language: 'Hindi',
      offline_captured: true
    }
  },
  {
    id: 'stroke-fast-track',
    title: 'Golden-hour stroke rescue',
    story: 'One-sided weakness and slurred speech trigger rapid escalation, last-known-well capture, and a faster stroke referral.',
    language: 'Hindi',
    hero: true,
    demo_mode: 'local-ai',
    expected_track_strength: ['health', 'ollama', 'safety', 'inclusivity'],
    intake: {
      patient: {
        name: 'Kamala Devi',
        age_years: 61,
        gender: 'female',
        known_conditions: ['hypertension'],
        medications: ['amlodipine'],
        allergies: []
      },
      chief_complaint: 'Facial droop and slurred speech',
      symptoms: ['arm weakness', 'slurred speech'],
      vitals: {
        systolic_bp: 188,
        diastolic_bp: 104,
        glucose_mg_dl: 116
      },
      notes: ['Symptoms started about 45 minutes ago. Family says speech suddenly changed while eating breakfast.'],
      language: 'Hindi',
      offline_captured: true
    }
  },
  {
    id: 'child-pneumonia-risk',
    title: 'Child pneumonia risk',
    story: 'A low-resource child respiratory case surfaces oxygen and feeding danger signs with IMCI-style escalation.',
    language: 'Hindi',
    hero: false,
    demo_mode: 'local-ai',
    expected_track_strength: ['health', 'inclusivity'],
    intake: {
      patient: {
        name: 'Rohan',
        age_years: 4,
        gender: 'male',
        known_conditions: [],
        medications: [],
        allergies: []
      },
      chief_complaint: 'Child with fever, cough, and fast breathing',
      symptoms: ['cough', 'fast breathing', 'eating less than usual'],
      vitals: {
        temperature_c: 39.2,
        heart_rate: 132,
        respiratory_rate: 38,
        oxygen_saturation: 91
      },
      language: 'Hindi',
      offline_captured: true
    }
  }
];

export function demoCaseById(id: string | undefined) {
  return DEMO_CASES.find((item) => item.id === id) || DEMO_CASES.find((item) => item.hero) || DEMO_CASES[0];
}
