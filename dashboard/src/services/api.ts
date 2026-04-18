import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

export async function fetchDashboard() {
  const response = await api.get('/api/dashboard/stats');
  return response.data.data;
}

export async function fetchRecentAssessments() {
  const response = await api.get('/api/patients/recent');
  return response.data.data || [];
}

export async function fetchPatients() {
  const response = await api.get('/api/patients');
  return response.data.data || [];
}

export async function fetchReports() {
  const response = await api.get('/api/dashboard/reports');
  return response.data.data;
}

export async function fetchEvaluationMetrics() {
  const response = await api.get('/api/diagnoses/evaluation');
  return response.data.data;
}

export async function fetchPerformanceMetrics() {
  const response = await api.get('/api/diagnoses/performance');
  return response.data.data;
}

export async function fetchSystemArchitecture() {
  const response = await api.get('/api/system/architecture');
  return response.data.data;
}

export async function fetchDemoPack() {
  const response = await api.get('/api/system/demo-pack');
  return response.data.data;
}
