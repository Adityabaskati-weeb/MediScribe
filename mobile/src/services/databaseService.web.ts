import type { ClinicOutcome, MediScribeAssessment, PatientProfile, TreatmentRecommendation } from '../types/clinical';

type PatientRow = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  created_at: string;
};

type ConsultationRow = {
  id: string;
  patientId: string;
  chiefComplaint: string;
  symptoms: string;
  vitals: string;
  notes: string;
  status: string;
  created_at: string;
};

type DiagnosisRow = {
  id: string;
  consultationId: string;
  possibleDiagnosis1?: string;
  confidence1?: number;
  possibleDiagnosis2?: string;
  confidence2?: number;
  possibleDiagnosis3?: string;
  confidence3?: number;
  suggestedTreatment: string;
  redFlags: string;
  urgency: string;
  modelVersion: string;
  referralRequired: number;
  clinicOutcomeStatus: string;
  clinicOutcomeUpdatedAt: string;
  clinicOutcomeNote: string;
  created_at: string;
};

type TreatmentPlanRow = {
  id: string;
  diagnosisId: string;
  medication1: string;
  additionalTreatment: string;
  followUpDays: number;
  referralRequired: number;
  referralSpecialty: string;
  created_at: string;
};

type ChartImageRow = {
  id: string;
  consultationId: string;
  imagePath: string;
  extractedText: string;
  processedAt: string;
  created_at: string;
};

type SyncQueueRow = {
  id: string;
  tableType: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: string;
  createdAt: string;
  synced: number;
};

type OfflineQueueRow = {
  id: string;
  payload: string;
  created_at: string;
  synced: number;
};

type LocalDbShape = {
  patients: PatientRow[];
  consultations: ConsultationRow[];
  diagnoses: DiagnosisRow[];
  treatmentPlans: TreatmentPlanRow[];
  chartImages: ChartImageRow[];
  syncQueue: SyncQueueRow[];
  offlineQueue: OfflineQueueRow[];
};

const STORAGE_KEY = 'mediscribe.web.db.v1';

let memoryDb: LocalDbShape | null = null;

function createEmptyDb(): LocalDbShape {
  return {
    patients: [],
    consultations: [],
    diagnoses: [],
    treatmentPlans: [],
    chartImages: [],
    syncQueue: [],
    offlineQueue: []
  };
}

function getStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }
  return globalThis.localStorage;
}

function readDb(): LocalDbShape {
  if (memoryDb) {
    return memoryDb;
  }

  const storage = getStorage();
  if (!storage) {
    const fallback = createEmptyDb();
    memoryDb = fallback;
    return fallback;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const fallback = createEmptyDb();
      memoryDb = fallback;
      storage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }

    const parsed: LocalDbShape = {
      ...createEmptyDb(),
      ...JSON.parse(raw)
    };
    memoryDb = parsed;
    return parsed;
  } catch {
    const fallback = createEmptyDb();
    memoryDb = fallback;
    return fallback;
  }
}

function writeDb(db: LocalDbShape) {
  memoryDb = db;
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage write failures and keep the in-memory fallback alive.
  }
}

function replaceById<T extends { id: string }>(items: T[], next: T): T[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) {
    return [next, ...items];
  }

  const copy = [...items];
  copy[existingIndex] = next;
  return copy;
}

function sortNewest<T extends { created_at?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.created_at || left.createdAt || 0).getTime();
    const rightTime = new Date(right.created_at || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function parseJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseMedicalHistory(value: string) {
  try {
    return JSON.parse(value) as {
      known_conditions?: string[];
      pregnancy_weeks?: number;
      postpartum_days?: number;
    };
  } catch {
    return {};
  }
}

export function initializeLocalDatabase() {
  writeDb(readDb());
}

export function createPatient(patient: PatientProfile & { id?: string; name: string }) {
  const db = readDb();
  const id = patient.id || `patient-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const row: PatientRow = {
    id,
    name: patient.name,
    age: patient.age_years,
    gender: patient.gender || 'unknown',
    phone: patient.phone || '',
    address: patient.address || '',
    emergencyContact: patient.emergencyContact || '',
    medicalHistory: JSON.stringify({
      known_conditions: patient.known_conditions || [],
      pregnancy_weeks: patient.pregnancy_weeks,
      postpartum_days: patient.postpartum_days
    }),
    allergies: JSON.stringify(patient.allergies || []),
    currentMedications: JSON.stringify(patient.medications || []),
    created_at: createdAt
  };

  db.patients = replaceById(db.patients, row);
  writeDb(db);
  enqueueOfflinePayload(`patient-${id}`, { type: 'UPSERT_PATIENT', patient: { ...patient, id } });
  return { ...patient, id };
}

export function getPatient(patientId: string): Promise<PatientProfile | null> {
  const row = readDb().patients.find((item) => item.id === patientId);
  if (!row) {
    return Promise.resolve(null);
  }

  const medicalHistory = parseMedicalHistory(row.medicalHistory);
  return Promise.resolve({
    id: row.id,
    name: row.name,
    age_years: row.age,
    gender: row.gender,
    phone: row.phone,
    address: row.address,
    emergencyContact: row.emergencyContact,
    known_conditions: medicalHistory.known_conditions || [],
    pregnancy_weeks: medicalHistory.pregnancy_weeks,
    postpartum_days: medicalHistory.postpartum_days,
    allergies: parseJsonArray(row.allergies),
    medications: parseJsonArray(row.currentMedications)
  });
}

export function getAllPatients(): Promise<Array<PatientProfile & { created_at: string }>> {
  return Promise.resolve(
    sortNewest(readDb().patients).map((row) => {
      const medicalHistory = parseMedicalHistory(row.medicalHistory);
      return {
        id: row.id,
        name: row.name,
        age_years: row.age,
        gender: row.gender,
        phone: row.phone,
        address: row.address,
        emergencyContact: row.emergencyContact,
        known_conditions: medicalHistory.known_conditions || [],
        pregnancy_weeks: medicalHistory.pregnancy_weeks,
        postpartum_days: medicalHistory.postpartum_days,
        allergies: parseJsonArray(row.allergies),
        medications: parseJsonArray(row.currentMedications),
        created_at: row.created_at
      };
    })
  );
}

export function createConsultation(consultationData: {
  patientId: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals?: Record<string, unknown>;
  notes?: string;
}) {
  const db = readDb();
  const id = `consultation-${Date.now()}`;
  db.consultations = replaceById(db.consultations, {
    id,
    patientId: consultationData.patientId,
    chiefComplaint: consultationData.chiefComplaint,
    symptoms: JSON.stringify(consultationData.symptoms),
    vitals: JSON.stringify(consultationData.vitals || {}),
    notes: consultationData.notes || '',
    status: 'open',
    created_at: new Date().toISOString()
  });
  writeDb(db);
  enqueueSyncQueue('consultations', id, 'INSERT', consultationData);
  return id;
}

export function saveDiagnosis(consultationId: string, assessment: MediScribeAssessment) {
  const db = readDb();
  const id = assessment.assessment_id || `diagnosis-${Date.now()}`;
  const diagnoses = assessment.differential_diagnoses || [];
  const row: DiagnosisRow = {
    id,
    consultationId,
    possibleDiagnosis1: diagnoses[0]?.name,
    confidence1: diagnoses[0]?.confidence,
    possibleDiagnosis2: diagnoses[1]?.name,
    confidence2: diagnoses[1]?.confidence,
    possibleDiagnosis3: diagnoses[2]?.name,
    confidence3: diagnoses[2]?.confidence,
    suggestedTreatment: JSON.stringify(assessment.treatment || {}),
    redFlags: JSON.stringify(assessment.red_flags || []),
    urgency: assessment.urgency,
    modelVersion: assessment.model_source || 'gemma2:2b',
    referralRequired: ['immediate', 'emergent'].includes(assessment.urgency) ? 1 : 0,
    clinicOutcomeStatus: assessment.clinic_outcome?.status || '',
    clinicOutcomeUpdatedAt: assessment.clinic_outcome?.updated_at || '',
    clinicOutcomeNote: assessment.clinic_outcome?.note || '',
    created_at: new Date().toISOString()
  };

  db.diagnoses = replaceById(db.diagnoses, row);
  writeDb(db);
  enqueueOfflinePayload(`diagnosis-${id}`, { type: 'UPSERT_DIAGNOSIS', assessment });
  saveTreatmentPlan(id, assessment.treatment || {}, ['immediate', 'emergent'].includes(assessment.urgency));
  return { id, consultationId, assessment };
}

export function updateClinicOutcome(diagnosisId: string, outcome: ClinicOutcome) {
  const db = readDb();
  const current = db.diagnoses.find((item) => item.id === diagnosisId);
  if (!current) {
    return;
  }

  db.diagnoses = replaceById(db.diagnoses, {
    ...current,
    clinicOutcomeStatus: outcome.status,
    clinicOutcomeUpdatedAt: outcome.updated_at,
    clinicOutcomeNote: outcome.note
  });
  writeDb(db);
  enqueueOfflinePayload(`outcome-${diagnosisId}`, { type: 'UPDATE_CLINIC_OUTCOME', diagnosisId, outcome });
}

export function saveTreatmentPlan(
  diagnosisId: string,
  treatment: Partial<TreatmentRecommendation> & {
    medications?: string[];
    nonPharmacological?: string[];
    followUpInDays?: number;
  },
  referralRequired = false
) {
  const db = readDb();
  const id = `treatment-${Date.now()}`;
  const medications = treatment.medications_to_consider || treatment.medications || [];
  db.treatmentPlans = replaceById(db.treatmentPlans, {
    id,
    diagnosisId,
    medication1: medications[0] || '',
    additionalTreatment: JSON.stringify(treatment.immediate_actions || treatment.nonPharmacological || []),
    followUpDays: treatment.followUpInDays || 7,
    referralRequired: referralRequired ? 1 : 0,
    referralSpecialty: treatment.referral || '',
    created_at: new Date().toISOString()
  });
  writeDb(db);
  enqueueSyncQueue('treatmentPlans', id, 'INSERT', treatment);
  return id;
}

export function saveChartImage(consultationId: string, imagePath: string, extractedText: string) {
  const db = readDb();
  const id = `chart-${Date.now()}`;
  db.chartImages = replaceById(db.chartImages, {
    id,
    consultationId,
    imagePath,
    extractedText,
    processedAt: new Date().toISOString(),
    created_at: new Date().toISOString()
  });
  writeDb(db);
  enqueueSyncQueue('chartImages', id, 'INSERT', { consultationId, imagePath, extractedText });
  return id;
}

export function getPatientHistory(patientId?: string): Promise<Array<Record<string, unknown>>> {
  const db = readDb();
  if (!patientId) {
    return Promise.resolve(sortNewest(db.diagnoses) as Array<Record<string, unknown>>);
  }

  const consultations = db.consultations.filter((item) => item.patientId === patientId);
  const joined = consultations.map((consultation) => {
    const diagnosis = db.diagnoses.find((item) => item.consultationId === consultation.id);
    return {
      ...consultation,
      possibleDiagnosis1: diagnosis?.possibleDiagnosis1,
      possibleDiagnosis2: diagnosis?.possibleDiagnosis2,
      possibleDiagnosis3: diagnosis?.possibleDiagnosis3,
      urgency: diagnosis?.urgency,
      clinicOutcomeStatus: diagnosis?.clinicOutcomeStatus,
      clinicOutcomeUpdatedAt: diagnosis?.clinicOutcomeUpdatedAt,
      clinicOutcomeNote: diagnosis?.clinicOutcomeNote
    };
  });

  return Promise.resolve(sortNewest(joined));
}

export function enqueueOfflinePayload(id: string, payload: unknown) {
  const db = readDb();
  db.offlineQueue = replaceById(db.offlineQueue, {
    id,
    payload: JSON.stringify(payload),
    created_at: new Date().toISOString(),
    synced: 0
  });
  writeDb(db);
}

export function enqueueSyncQueue(
  tableType: string,
  recordId: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: unknown
) {
  const db = readDb();
  const id = `sync-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  db.syncQueue = replaceById(db.syncQueue, {
    id,
    tableType,
    recordId,
    operation,
    payload: JSON.stringify(payload),
    createdAt: new Date().toISOString(),
    synced: 0
  });
  writeDb(db);
}

export function getSyncQueue(): Promise<Array<{ id: string; tableType: string; recordId: string; operation: string; payload: string; createdAt: string }>> {
  return Promise.resolve(sortNewest(readDb().syncQueue.filter((item) => item.synced === 0)));
}

export function markSynced(syncId: string): Promise<void> {
  const db = readDb();
  db.syncQueue = db.syncQueue.map((item) => item.id === syncId ? { ...item, synced: 1 } : item);
  writeDb(db);
  return Promise.resolve();
}

export function getPendingOfflinePayloads(): Promise<Array<{ id: string; payload: unknown; created_at: string }>> {
  return Promise.resolve(
    sortNewest(readDb().offlineQueue.filter((item) => item.synced === 0)).map((item) => ({
      id: item.id,
      payload: JSON.parse(item.payload),
      created_at: item.created_at
    }))
  );
}

export function markOfflinePayloadsSynced(ids: string[]): Promise<void> {
  const lookup = new Set(ids);
  const db = readDb();
  db.offlineQueue = db.offlineQueue.map((item) => lookup.has(item.id) ? { ...item, synced: 1 } : item);
  writeDb(db);
  return Promise.resolve();
}

export function resetLocalDemoData() {
  writeDb(createEmptyDb());
}
