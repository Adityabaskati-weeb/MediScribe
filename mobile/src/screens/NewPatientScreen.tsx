import React from 'react';
import { PatientForm } from '../components/PatientForm';

export function NewPatientScreen() {
  return <PatientForm onSubmit={(patient) => console.log(patient)} />;
}
