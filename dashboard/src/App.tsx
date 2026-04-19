import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/Dashboard';
import { PatientsPage } from './pages/Patients';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import './styles/App.css';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('mediscribe.dashboard.theme') || 'light');

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('mediscribe.dashboard.theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Navbar theme={theme} onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
