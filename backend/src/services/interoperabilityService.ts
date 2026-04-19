import { MediScribeAssessment, PatientProfile } from '../models/Clinical';
import { now, stableId } from './scalabilityShared';

interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  subject: { reference: string };
  code: { coding: Array<{ system: string; code: string; display: string }> };
  assertedDate: string;
  note: Array<{ text: string }>;
}

interface Prescription {
  id: string;
  patientId: string;
  diagnosis: string;
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  prescribedBy: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'dispensed' | 'completed';
  pharmacyIds: string[];
  qrPayload: string;
}

const SNOMED: Record<string, string> = {
  Malaria: '84387000',
  Dengue: '67924001',
  Tuberculosis: '56717001',
  'Respiratory infection': '312118003',
  Pneumonia: '233604007',
  'Acute coronary syndrome': '394659003',
  'Acute stroke or TIA': '230690007',
  'Undifferentiated primary-care presentation': '404684003'
};

const ehrOutbox: Array<{ outboxId: string; ehrSystem: string; condition: FHIRCondition; hl7: string; status: string; queuedAt: string }> = [];
const prescriptionStore: Prescription[] = [];
const labOrderStore: Array<{
  id: string;
  patientId: string;
  diagnosisId: string;
  tests: string[];
  priority: 'routine' | 'urgent' | 'stat';
  labPartnerId: string;
  status: 'ordered' | 'sample_collected' | 'result_ready';
  orderedAt: string;
  expectedTurnaroundHours: number;
}> = [];

function assessmentTopDiagnosis(assessment: MediScribeAssessment) {
  return assessment.differential_diagnoses[0]?.name || 'Undifferentiated presentation';
}

export function toFHIRPatient(patient: PatientProfile) {
  return {
    resourceType: 'Patient',
    id: patient.patient_id || stableId('patient', patient),
    name: [{ given: [(patient.name || 'Unknown').split(' ')[0]], family: (patient.name || 'Patient').split(' ').slice(1).join(' ') || 'Patient' }],
    gender: patient.gender,
    extension: [{ url: 'https://mediscribe.example/fhir/age-years', valueInteger: patient.age_years }]
  };
}

export function toFHIRCondition(assessment: MediScribeAssessment, patientId = assessment.patient_id): FHIRCondition {
  const diagnosis = assessmentTopDiagnosis(assessment);
  return {
    resourceType: 'Condition',
    id: stableId('condition', assessment.assessment_id),
    subject: { reference: `Patient/${patientId}` },
    code: { coding: [{ system: 'http://snomed.info/sct', code: SNOMED[diagnosis] || '404684003', display: diagnosis }] },
    assertedDate: assessment.created_at,
    note: [{ text: assessment.clinical_summary }]
  };
}

export function convertFHIRtoHL7(condition: FHIRCondition) {
  const coding = condition.code.coding[0];
  return `MSH|^~\\&|MediScribe|RuralClinic|HospitalEHR|Referral|${condition.assertedDate}||ORU^R01|${condition.id}|P|2.5\nPID|||${condition.subject.reference.replace('Patient/', '')}\nDG1|1||${coding.code}|${coding.display}`;
}

export function queueEHRShare(assessment: MediScribeAssessment, ehrSystem = 'demo-hospital.local') {
  const condition = toFHIRCondition(assessment);
  const item = {
    outboxId: stableId('ehr', { condition, ehrSystem }),
    ehrSystem,
    condition,
    hl7: convertFHIRtoHL7(condition),
    status: 'queued_for_secure_delivery',
    queuedAt: now()
  };
  ehrOutbox.push(item);
  return item;
}

export function generatePrescription(assessment: MediScribeAssessment, patientId = assessment.patient_id): Prescription {
  const medications = assessment.treatment.medications_to_consider.length
    ? assessment.treatment.medications_to_consider.map((name) => ({ name, dosage: 'Per local protocol', frequency: 'As clinically indicated', duration: 'Per clinician review' }))
    : [{ name: 'Safety-net advice', dosage: 'No automatic medicine', frequency: 'Review danger signs', duration: 'Until clinician decision' }];
  const prescription: Prescription = {
    id: stableId('rx', { patientId, assessmentId: assessment.assessment_id, medications }),
    patientId,
    diagnosis: assessmentTopDiagnosis(assessment),
    medications,
    prescribedBy: 'MediScribe decision support; clinician approval required',
    timestamp: now(),
    status: 'pending',
    pharmacyIds: [],
    qrPayload: ''
  };
  prescription.qrPayload = Buffer.from(JSON.stringify({ id: prescription.id, patientId, medications })).toString('base64');
  prescriptionStore.push(prescription);
  return prescription;
}

export function sendToNearbyPharmacy(prescriptionId: string, location: { lat: number; lng: number }) {
  const prescription = prescriptionStore.find((item) => item.id === prescriptionId);
  if (!prescription) throw new Error('Prescription not found');
  const pharmacies = [
    { id: 'pharmacy-primary-health-center', name: 'Primary Health Center Pharmacy', distanceKm: 1.2 },
    { id: 'pharmacy-community-01', name: 'Community Medicine Store', distanceKm: 3.8 }
  ].filter((item) => item.distanceKm <= 5);
  prescription.status = 'sent';
  prescription.pharmacyIds = pharmacies.map((item) => item.id);
  return { prescription, location, pharmacies, deliveryChannel: 'secure SMS or pharmacy API' };
}

export function trackPrescription(prescriptionId: string) {
  const prescription = prescriptionStore.find((item) => item.id === prescriptionId);
  if (!prescription) throw new Error('Prescription not found');
  return {
    prescriptionId,
    status: prescription.status,
    timeline: [
      { status: 'pending', at: prescription.timestamp },
      ...(prescription.status === 'sent' ? [{ status: 'sent', at: now() }] : [])
    ],
    nextAction: prescription.status === 'sent' ? 'Pharmacy confirms dispensing.' : 'Send to nearby pharmacy after clinician review.'
  };
}

export function generateLabOrder(assessment: MediScribeAssessment, labPartnerId = 'district-lab-network') {
  const priority: 'routine' | 'urgent' | 'stat' = assessment.urgency === 'immediate' ? 'stat' : assessment.urgency === 'emergent' || assessment.urgency === 'urgent' ? 'urgent' : 'routine';
  const order = {
    id: stableId('lab', { assessmentId: assessment.assessment_id, tests: assessment.treatment.suggested_tests }),
    patientId: assessment.patient_id,
    diagnosisId: assessment.assessment_id,
    tests: assessment.treatment.suggested_tests.length ? assessment.treatment.suggested_tests : ['Repeat vital signs', 'Focused examination'],
    priority,
    labPartnerId,
    status: 'ordered' as const,
    orderedAt: now(),
    expectedTurnaroundHours: priority === 'stat' ? 1 : priority === 'urgent' ? 6 : 24
  };
  labOrderStore.push(order);
  return order;
}

export function trackLabOrder(orderId: string) {
  const order = labOrderStore.find((item) => item.id === orderId);
  if (!order) throw new Error('Lab order not found');
  return {
    ...order,
    nextAction: order.status === 'result_ready' ? 'Attach results to diagnosis review.' : 'Lab partner updates collection and result status.',
    integrationChannel: 'FHIR DiagnosticReport or lab partner REST API'
  };
}

export function requestSpecialistConsultation(assessment: MediScribeAssessment) {
  const specialty = assessment.differential_diagnoses[0]?.name.includes('stroke') ? 'neurology'
    : assessment.differential_diagnoses[0]?.name.includes('coronary') ? 'cardiology'
      : assessment.urgency === 'routine' ? 'general' : 'emergency';
  return {
    consultationId: stableId('specialist', assessment.assessment_id),
    patientId: assessment.patient_id,
    diagnosisId: assessment.assessment_id,
    specialty,
    status: assessment.urgency === 'routine' ? 'waiting' : 'priority_queue',
    consultationFee: assessment.urgency === 'routine' ? 8 : 0,
    paymentStatus: assessment.urgency === 'routine' ? 'pending' : 'waived_emergency',
    estimatedWaitMinutes: assessment.urgency === 'routine' ? 30 : 5
  };
}

export function startTeleconsultation(patientId: string, doctorId: string) {
  const sessionId = stableId('telemed', { patientId, doctorId, date: new Date().toISOString().slice(0, 10) });
  return {
    sessionId,
    doctorId,
    patientId,
    startTime: now(),
    durationMinutes: 20,
    videoURL: `https://meet.mediscribe.example/session/${sessionId}`,
    prescriptionEnabled: true,
    chartSharingEnabled: true,
    offlineFallback: 'If video fails, referral summary is shared as low-bandwidth text.'
  };
}

export function interoperabilityReadiness() {
  return {
    ehr: { outboxItems: ehrOutbox.length, standards: ['FHIR R4 Condition/Patient', 'HL7 v2 DG1'] },
    prescriptions: { stored: prescriptionStore.length, qrEnabled: true },
    labs: { stored: labOrderStore.length, standards: ['FHIR DiagnosticReport', 'partner REST API'] }
  };
}

