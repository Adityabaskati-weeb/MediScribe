import React from 'react';
import { PatientForm } from '../components/PatientForm';
import type { ScreenName } from '../App';
import { createPatient } from '../services/databaseService';

export function NewPatientScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
  return <PatientForm onSubmit={(patient) => {
    createPatient(patient);
    onNavigate('diagnosis');
  }} />;
}
