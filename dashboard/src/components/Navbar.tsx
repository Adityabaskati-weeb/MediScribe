import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="navbar">
      <strong>MediScribe Dashboard</strong>
      <Link to="/">Dashboard</Link>
      <Link to="/patients">Patients</Link>
      <Link to="/reports">Reports</Link>
      <Link to="/settings">Settings</Link>
    </nav>
  );
}
