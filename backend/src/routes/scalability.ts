import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  assessPreventiveHealth,
  billForService,
  continuousLearning,
  convertFHIRtoHL7,
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
  logComplianceAccess,
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
import { analyzeIntake, normalizeCapture } from '../services/clinicalEngine';
import { successResponse } from '../utils/apiResponse';

const router = Router();

router.get('/readiness', asyncHandler(async (_req, res) => {
  res.json(successResponse(scalabilityReadinessReport()));
}));

router.post('/ai/route', asyncHandler(async (req, res) => {
  res.json(successResponse(routeToSpecializedModel(req.body)));
}));

router.post('/ai/regional-diagnosis', asyncHandler(async (req, res) => {
  res.json(successResponse(generateRegionalDiagnosis(req.body.intake, req.body.locale, req.body.region)));
}));

router.get('/regional-context', asyncHandler(async (req, res) => {
  res.json(successResponse(getRegionalContext(String(req.query.locale || 'en-IN'), req.query.region ? String(req.query.region) : undefined)));
}));

router.get('/model-delivery', asyncHandler(async (req, res) => {
  res.json(successResponse(getModelDeliveryPlan(String(req.query.region || 'Asia'), String(req.query.modelId || 'mediscribe-general-e4b'))));
}));

router.post('/learning/federated/update', asyncHandler(async (req, res) => {
  res.json(successResponse(federatedLearning.submitLocalUpdate(req.body)));
}));

router.post('/learning/federated/aggregate', asyncHandler(async (_req, res) => {
  res.json(successResponse(federatedLearning.aggregateWeights()));
}));

router.post('/learning/federated/broadcast', asyncHandler(async (req, res) => {
  res.json(successResponse(federatedLearning.broadcastGlobalModel(req.body.clinicIds || [])));
}));

router.post('/learning/outcome', asyncHandler(async (req, res) => {
  res.json(successResponse(continuousLearning.recordOutcome(req.body)));
}));

router.get('/learning/metrics', asyncHandler(async (req, res) => {
  res.json(successResponse(continuousLearning.getPerformanceMetrics({
    clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
    specialty: req.query.specialty as any
  })));
}));

router.get('/data/shard/:patientId', asyncHandler(async (req, res) => {
  res.json(successResponse(shardingManager.planPatientPlacement(req.params.patientId, req.query.region ? String(req.query.region) : undefined)));
}));

router.get('/data/schema-plan', asyncHandler(async (_req, res) => {
  res.json(successResponse(shardingManager.schemaPlan()));
}));

router.post('/analytics/diagnosis-metric', asyncHandler(async (req, res) => {
  res.json(successResponse(timeSeriesAnalytics.recordDiagnosisMetric(req.body)));
}));

router.get('/analytics/outbreak/:region', asyncHandler(async (req, res) => {
  res.json(successResponse({
    trend: timeSeriesAnalytics.getOutbreakData(req.params.region),
    alert: timeSeriesAnalytics.detectOutbreak(req.params.region)
  }));
}));

router.post('/integration/fhir/patient', asyncHandler(async (req, res) => {
  res.json(successResponse(toFHIRPatient(req.body)));
}));

router.post('/integration/fhir/condition', asyncHandler(async (req, res) => {
  const assessment = req.body.assessment || analyzeIntake(normalizeCapture(req.body.capture));
  const condition = toFHIRCondition(assessment, req.body.patientId);
  res.json(successResponse({ condition, hl7: convertFHIRtoHL7(condition) }));
}));

router.post('/integration/ehr/share', asyncHandler(async (req, res) => {
  const assessment = req.body.assessment || analyzeIntake(normalizeCapture(req.body.capture));
  res.json(successResponse(queueEHRShare(assessment, req.body.ehrSystem)));
}));

router.post('/integration/prescription', asyncHandler(async (req, res) => {
  const assessment = req.body.assessment || analyzeIntake(normalizeCapture(req.body.capture));
  res.json(successResponse(generatePrescription(assessment, req.body.patientId)));
}));

router.post('/integration/lab-order', asyncHandler(async (req, res) => {
  const assessment = req.body.assessment || analyzeIntake(normalizeCapture(req.body.capture));
  res.json(successResponse(generateLabOrder(assessment, req.body.labPartnerId)));
}));

router.get('/integration/lab-order/:orderId', asyncHandler(async (req, res) => {
  res.json(successResponse(trackLabOrder(req.params.orderId)));
}));

router.post('/integration/prescription/:prescriptionId/send', asyncHandler(async (req, res) => {
  res.json(successResponse(sendToNearbyPharmacy(req.params.prescriptionId, req.body.location || { lat: 0, lng: 0 })));
}));

router.get('/integration/prescription/:prescriptionId', asyncHandler(async (req, res) => {
  res.json(successResponse(trackPrescription(req.params.prescriptionId)));
}));

router.post('/features/specialist-consultation', asyncHandler(async (req, res) => {
  const assessment = req.body.assessment || analyzeIntake(normalizeCapture(req.body.capture));
  res.json(successResponse(requestSpecialistConsultation(assessment)));
}));

router.post('/features/teleconsultation', asyncHandler(async (req, res) => {
  res.json(successResponse(startTeleconsultation(req.body.patientId, req.body.doctorId)));
}));

router.post('/features/preventive-health', asyncHandler(async (req, res) => {
  res.json(successResponse(assessPreventiveHealth(req.body.patient)));
}));

router.get('/billing/:clinicId', asyncHandler(async (req, res) => {
  res.json(successResponse(billForService(
    req.params.clinicId,
    Number(req.query.diagnosesUsed || 0),
    (req.query.tier || 'clinic') as any
  )));
}));

router.post('/compliance/deidentify', asyncHandler(async (req, res) => {
  res.json(successResponse(deidentifyForResearch(req.body)));
}));

router.get('/compliance/export/:patientId', asyncHandler(async (req, res) => {
  res.json(successResponse(exportPatientData(req.params.patientId)));
}));

router.delete('/compliance/patient/:patientId', asyncHandler(async (req, res) => {
  res.json(successResponse(deletePatientData(req.params.patientId)));
}));

router.post('/compliance/encrypt', asyncHandler(async (req, res) => {
  res.json(successResponse(encryptPatientData(req.body.data, req.body.key)));
}));

router.post('/compliance/audit', asyncHandler(async (req, res) => {
  res.json(successResponse(logComplianceAccess(req.body.patientId, req.body.userId, req.body.action, req.body.ipAddress)));
}));

export default router;
