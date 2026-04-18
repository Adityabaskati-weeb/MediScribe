import React, { useEffect, useState } from 'react';
import { Analytics } from '../components/Analytics';
import { fetchDashboard } from '../services/api';

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  useEffect(() => { fetchDashboard().then(setDashboard).catch(console.error); }, []);
  return (
    <main>
      <h1>Clinic Overview</h1>
      <Analytics metrics={dashboard?.metrics || []} />
    </main>
  );
}
