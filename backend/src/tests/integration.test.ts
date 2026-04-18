import assert from 'assert';
import { analyzeIntake, markSynced, pendingSync, queueCapture, receiveSyncItems } from '../services/clinicalEngine';

const queued = queueCapture({
  source: 'voice',
  raw_text: 'Name: Asha age 58 female. Crushing chest pain radiating left arm. BP 84/56 HR 118 SpO2 91.',
  language: 'en-IN',
  offline_captured: true
});

assert.equal(queued.status, 'queued');
assert.ok(queued.intake.patient.age_years === 58);

const assessment = analyzeIntake(queued.intake);
assert.equal(assessment.urgency, 'immediate');
assert.equal(assessment.triage_category, 1);
assert.equal(assessment.differential_diagnoses[0].name, 'Acute coronary syndrome');

const accepted = receiveSyncItems([
  {
    record_id: 'local-diagnosis-1',
    operation: 'UPSERT_DIAGNOSIS',
    payload: { patient_id: assessment.patient_id, assessment_id: assessment.assessment_id }
  }
]);

assert.equal(accepted.length, 1);
assert.ok(pendingSync().some((item) => item.sync_id === accepted[0].sync_id));
assert.deepEqual(markSynced([accepted[0].sync_id]).updated, [accepted[0].sync_id]);

console.log('MediScribe integration test passed');
