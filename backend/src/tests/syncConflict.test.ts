import assert from 'assert';
import { pendingSync, receiveSyncItems } from '../services/clinicalEngine';

const firstPatientEdit = receiveSyncItems([
  {
    record_id: 'patient-conflict-1',
    operation: 'UPSERT_PATIENT',
    created_at: '2026-04-19T09:00:00.000Z',
    payload: { device_id: 'device-a', name: 'Asha Devi', age_years: 58, village: 'Rampur' }
  }
]);
assert.equal(firstPatientEdit[0].accepted, true);

const secondPatientEdit = receiveSyncItems([
  {
    record_id: 'patient-conflict-1',
    operation: 'UPSERT_PATIENT',
    created_at: '2026-04-19T09:05:00.000Z',
    payload: { device_id: 'device-b', name: 'Asha Devi', age_years: 58, village: 'Rampur Block' }
  }
]);
assert.equal(secondPatientEdit[0].accepted, true);
assert.equal(secondPatientEdit[0].conflict?.type, 'concurrent_patient_update');
assert.equal(secondPatientEdit[0].conflict?.resolution, 'last_write_wins_with_audit');

const diagnosisPayload = {
  assessment_id: 'assessment-duplicate-1',
  patient_id: 'patient-conflict-1',
  urgency: 'urgent',
  differential_diagnoses: [{ name: 'Dengue warning signs', confidence: 0.72 }]
};
const firstDiagnosis = receiveSyncItems([
  {
    record_id: 'diagnosis-duplicate-1',
    operation: 'UPSERT_DIAGNOSIS',
    created_at: '2026-04-19T09:10:00.000Z',
    payload: diagnosisPayload
  }
]);
assert.equal(firstDiagnosis[0].accepted, true);

const duplicateDiagnosis = receiveSyncItems([
  {
    record_id: 'diagnosis-duplicate-2',
    operation: 'UPSERT_DIAGNOSIS',
    created_at: '2026-04-19T09:11:00.000Z',
    payload: diagnosisPayload
  }
]);
assert.equal(duplicateDiagnosis[0].accepted, false);
assert.equal(duplicateDiagnosis[0].conflict?.type, 'duplicate_queued_diagnosis');
assert.equal(duplicateDiagnosis[0].conflict?.resolution, 'duplicate_ignored');

const review = receiveSyncItems([
  {
    record_id: 'assessment-reviewed-1',
    operation: 'DOCTOR_REVIEW',
    created_at: '2026-04-19T09:20:00.000Z',
    payload: { doctor_id: 'doctor-1', decision: 'reviewed', device_id: 'dashboard' }
  }
]);
assert.equal(review[0].accepted, true);

const staleAssessment = receiveSyncItems([
  {
    record_id: 'assessment-reviewed-1',
    operation: 'UPDATE_ASSESSMENT',
    created_at: '2026-04-19T09:15:00.000Z',
    payload: { device_id: 'device-a', clinical_summary: 'Older mobile edit before doctor review.' }
  }
]);
assert.equal(staleAssessment[0].accepted, false);
assert.equal(staleAssessment[0].conflict?.type, 'stale_assessment_update');
assert.equal(staleAssessment[0].conflict?.resolution, 'rejected_after_doctor_review');

assert.ok(pendingSync().some((item) => item.record_id === 'patient-conflict-1'));
assert.ok(!pendingSync().some((item) => item.sync_id === duplicateDiagnosis[0].sync_id));

console.log('Offline sync conflict test passed');

