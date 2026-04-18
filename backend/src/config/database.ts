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
  address TEXT,
  emergency_contact VARCHAR(120),
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  patient_external_id TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  symptoms JSONB NOT NULL,
  vitals JSONB,
  notes TEXT,
  status VARCHAR(30) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  patient_external_id TEXT NOT NULL,
  consultation_external_id TEXT,
  assessment_json JSONB NOT NULL,
  model_version VARCHAR(40),
  referral_required BOOLEAN DEFAULT FALSE,
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
`;

export async function initializeDatabase() {
  await pool.query(DATABASE_SCHEMA);
}
