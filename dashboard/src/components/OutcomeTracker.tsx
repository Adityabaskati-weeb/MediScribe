import React from 'react';

export function OutcomeTracker({ reports }: { reports?: any }) {
  return (
    <section>
      <h2>Outcomes</h2>
      <article className="row">
        <strong>{reports?.referral_required ?? 0}</strong>
        <span>Emergency referrals triggered</span>
      </article>
      {(reports?.top_diagnoses || []).map((item: { name: string; count: number }) => (
        <article className="row" key={item.name}>
          <strong>{item.name}</strong>
          <span>{item.count} mentions</span>
        </article>
      ))}
    </section>
  );
}
