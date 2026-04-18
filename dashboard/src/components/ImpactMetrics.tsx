import React from 'react';

export function ImpactMetrics({ impact }: { impact?: any }) {
  const metrics = [
    {
      label: 'Before MediScribe',
      value: `${impact?.manual_triage_minutes ?? 28} min`,
      detail: 'Typical manual triage and documentation cycle.'
    },
    {
      label: 'With MediScribe',
      value: `${impact?.mediscribe_triage_minutes ?? 3} min`,
      detail: 'Guided intake to safety-checked assessment target.'
    },
    {
      label: 'Time Saved',
      value: `${impact?.estimated_minutes_saved_today ?? 25} min`,
      detail: 'Estimated clinic time saved today.'
    },
    {
      label: 'Offline Success',
      value: `${Math.round((impact?.offline_success_rate ?? 1) * 100)}%`,
      detail: 'Visits that can continue without network dependency.'
    }
  ];

  return (
    <section className="impact-panel">
      <div>
        <p className="eyebrow">Before vs after</p>
        <h2>Impact story for the pitch</h2>
        <p className="muted">Use this screen in the video to show why the product matters, not just how it works.</p>
      </div>
      <div className="metrics">
        {metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
