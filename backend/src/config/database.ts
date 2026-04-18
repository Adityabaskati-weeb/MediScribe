import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const DATABASE_SCHEMA = `
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  name VARCHAR(160),
  age INTEGER,
  gender VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id SERIAL PRIMARY KEY,
  patient_external_id TEXT NOT NULL,
  assessment_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export async function initializeDatabase() {
  await pool.query(DATABASE_SCHEMA);
}
