import React, { useEffect, useState } from 'react';
import { PatientList } from '../components/PatientList';
import { fetchPatients, fetchRecentAssessments } from '../services/api';

export function PatientsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchPatients().then(setPatients).catch(console.error);
    fetchRecentAssessments().then(setAssessments).catch(console.error);
  }, []);

  return <PatientList patients={patients} assessments={assessments} />;
}
