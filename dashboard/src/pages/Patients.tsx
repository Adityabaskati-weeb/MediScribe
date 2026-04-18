import React, { useEffect, useState } from 'react';
import { PatientList } from '../components/PatientList';
import { fetchRecentAssessments } from '../services/api';

export function PatientsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  useEffect(() => { fetchRecentAssessments().then(setAssessments).catch(console.error); }, []);
  return <PatientList assessments={assessments} />;
}
