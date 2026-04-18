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
      <h1>Reports</h1>
      <section className="report-actions">
        <button onClick={() => exportCsv(reports)}>Export CSV</button>
        <button onClick={() => window.print()}>Export PDF</button>
      </section>
      <OutcomeTracker reports={reports} />
      <DiagnosisHistory assessments={assessments} />
    </main>
  );
}

function exportCsv(reports: any) {
  const rows = [
    ['metric', 'value'],
    ['referral_required', reports?.referral_required ?? 0],
    ['average_diagnosis_accuracy', reports?.average_diagnosis_accuracy ?? 0],
    ...(reports?.top_diagnoses || []).map((item: any) => [`diagnosis:${item.name}`, item.count])
  ];
  const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mediscribe-report.csv';
  link.click();
  URL.revokeObjectURL(url);
}
