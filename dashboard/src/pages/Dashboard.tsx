import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Analytics } from '../components/Analytics';
import { DoctorReviewQueue } from '../components/DoctorReviewQueue';
import { ImpactMetrics } from '../components/ImpactMetrics';
import { fetchDashboard, fetchDemoPack, fetchEvaluationMetrics, fetchPerformanceMetrics, fetchSystemArchitecture } from '../services/api';

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [architecture, setArchitecture] = useState<any>(null);
  const [demoPack, setDemoPack] = useState<any>(null);

  useEffect(() => {
    fetchDashboard().then(setDashboard).catch(console.error);
    fetchEvaluationMetrics().then(setEvaluation).catch(console.error);
    fetchPerformanceMetrics().then(setPerformance).catch(console.error);
    fetchSystemArchitecture().then(setArchitecture).catch(console.error);
    fetchDemoPack().then(setDemoPack).catch(console.error);
  }, []);

  const reports = dashboard?.reports || {};
  const topDiagnoses = (reports.top_diagnoses || []).map((item: any) => ({ diagnosis: item.name, count: item.count }));
  const dailyConsultations = reports.daily_consultations || [];

  return (
    <main>
      <h1>Clinic Overview</h1>
      <Analytics metrics={dashboard?.metrics || []} />
      <ImpactMetrics impact={dashboard?.impact || reports?.impact} />
      <DoctorReviewQueue items={dashboard?.review_queue || reports?.review_queue || []} />

      <section className="metrics highlight">
        <article className="metric">
          <span>Diagnosis Accuracy</span>
          <strong>{evaluation ? `${Math.round(evaluation.accuracy * 100)}%` : '--'}</strong>
          <small>Scenario benchmark target: {evaluation?.targets?.accuracy || '>= 85%'}</small>
        </article>
        <article className="metric">
          <span>P95 Latency</span>
          <strong>{performance ? `${performance.p95_latency_ms}ms` : '--'}</strong>
          <small>Target: under 2 seconds for production profile</small>
        </article>
        <article className="metric">
          <span>Reliability</span>
          <strong>{performance ? `${Math.round(performance.reliability * 100)}%` : '--'}</strong>
          <small>Offline fallback and API success rate</small>
        </article>
        <article className="metric">
          <span>Cache</span>
          <strong>{architecture?.performance?.cache?.entries ?? '--'}</strong>
          <small>Frequent medical query cache entries</small>
        </article>
      </section>

      <section className="system-grid">
        <article className="chart">
          <h2>Production Architecture</h2>
          {(architecture?.architecture?.services || []).map((service: any) => (
            <div className="service-row" key={service.name}>
              <strong>{service.name}</strong>
              <span>{service.responsibility}</span>
            </div>
          ))}
        </article>
        <article className="chart">
          <h2>Hackathon Story</h2>
          {(demoPack?.story_beats || []).map((beat: string) => <p className="story-beat" key={beat}>{beat}</p>)}
        </article>
      </section>

      <section className="charts">
        <article className="chart">
          <h2>Consultations Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyConsultations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#13795b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart">
          <h2>Most Common Diagnoses</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topDiagnoses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="diagnosis" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#335f8a" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}
