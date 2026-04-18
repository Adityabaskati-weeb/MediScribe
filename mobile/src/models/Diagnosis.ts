export interface Diagnosis {
  assessment_id: string;
  patient_id: string;
  urgency: 'immediate' | 'emergent' | 'urgent' | 'routine';
  triage_category: number;
  clinical_summary: string;
}
