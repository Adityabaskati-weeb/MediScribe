import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.138:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

export async function generateDiagnosis(payload: unknown) {
  const response = await apiClient.post('/api/diagnoses/generate', payload);
  return response.data;
}
