import React, { useEffect, useState } from 'react';
import { DiagnosisHistory } from '../components/DiagnosisHistory';
import { OutcomeTracker } from '../components/OutcomeTracker';
import { fetchRecentAssessments, fetchReports } from '../services/api';

export function ReportsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    fetchRecentAssessments().then(setAssessments).catch(console.error);
    fetchReports().then(setReports).catch(console.error);
  }, []);

  return (
    <main>
      <OutcomeTracker reports={reports} />
      <DiagnosisHistory assessments={assessments} />
    </main>
  );
}
