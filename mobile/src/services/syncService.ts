import { apiClient } from './apiClient';

export async function syncOfflineChanges() {
  const response = await apiClient.get('/api/sync/pending');
  return response.data;
}
