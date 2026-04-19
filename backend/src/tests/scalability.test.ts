import assert from 'assert';
import {
  assessPreventiveHealth,
  billForService,
  continuousLearning,
  deidentifyForResearch,
  deletePatientData,
  encryptPatientData,
  exportPatientData,
  federatedLearning,
  generateLabOrder,
  generatePrescription,
  generateRegionalDiagnosis,
  getModelDeliveryPlan,
  getRegionalContext,
  queueEHRShare,
  routeToSpecializedModel,
  scalabilityReadinessReport,
  sendToNearbyPharmacy,
  shardingManager,
  startTeleconsultation,
  timeSeriesAnalytics,
  toFHIRCondition,
  toFHIRPatient,
  trackLabOrder,
  trackPrescription,
  requestSpecialistConsultation
} from '../services/scalabilityService';

const intake = {
  patient: {
    patient_id: 'patient-scale-1',
    name: 'Asha Devi',
    age_years: 58,
    gender: 'female' as const,
    known_conditions: ['hypertension'],
    medications: ['amlodipine']
  },
  chief_complaint: 'Crushing chest pain radiating to left arm with sweating',
  symptoms: ['shortness of breath', 'left arm pain'],
  vitals: { systolic_bp: 84, diastolic_bp: 56, oxygen_saturation: 89 },
  language: 'en-IN',
  offline_captured: true
};

const routed = routeToSpecializedModel(intake);
assert.equal(routed.classification.specialty, 'cardiology');
assert.equal(routed.selectedModel.id, 'mediscribe-cardio-care-e4b');
assert.equal(routed.assessment.urgency, 'immediate');

const signature = federatedLearning.signUpdate('clinic-a', [0.1, 0.2, 0.3]);
const update = federatedLearning.submitLocalUpdate({
  clinicId: 'clinic-a',
  weights: [0.1, 0.2, 0.3],
  dataSize: 100,
  metrics: { accuracy: 0.88, loss: 0.18 },
  signature
});
assert.equal(update.clinicId, 'clinic-a');
federatedLearning.submitLocalUpdate({
  clinicId: 'clinic-b',
  weights: [0.3, 0.4, 0.5],
  dataSize: 300,
  metrics: { accuracy: 0.9, loss: 0.15 }
});
const aggregated = federatedLearning.aggregateWeights();
assert.deepEqual(aggregated.aggregated, [0.25, 0.35, 0.45]);
assert.equal(federatedLearning.broadcastGlobalModel(['clinic-a']).length, 1);

const outcome = continuousLearning.recordOutcome({
  diagnosisId: routed.assessment.assessment_id,
  predictedDiagnosis: routed.assessment.differential_diagnoses[0].name,
  actualDiagnosis: 'Acute coronary syndrome',
  confidence: 0.82,
  correctness: true,
  clinicId: 'clinic-a',
  specialty: 'cardiology'
});
assert.ok(outcome.metrics.accuracy >= 0.9);
assert.equal(continuousLearning.getPerformanceMetrics({ clinicId: 'clinic-a' }).total >= 1, true);

const shard = shardingManager.planPatientPlacement('patient-scale-1', 'Asia');
assert.equal(shard.shard.region, 'Asia');
assert.ok(shardingManager.schemaPlan().length >= 4);

timeSeriesAnalytics.recordDiagnosisMetric({ clinicId: 'clinic-a', region: 'Asia', diagnosis: 'Dengue', confidence: 0.7, isCorrect: true });
timeSeriesAnalytics.recordDiagnosisMetric({ clinicId: 'clinic-b', region: 'Asia', diagnosis: 'Dengue', confidence: 0.75, isCorrect: true });
timeSeriesAnalytics.recordDiagnosisMetric({ clinicId: 'clinic-c', region: 'Asia', diagnosis: 'Dengue', confidence: 0.76, isCorrect: false });
assert.ok(timeSeriesAnalytics.getOutbreakData('Asia')[0].casesInWindow >= 3);
assert.equal(timeSeriesAnalytics.detectOutbreak('Asia')?.diseaseType, 'Dengue');

const context = getRegionalContext('hi-IN');
assert.equal(context.region, 'India');
const regional = generateRegionalDiagnosis(intake, 'en-IN', 'India');
assert.ok(regional.assessment.clinical_summary.includes('Regional context'));
const delivery = getModelDeliveryPlan('Africa');
assert.ok(delivery.edgeUrl.includes('cdn-af-south'));

const fhirPatient = toFHIRPatient(intake.patient);
assert.equal(fhirPatient.resourceType, 'Patient');
const condition = toFHIRCondition(routed.assessment);
assert.equal(condition.resourceType, 'Condition');
assert.ok(queueEHRShare(routed.assessment).hl7.includes('DG1'));

const prescription = generatePrescription(routed.assessment);
assert.equal(prescription.status, 'pending');
const pharmacyResult = sendToNearbyPharmacy(prescription.id, { lat: 12.9, lng: 77.6 });
assert.equal(pharmacyResult.prescription.status, 'sent');
assert.equal(trackPrescription(prescription.id).status, 'sent');
const labOrder = generateLabOrder(routed.assessment);
assert.equal(labOrder.priority, 'stat');
assert.equal(trackLabOrder(labOrder.id).integrationChannel, 'FHIR DiagnosticReport or lab partner REST API');

const specialist = requestSpecialistConsultation(routed.assessment);
assert.equal(specialist.specialty, 'cardiology');
const telemed = startTeleconsultation('patient-scale-1', 'doctor-1');
assert.ok(telemed.videoURL.includes(telemed.sessionId));
const preventive = assessPreventiveHealth(intake.patient);
assert.ok(preventive.riskScore > 0);

const bill = billForService('clinic-a', 550, 'clinic');
assert.equal(bill.overage, 50);
assert.equal(bill.totalDue, 125);

const deidentified = deidentifyForResearch({ name: 'Asha Devi', age: 58, gender: 'female', diagnosis: 'ACS' });
assert.equal(deidentified.ageRange, '50+');
assert.ok(!Object.prototype.hasOwnProperty.call(deidentified, 'name'));
const encrypted = encryptPatientData({ patientId: 'patient-scale-1' }, 'test-key');
assert.equal(encrypted.algorithm, 'aes-256-gcm');
assert.equal(exportPatientData('patient-scale-1').resourceType, 'Bundle');
assert.equal(deletePatientData('patient-scale-1').deleted, true);

const report = scalabilityReadinessReport();
assert.ok(report.ai.models.length >= 3);
assert.ok(report.integration.ehr.standards.includes('FHIR R4 Condition/Patient'));

console.log('Scalability enhancement test passed');
