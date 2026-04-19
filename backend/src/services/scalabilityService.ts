import { billForService, assessPreventiveHealth, parsePricingTier, pricingReadiness } from './billingService';
import { complianceReadiness, deidentifyForResearch, deletePatientData, encryptPatientData, exportPatientData, logComplianceAccess } from './complianceService';
import { continuousLearning, federatedLearning } from './federatedLearningService';
import { convertFHIRtoHL7, generateLabOrder, generatePrescription, interoperabilityReadiness, queueEHRShare, requestSpecialistConsultation, sendToNearbyPharmacy, startTeleconsultation, toFHIRCondition, toFHIRPatient, trackLabOrder, trackPrescription } from './interoperabilityService';
import { classifySymptoms, getModelDeliveryPlan, modelDeliveryRegions, modelRouterReadiness, routeToSpecializedModel } from './modelRouterService';
import { dataScalingReadiness, generateRegionalDiagnosis, getRegionalContext, regionalReadiness, shardingManager, timeSeriesAnalytics } from './regionalContextService';

export {
  assessPreventiveHealth,
  billForService,
  classifySymptoms,
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
  parsePricingTier,
  queueEHRShare,
  requestSpecialistConsultation,
  routeToSpecializedModel,
  sendToNearbyPharmacy,
  shardingManager,
  startTeleconsultation,
  timeSeriesAnalytics,
  toFHIRCondition,
  toFHIRPatient,
  trackLabOrder,
  trackPrescription
};

export function scalabilityReadinessReport() {
  return {
    ai: modelRouterReadiness(federatedLearning.status(), continuousLearning.getPerformanceMetrics()),
    data: dataScalingReadiness(),
    regional: regionalReadiness(modelDeliveryRegions()),
    integration: interoperabilityReadiness(),
    features: ['specialist network', 'telemedicine sessions', 'outbreak detection', 'preventive health scoring'],
    business: pricingReadiness(),
    security: complianceReadiness()
  };
}
