import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Analytics } from '../components/Analytics';
import { fetchDashboard } from '../services/api';

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetchDashboard().then(setDashboard).catch(console.error);
  }, []);

  const reports = dashboard?.reports || {};
  const topDiagnoses = (reports.top_diagnoses || []).map((item: any) => ({ diagnosis: item.name, count: item.count }));
  const dailyConsultations = reports.daily_consultations || [];

  return (
    <main>
      <h1>Clinic Overview</h1>
      <Analytics metrics={dashboard?.metrics || []} />

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
