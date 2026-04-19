import assert from 'assert';
import { AddressInfo } from 'net';
import { createApp } from '../app';

type JsonResponse = {
  status: number;
  body: any;
};

const previousApiKey = process.env.API_KEY;
process.env.API_KEY = 'contract-test-key';

const server = createApp().listen(0);

async function request(path: string, options: RequestInit = {}): Promise<JsonResponse> {
  const address = server.address() as AddressInfo;
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  return { status: response.status, body: await response.json() };
}

async function main() {
  const unauthorized = await request('/api/scalability/readiness');
  assert.equal(unauthorized.status, 401);
  assert.equal(unauthorized.body.success, false);

  const authHeaders = { 'x-api-key': 'contract-test-key', 'x-user-role': 'health_worker' };
  const clinicalPayload = {
    patient: {
      patient_id: 'contract-patient-1',
      name: 'Asha Devi',
      age_years: 58,
      gender: 'female',
      known_conditions: ['hypertension'],
      medications: ['amlodipine'],
      allergies: []
    },
    chief_complaint: 'Crushing chest pain with sweating',
    symptoms: ['shortness of breath', 'left arm pain'],
    vitals: { systolic_bp: 84, diastolic_bp: 56, oxygen_saturation: 89 },
    language: 'en-IN',
    offline_captured: true
  };

  const agentic = await request('/api/diagnoses/agentic', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(clinicalPayload)
  });
  assert.equal(agentic.status, 200);
  assert.equal(agentic.body.success, true);
  assert.ok(agentic.body.data.assessment);
  assert.ok(agentic.body.data.guardrails);

  const readiness = await request('/api/scalability/readiness', { headers: authHeaders });
  assert.equal(readiness.status, 200);
  assert.equal(readiness.body.success, true);
  assert.ok(readiness.body.data.ai.models.length >= 3);
  assert.ok(readiness.body.data.integration.ehr.standards.includes('FHIR R4 Condition/Patient'));

  const ehrShare = await request('/api/scalability/integration/ehr/share', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ capture: { source: 'voice', raw_text: 'Name: Asha age 58 female. Chest pain BP 84/56 SpO2 89.', language: 'en-IN' } })
  });
  assert.equal(ehrShare.status, 200);
  assert.equal(ehrShare.body.success, true);
  assert.ok(ehrShare.body.data.hl7.includes('DG1'));
  assert.equal(ehrShare.body.data.status, 'queued_for_secure_delivery');

  const deidentified = await request('/api/scalability/compliance/deidentify', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Asha Devi', age: 58, gender: 'female', diagnosis: 'Acute coronary syndrome', phone: '9999999999' })
  });
  assert.equal(deidentified.status, 200);
  assert.equal(deidentified.body.success, true);
  assert.equal(deidentified.body.data.ageRange, '50+');
  assert.ok(!Object.prototype.hasOwnProperty.call(deidentified.body.data, 'name'));

  console.log('API contract test passed');
}

main()
  .finally(() => {
    server.close();
    if (previousApiKey === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previousApiKey;
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
