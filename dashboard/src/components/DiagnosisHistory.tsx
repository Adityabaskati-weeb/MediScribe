import React from 'react';

export function DiagnosisHistory({ assessments }: { assessments: any[] }) {
  return (
    <section>
      <h2>Diagnosis History</h2>
      {assessments.map((item) => <p key={item.assessment_id}>{item.clinical_summary}</p>)}
    </section>
  );
}
