import { generateDiagnosis } from './apiClient';
import type { DiagnosisEnvelope } from '../types/clinical';

export async function analyzeMedicalCase(payload: unknown): Promise<DiagnosisEnvelope> {
  return generateDiagnosis(payload);
}
