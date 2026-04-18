import assert from 'assert';
import { analyzeMedicalCase, translateSymptoms } from '../services/gemmaService';

async function run() {
  if (!process.env.RUN_OLLAMA_TESTS) {
    console.log('Skipping live Gemma/Ollama test. Set RUN_OLLAMA_TESTS=1 to run it.');
    return;
  }

  const result = await analyzeMedicalCase({
    patientAge: 35,
    gender: 'F',
    symptoms: ['fever', 'cough', 'fatigue'],
    vitals: { temperature: 38.5, heartRate: 92 }
  });

  assert.ok(result.primaryDiagnosis);
  assert.ok(Array.isArray(result.recommendedDiagnosticTests));
  assert.ok(await translateSymptoms('bukhar aur khansi', 'Hindi'));
  console.log('Gemma service live test passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
