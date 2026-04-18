import React from 'react';

export function DoctorReviewQueue({ items = [] }: { items?: any[] }) {
  return (
    <section className="review-queue">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Doctor review mode</p>
          <h2>Cases that need a clinician</h2>
        </div>
        <span className="queue-count">{items.length} waiting</span>
      </div>
      {items.length === 0 && <p className="muted">No urgent or low-confidence assessments in the review queue.</p>}
      {items.map((item) => (
        <article className="review-row" key={item.assessment_id}>
          <div>
            <strong>{item.patient_name || item.patient_id}</strong>
            <span>{item.top_diagnosis}</span>
            <small>{item.reason}</small>
          </div>
          <div className={`urgency ${item.urgency}`}>
            {item.urgency} · Cat {item.triage_category}
          </div>
        </article>
      ))}
    </section>
  );
}
