import React from 'react';

export function SettingsPage() {
  return (
    <main>
      <h1>Settings</h1>
      <section>
        <article className="row">
          <strong>Clinic identity</strong>
          <span>Configure clinic name and rural catchment area in deployment environment variables.</span>
        </article>
        <article className="row">
          <strong>Model endpoint</strong>
          <span>Gemma/Ollama: http://localhost:11434. Backend variable: OLLAMA_API.</span>
        </article>
        <article className="row">
          <strong>Sync destination</strong>
          <span>Mobile SQLite queue syncs through /api/sync/push and /api/sync/ack.</span>
        </article>
      </section>
    </main>
  );
}
