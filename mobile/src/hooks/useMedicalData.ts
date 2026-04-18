import { useCallback, useEffect, useState } from 'react';
import { getAllPatients, getPatientHistory, getPendingOfflinePayloads } from '../services/databaseService';

export function useMedicalData() {
  const [patients, setPatients] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [pendingSync, setPendingSync] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [patientRows, historyRows, syncRows] = await Promise.all([
        getAllPatients(),
        getPatientHistory(),
        getPendingOfflinePayloads()
      ]);
      setPatients(patientRows);
      setHistory(historyRows);
      setPendingSync(syncRows.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patients, history, pendingSync, loading, refresh };
}
