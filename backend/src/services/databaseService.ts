import { initializeDatabase, pool } from '../config/database';

export async function ensureDatabaseReady() {
  await initializeDatabase();
}

export async function saveAssessment(patientExternalId: string, assessment: unknown) {
  await ensureDatabaseReady();
  const result = await pool.query(
    'INSERT INTO diagnoses (patient_external_id, assessment_json) VALUES ($1, $2) RETURNING id',
    [patientExternalId, assessment]
  );
  return result.rows[0];
}

export async function getPatientAssessments(patientExternalId: string) {
  await ensureDatabaseReady();
  const result = await pool.query(
    'SELECT * FROM diagnoses WHERE patient_external_id = $1 ORDER BY created_at DESC',
    [patientExternalId]
  );
  return result.rows;
}
