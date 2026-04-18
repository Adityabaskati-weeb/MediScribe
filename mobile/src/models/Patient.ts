export interface Patient {
  patient_id?: string;
  name?: string;
  age_years: number;
  gender: 'female' | 'male' | 'other' | 'unknown';
  known_conditions?: string[];
  allergies?: string[];
  medications?: string[];
  phone?: string;
  address?: string;
  emergencyContact?: string;
  pregnancy_weeks?: number;
  postpartum_days?: number;
}
