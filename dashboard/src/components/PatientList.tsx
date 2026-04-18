import React from 'react';

export function PatientList({ patients, assessments = [] }: { patients?: any[]; assessments?: any[] }) {
  const rows = patients?.length ? patients : assessments.map((assessment) => ({
    patient_id: assessment.patient_id,
    name: assessment.patient_id,
    total_assessments: 1,
    last_visit_at: assessment.created_at,
    urgency: assessment.urgency,
    triage_category: assessment.triage_category
  }));

  return (
    <section>
      <h2>Patients</h2>
      {rows.length === 0 && <p>No patient records yet. Run a mobile intake or submit a diagnosis.</p>}
      {rows.map((item) => (
        <article className="row" key={item.patient_id}>
          <strong>{item.name || item.patient_id}</strong>
          <span>{item.age_years ? `${item.age_years} years` : 'Age pending'} - {item.gender || 'unknown'}</span>
          <span>{item.total_assessments || 0} assessments</span>
          {item.urgency && <span>{item.urgency} - Category {item.triage_category}</span>}
        </article>
      ))}
    </section>
  );
}
