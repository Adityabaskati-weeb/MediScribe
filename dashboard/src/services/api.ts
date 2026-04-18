import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

export async function fetchDashboard() {
  const response = await api.get('/api/patients/dashboard/summary');
  return response.data.data;
}

export async function fetchRecentAssessments() {
  const response = await api.get('/api/patients/recent');
  return response.data.data || [];
}
