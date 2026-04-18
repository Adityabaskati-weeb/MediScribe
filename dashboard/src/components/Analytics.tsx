import React from 'react';

export function Analytics({ metrics }: { metrics: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <section className="metrics">
      {metrics.map((metric) => (
        <article className="metric" key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
          <p>{metric.detail}</p>
        </article>
      ))}
    </section>
  );
}
