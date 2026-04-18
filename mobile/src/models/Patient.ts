export interface Patient {
  patient_id?: string;
  name?: string;
  age_years: number;
  gender: 'female' | 'male' | 'other' | 'unknown';
  known_conditions?: string[];
}
