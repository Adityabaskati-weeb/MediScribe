import { apiClient } from './apiClient';
import { getPendingOfflinePayloads, markOfflinePayloadsSynced } from './databaseService';

export async function syncOfflineChanges() {
  const pendingLocal = await getPendingOfflinePayloads();
  if (pendingLocal.length > 0) {
    const pushResponse = await apiClient.post('/api/sync/push', {
      items: pendingLocal.map((item) => ({
        record_id: item.id,
        operation: 'UPSERT_DIAGNOSIS',
        payload: item.payload,
        created_at: item.created_at
      }))
    });
    await markOfflinePayloadsSynced(pendingLocal.map((item) => item.id));
    return pushResponse.data;
  }

  const response = await apiClient.get('/api/sync/pending');
  const syncIds = (response.data?.data?.items || []).map((item: { sync_id: string }) => item.sync_id);
  if (syncIds.length > 0) {
    await apiClient.post('/api/sync/ack', { sync_ids: syncIds });
  }
  return response.data;
}
