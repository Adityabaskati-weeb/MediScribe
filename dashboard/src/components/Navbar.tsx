import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar({ theme, onThemeToggle }: { theme: string; onThemeToggle: () => void }) {
  return (
    <nav className="navbar">
      <strong>MediScribe Dashboard</strong>
      <Link to="/">Dashboard</Link>
      <Link to="/patients">Patients</Link>
      <Link to="/reports">Reports</Link>
      <Link to="/settings">Settings</Link>
      <button className="theme-toggle" onClick={onThemeToggle}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
    </nav>
  );
}
