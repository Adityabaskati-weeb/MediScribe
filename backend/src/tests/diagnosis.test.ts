import assert from 'assert';
import { generateDiagnosis, getFollowUpRecommendations } from '../services/analysisService';

async function testDiagnosisGeneration() {
  const diagnosis = await generateDiagnosis({
    patientAge: 58,
    gender: 'F',
    symptoms: ['crushing chest pain', 'shortness of breath', 'sweating'],
    vitals: {
      systolic_bp: 84,
      diastolic_bp: 56,
      respiratory_rate: 32,
      oxygen_saturation: 89
    },
    medicalHistory: ['hypertension'],
    medications: ['amlodipine']
  });

  assert.ok(diagnosis.primaryDiagnosis.length > 0);
  assert.ok(diagnosis.confidenceScores.length > 0);
  assert.ok(diagnosis.warningFlags.length > 0);
  assert.equal(diagnosis.referralRecommendation, true);

  const followUp = await getFollowUpRecommendations('patient-test', diagnosis);
  assert.ok(followUp.nextCheckupDate);
  assert.deepEqual(followUp.redFlags, diagnosis.warningFlags);
}

testDiagnosisGeneration()
  .then(() => console.log('Diagnosis generation test passed'))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
