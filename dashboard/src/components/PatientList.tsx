import React from 'react';

export function PatientList({ assessments }: { assessments: any[] }) {
  return (
    <section>
      {assessments.map((item) => (
        <article className="row" key={item.assessment_id}>
          <strong>{item.patient_id}</strong>
          <span>{item.urgency} · Category {item.triage_category}</span>
        </article>
      ))}
    </section>
  );
}
