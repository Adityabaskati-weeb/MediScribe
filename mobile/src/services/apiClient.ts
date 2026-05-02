import axios from 'axios';
import type { DemoCaseSeed, DiagnosisEnvelope } from '../types/clinical';

function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return `${window.location.protocol}//${host}:3001`;
  }

  return 'http://192.168.31.138:3001';
}

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

export async function generateDiagnosis(payload: unknown) {
  const response = await apiClient.post('/api/diagnoses/agentic', payload);
  return response.data;
}

export async function fetchDemoCases(): Promise<DemoCaseSeed[]> {
  const response = await apiClient.get('/api/diagnoses/demo-cases');
  return response.data?.data?.cases || [];
}

export async function fetchDemoOutput(caseId: string): Promise<DiagnosisEnvelope> {
  const response = await apiClient.get('/api/diagnoses/demo-output', { params: { caseId } });
  return response.data?.data?.agentic_assessment || response.data;
}

export type ChartVisionResponse = {
  extracted_text: string;
  confidence: number;
  note: string;
  mode: 'vision-assist' | 'manual-confirmation';
};

export async function extractChartVisionText(imageBase64: string): Promise<ChartVisionResponse> {
  const response = await apiClient.post('/api/diagnoses/chart-vision', {
    image_base64: imageBase64
  });
  return response.data?.data || response.data;
}
