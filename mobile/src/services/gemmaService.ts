import { generateDiagnosis } from './apiClient';

export async function analyzeMedicalCase(payload: unknown) {
  return generateDiagnosis(payload);
}
