import React, { useEffect, useState } from 'react';
import { DoctorReviewQueue } from '../components/DoctorReviewQueue';
import { PatientList } from '../components/PatientList';
import { fetchDashboard, fetchPatients, fetchRecentAssessments } from '../services/api';

export function PatientsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchPatients().then(setPatients).catch(console.error);
    fetchRecentAssessments().then(setAssessments).catch(console.error);
    fetchDashboard().then(setDashboard).catch(console.error);
  }, []);

  return (
    <main>
      <DoctorReviewQueue items={dashboard?.review_queue || []} />
      <PatientList patients={patients} assessments={assessments} />
    </main>
  );
}
