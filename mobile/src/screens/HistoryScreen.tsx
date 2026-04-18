import React, { useEffect, useState } from 'react';
import { PatientHistory } from '../components/PatientHistory';
import { getPatientHistory } from '../services/databaseService';

export function HistoryScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getPatientHistory().then(setItems).catch(console.error);
  }, []);

  return <PatientHistory items={items} />;
}
