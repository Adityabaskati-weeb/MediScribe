import { useCallback, useEffect, useState } from 'react';
import { getAllPatients, getPatientHistory, getPendingOfflinePayloads, getSyncQueue } from '../services/databaseService';

type MedicalDataState = {
  patients: Array<Record<string, unknown>>;
  history: Array<Record<string, unknown>>;
  pendingOfflinePayloads: Array<{ id: string; payload: unknown; created_at: string }>;
  pendingSyncQueue: Array<{ id: string; tableType: string; recordId: string; operation: string; payload: string; createdAt: string }>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMedicalData(patientId?: string): MedicalDataState {
  const [patients, setPatients] = useState<Array<Record<string, unknown>>>([]);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [pendingOfflinePayloads, setPendingOfflinePayloads] = useState<Array<{ id: string; payload: unknown; created_at: string }>>([]);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<Array<{ id: string; tableType: string; recordId: string; operation: string; payload: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextPatients, nextHistory, nextOffline, nextSync] = await Promise.all([
        getAllPatients() as Promise<Array<Record<string, unknown>>>,
        getPatientHistory(patientId),
        getPendingOfflinePayloads(),
        getSyncQueue()
      ]);
      setPatients(nextPatients);
      setHistory(nextHistory);
      setPendingOfflinePayloads(nextOffline);
      setPendingSyncQueue(nextSync);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to load local medical data.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    patients,
    history,
    pendingOfflinePayloads,
    pendingSyncQueue,
    loading,
    error,
    refresh
  };
}
