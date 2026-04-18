import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const DATABASE_SCHEMA = `
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  first_name VARCHAR(80),
  last_name VARCHAR(80),
  name VARCHAR(160),
  age_years INTEGER,
  gender VARCHAR(20),
  phone VARCHAR(40),
  phone_number VARCHAR(40),
  address TEXT,
  emergency_contact VARCHAR(120),
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  date_of_birth DATE,
  clinic_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  patient_external_id TEXT NOT NULL,
  patient_id INTEGER,
  chief_complaint TEXT NOT NULL,
  symptoms JSONB NOT NULL,
  vitals JSONB,
  vitals_temperature DECIMAL(5, 2),
  vitals_blood_pressure VARCHAR(20),
  vitals_heart_rate INTEGER,
  vitals_respiratory_rate INTEGER,
  physical_examination TEXT,
  notes TEXT,
  status VARCHAR(30) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  patient_external_id TEXT NOT NULL,
  consultation_external_id TEXT,
  consultation_id INTEGER,
  primary_diagnosis VARCHAR(255),
  confidence_primary DECIMAL(3, 2),
  alternative_diagnosis_1 VARCHAR(255),
  confidence_alt1 DECIMAL(3, 2),
  alternative_diagnosis_2 VARCHAR(255),
  confidence_alt2 DECIMAL(3, 2),
  clinical_reasoning TEXT,
  recommended_tests TEXT,
  assessment_json JSONB NOT NULL,
  model_version VARCHAR(40),
  referral_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatments (
  id SERIAL PRIMARY KEY,
  diagnosis_id INTEGER,
  medication_name VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(50),
  availability VARCHAR(20),
  non_pharmacological TEXT,
  follow_up_days INTEGER,
  referral_recommended BOOLEAN DEFAULT FALSE,
  referral_specialty VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  sync_id TEXT UNIQUE NOT NULL,
  record_id TEXT NOT NULL,
  operation VARCHAR(40) NOT NULL,
  payload JSONB NOT NULL,
  source VARCHAR(20) NOT NULL,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_external_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_consultation ON diagnoses(consultation_external_id);
`;

export async function initializeDatabase() {
  await pool.query(DATABASE_SCHEMA);
}
