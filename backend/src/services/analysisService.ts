import { ClinicalIntake } from '../models/Clinical';
import { analyzeIntake, saveAssessment } from './clinicalEngine';

export async function analyzeClinicalIntake(payload: ClinicalIntake) {
  const assessment = analyzeIntake(payload);
  return saveAssessment(payload, assessment);
}
