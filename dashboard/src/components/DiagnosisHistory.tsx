import React from 'react';

export function DiagnosisHistory({ assessments }: { assessments: any[] }) {
  return (
    <section>
      <h2>Diagnosis History</h2>
      {assessments.length === 0 && <p>No assessments have been generated yet.</p>}
      {assessments.map((item) => (
        <article className="row" key={item.assessment_id}>
          <strong>{item.urgency} - Category {item.triage_category}</strong>
          <span>{item.clinical_summary}</span>
        </article>
      ))}
    </section>
  );
}
