import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mediscribe.db');

export function initializeLocalDatabase() {
  db.execSync(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY NOT NULL,
        firstName TEXT,
        lastName TEXT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT,
        phone TEXT,
        address TEXT,
        emergencyContact TEXT,
        medicalHistory TEXT,
        allergies TEXT,
        currentMedications TEXT,
        dateOfBirth TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY NOT NULL,
        patientId TEXT NOT NULL,
        chiefComplaint TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        vitals TEXT,
        notes TEXT,
        status TEXT DEFAULT 'open',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS diagnoses (
        id TEXT PRIMARY KEY NOT NULL,
        consultationId TEXT NOT NULL,
        possibleDiagnosis1 TEXT,
        confidence1 REAL,
        possibleDiagnosis2 TEXT,
        confidence2 REAL,
        possibleDiagnosis3 TEXT,
        confidence3 REAL,
        suggestedTreatment TEXT,
        redFlags TEXT,
        urgency TEXT,
        modelVersion TEXT,
        referralRequired INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS treatmentPlans (
        id TEXT PRIMARY KEY NOT NULL,
        diagnosisId TEXT NOT NULL,
        medication1 TEXT,
        dosage1 TEXT,
        frequency1 TEXT,
        duration1 TEXT,
        medication2 TEXT,
        dosage2 TEXT,
        frequency2 TEXT,
        duration2 TEXT,
        additionalTreatment TEXT,
        followUpDays INTEGER,
        referralRequired INTEGER DEFAULT 0,
        referralSpecialty TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chartImages (
        id TEXT PRIMARY KEY NOT NULL,
        consultationId TEXT NOT NULL,
        imagePath TEXT NOT NULL,
        extractedText TEXT,
        processedAt TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS syncQueue (
        id TEXT PRIMARY KEY NOT NULL,
        tableType TEXT NOT NULL,
        recordId TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT,
        createdAt TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS offline_queue (
        id TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_consultations_patientId ON consultations(patientId);
      CREATE INDEX IF NOT EXISTS idx_diagnoses_consultationId ON diagnoses(consultationId);
      CREATE INDEX IF NOT EXISTS idx_treatments_diagnosisId ON treatmentPlans(diagnosisId);
      CREATE INDEX IF NOT EXISTS idx_syncQueue_synced ON syncQueue(synced);
    `);

  runLocalMigrations();
}

function runLocalMigrations() {
  ensureColumns('patients', [
    ['id', 'TEXT'],
    ['firstName', 'TEXT'],
    ['lastName', 'TEXT'],
    ['name', 'TEXT'],
    ['age', 'INTEGER'],
    ['gender', 'TEXT'],
    ['phone', 'TEXT'],
    ['address', 'TEXT'],
    ['emergencyContact', 'TEXT'],
    ['medicalHistory', 'TEXT'],
    ['allergies', 'TEXT'],
    ['currentMedications', 'TEXT'],
    ['dateOfBirth', 'TEXT'],
    ['created_at', 'TEXT']
  ]);

  ensureColumns('consultations', [
    ['id', 'TEXT'],
    ['patientId', 'TEXT'],
    ['chiefComplaint', 'TEXT'],
    ['symptoms', 'TEXT'],
    ['vitals', 'TEXT'],
    ['notes', 'TEXT'],
    ['status', "TEXT DEFAULT 'open'"],
    ['created_at', 'TEXT']
  ]);

  ensureColumns('diagnoses', [
    ['id', 'TEXT'],
    ['consultationId', 'TEXT'],
    ['possibleDiagnosis1', 'TEXT'],
    ['confidence1', 'REAL'],
    ['possibleDiagnosis2', 'TEXT'],
    ['confidence2', 'REAL'],
    ['possibleDiagnosis3', 'TEXT'],
    ['confidence3', 'REAL'],
    ['suggestedTreatment', 'TEXT'],
    ['redFlags', 'TEXT'],
    ['urgency', 'TEXT'],
    ['modelVersion', 'TEXT'],
    ['referralRequired', 'INTEGER DEFAULT 0'],
    ['created_at', 'TEXT']
  ]);

  ensureColumns('treatmentPlans', [
    ['id', 'TEXT'],
    ['diagnosisId', 'TEXT'],
    ['medication1', 'TEXT'],
    ['dosage1', 'TEXT'],
    ['frequency1', 'TEXT'],
    ['duration1', 'TEXT'],
    ['medication2', 'TEXT'],
    ['dosage2', 'TEXT'],
    ['frequency2', 'TEXT'],
    ['duration2', 'TEXT'],
    ['additionalTreatment', 'TEXT'],
    ['followUpDays', 'INTEGER'],
    ['referralRequired', 'INTEGER DEFAULT 0'],
    ['referralSpecialty', 'TEXT'],
    ['created_at', 'TEXT']
  ]);

  ensureColumns('chartImages', [
    ['id', 'TEXT'],
    ['consultationId', 'TEXT'],
    ['imagePath', 'TEXT'],
    ['extractedText', 'TEXT'],
    ['processedAt', 'TEXT'],
    ['created_at', 'TEXT']
  ]);

  ensureColumns('syncQueue', [
    ['id', 'TEXT'],
    ['tableType', 'TEXT'],
    ['recordId', 'TEXT'],
    ['operation', 'TEXT'],
    ['payload', 'TEXT'],
    ['createdAt', 'TEXT'],
    ['synced', 'INTEGER DEFAULT 0']
  ]);

  ensureColumns('offline_queue', [
    ['id', 'TEXT'],
    ['payload', 'TEXT'],
    ['created_at', 'TEXT'],
    ['synced', 'INTEGER DEFAULT 0']
  ]);
}

function ensureColumns(tableName: string, columns: Array<[string, string]>) {
  for (const [columnName, columnType] of columns) {
    try {
      db.execSync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/duplicate column|already exists/i.test(message)) {
        console.warn(`MediScribe database migration skipped ${tableName}.${columnName}: ${message}`);
      }
    }
  }
}

export function createPatient(patient: {
  id?: string;
  name: string;
  age_years: number;
  gender?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  known_conditions?: string[];
  allergies?: string[];
  medications?: string[];
  pregnancy_weeks?: number;
  postpartum_days?: number;
}) {
  const id = patient.id || `patient-${Date.now()}`;
  db.runSync(
    `INSERT OR REPLACE INTO patients
       (id, name, age, gender, phone, address, emergencyContact, medicalHistory, allergies, currentMedications, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      patient.name,
      patient.age_years,
      patient.gender || 'unknown',
      patient.phone || '',
      patient.address || '',
      patient.emergencyContact || '',
      JSON.stringify({
        known_conditions: patient.known_conditions || [],
        pregnancy_weeks: patient.pregnancy_weeks,
        postpartum_days: patient.postpartum_days
      }),
      JSON.stringify(patient.allergies || []),
      JSON.stringify(patient.medications || []),
      new Date().toISOString()
    ]
  );
  enqueueOfflinePayload(`patient-${id}`, { type: 'UPSERT_PATIENT', patient: { ...patient, id } });
  return { ...patient, id };
}

export function getPatient(patientId: string): Promise<any | null> {
  return db.getFirstAsync('SELECT * FROM patients WHERE id = ?;', [patientId]);
}

export function getAllPatients(): Promise<any[]> {
  return db.getAllAsync('SELECT id, name, age, gender, phone, address, emergencyContact, created_at FROM patients ORDER BY created_at DESC;');
}

export function createConsultation(consultationData: {
  patientId: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals?: Record<string, unknown>;
  notes?: string;
}) {
  const id = `consultation-${Date.now()}`;
  db.runSync(
    `INSERT OR REPLACE INTO consultations
     (id, patientId, chiefComplaint, symptoms, vitals, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      consultationData.patientId,
      consultationData.chiefComplaint,
      JSON.stringify(consultationData.symptoms),
      JSON.stringify(consultationData.vitals || {}),
      consultationData.notes || '',
      new Date().toISOString()
    ]
  );
  enqueueSyncQueue('consultations', id, 'INSERT', consultationData);
  return id;
}

export function saveDiagnosis(consultationId: string, assessment: any) {
  const id = assessment.assessment_id || `diagnosis-${Date.now()}`;
  const diagnoses = assessment.differential_diagnoses || [];
  db.runSync(
    `INSERT OR REPLACE INTO diagnoses
       (id, consultationId, possibleDiagnosis1, confidence1, possibleDiagnosis2, confidence2, possibleDiagnosis3, confidence3,
        suggestedTreatment, redFlags, urgency, modelVersion, referralRequired, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      consultationId,
      diagnoses[0]?.name,
      diagnoses[0]?.confidence,
      diagnoses[1]?.name,
      diagnoses[1]?.confidence,
      diagnoses[2]?.name,
      diagnoses[2]?.confidence,
      JSON.stringify(assessment.treatment || {}),
      JSON.stringify(assessment.red_flags || []),
      assessment.urgency,
      assessment.model_source || 'gemma2:2b',
      ['immediate', 'emergent'].includes(assessment.urgency) ? 1 : 0,
      new Date().toISOString()
    ]
  );
  enqueueOfflinePayload(`diagnosis-${id}`, { type: 'UPSERT_DIAGNOSIS', assessment });
  saveTreatmentPlan(id, assessment.treatment || {}, ['immediate', 'emergent'].includes(assessment.urgency));
  return { id, consultationId, assessment };
}

export function saveTreatmentPlan(diagnosisId: string, treatment: any, referralRequired = false) {
  const id = `treatment-${Date.now()}`;
  const medications = treatment.medications_to_consider || treatment.medications || [];
  db.runSync(
    `INSERT OR REPLACE INTO treatmentPlans
     (id, diagnosisId, medication1, additionalTreatment, followUpDays, referralRequired, referralSpecialty, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      diagnosisId,
      medications[0] || '',
      JSON.stringify(treatment.immediate_actions || treatment.nonPharmacological || []),
      treatment.followUpInDays || 7,
      referralRequired ? 1 : 0,
      treatment.referral || '',
      new Date().toISOString()
    ]
  );
  enqueueSyncQueue('treatmentPlans', id, 'INSERT', treatment);
  return id;
}

export function saveChartImage(consultationId: string, imagePath: string, extractedText: string) {
  const id = `chart-${Date.now()}`;
  db.runSync(
    `INSERT OR REPLACE INTO chartImages
     (id, consultationId, imagePath, extractedText, processedAt, created_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [id, consultationId, imagePath, extractedText, new Date().toISOString(), new Date().toISOString()]
  );
  enqueueSyncQueue('chartImages', id, 'INSERT', { consultationId, imagePath, extractedText });
  return id;
}

export function getPatientHistory(patientId?: string): Promise<any[]> {
  if (!patientId) return db.getAllAsync('SELECT * FROM diagnoses ORDER BY created_at DESC;');
  return db.getAllAsync(
    `SELECT c.*, d.possibleDiagnosis1, d.possibleDiagnosis2, d.possibleDiagnosis3, d.urgency
     FROM consultations c
     LEFT JOIN diagnoses d ON c.id = d.consultationId
     WHERE c.patientId = ?
     ORDER BY c.created_at DESC;`,
    [patientId]
  );
}

export function enqueueOfflinePayload(id: string, payload: unknown) {
  db.runSync(
    'INSERT OR REPLACE INTO offline_queue (id, payload, created_at, synced) VALUES (?, ?, ?, 0);',
    [id, JSON.stringify(payload), new Date().toISOString()]
  );
}

export function enqueueSyncQueue(tableType: string, recordId: string, operation: 'INSERT' | 'UPDATE' | 'DELETE', payload: unknown) {
  const id = `sync-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  db.runSync(
    'INSERT OR REPLACE INTO syncQueue (id, tableType, recordId, operation, payload, createdAt, synced) VALUES (?, ?, ?, ?, ?, ?, 0);',
    [id, tableType, recordId, operation, JSON.stringify(payload), new Date().toISOString()]
  );
}

export function getSyncQueue(): Promise<Array<{ id: string; tableType: string; recordId: string; operation: string; payload: string; createdAt: string }>> {
  return db.getAllAsync('SELECT * FROM syncQueue WHERE synced = 0 ORDER BY createdAt ASC;');
}

export function markSynced(syncId: string): Promise<void> {
  db.runSync('UPDATE syncQueue SET synced = 1 WHERE id = ?;', [syncId]);
  return Promise.resolve();
}

export function getPendingOfflinePayloads(): Promise<Array<{ id: string; payload: unknown; created_at: string }>> {
  return db
    .getAllAsync<{ id: string; payload: string; created_at: string }>(
      'SELECT id, payload, created_at FROM offline_queue WHERE synced = 0 ORDER BY created_at ASC;'
    )
    .then((rows) => rows.map((row) => ({ id: row.id, payload: JSON.parse(row.payload), created_at: row.created_at })));
}

export function markOfflinePayloadsSynced(ids: string[]): Promise<void> {
  for (const id of ids) {
    db.runSync('UPDATE offline_queue SET synced = 1 WHERE id = ?;', [id]);
  }
  return Promise.resolve();
}
