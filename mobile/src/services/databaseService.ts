import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mediscribe.db');

export function initializeLocalDatabase() {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS patients (
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
        created_at TEXT NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY NOT NULL,
        patientId TEXT NOT NULL,
        chiefComplaint TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        vitals TEXT,
        notes TEXT,
        status TEXT DEFAULT 'open',
        created_at TEXT NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS diagnoses (
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
      );`
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS offline_queue (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL, synced INTEGER DEFAULT 0);'
    );
  });
}

export function createPatient(patient: { id?: string; name: string; age_years: number; gender?: string }) {
  const id = patient.id || `patient-${Date.now()}`;
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT OR REPLACE INTO patients
       (id, name, age, gender, created_at)
       VALUES (?, ?, ?, ?, ?);`,
      [id, patient.name, patient.age_years, patient.gender || 'unknown', new Date().toISOString()]
    );
  });
  enqueueOfflinePayload(`patient-${id}`, { type: 'UPSERT_PATIENT', patient: { ...patient, id } });
  return { ...patient, id };
}

export function saveDiagnosis(consultationId: string, assessment: any) {
  const id = assessment.assessment_id || `diagnosis-${Date.now()}`;
  const diagnoses = assessment.differential_diagnoses || [];
  db.transaction((tx) => {
    tx.executeSql(
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
  });
  enqueueOfflinePayload(`diagnosis-${id}`, { type: 'UPSERT_DIAGNOSIS', assessment });
  return { id, consultationId, assessment };
}

export function getPatientHistory(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM diagnoses ORDER BY created_at DESC;',
        [],
        (_, result) => {
          const rows: any[] = [];
          for (let index = 0; index < result.rows.length; index += 1) rows.push(result.rows.item(index));
          resolve(rows);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export function enqueueOfflinePayload(id: string, payload: unknown) {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT OR REPLACE INTO offline_queue (id, payload, created_at, synced) VALUES (?, ?, ?, 0);',
      [id, JSON.stringify(payload), new Date().toISOString()]
    );
  });
}

export function getPendingOfflinePayloads(): Promise<Array<{ id: string; payload: unknown; created_at: string }>> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT id, payload, created_at FROM offline_queue WHERE synced = 0 ORDER BY created_at ASC;',
        [],
        (_, result) => {
          const rows: Array<{ id: string; payload: unknown; created_at: string }> = [];
          for (let index = 0; index < result.rows.length; index += 1) {
            const row = result.rows.item(index);
            rows.push({ id: row.id, payload: JSON.parse(row.payload), created_at: row.created_at });
          }
          resolve(rows);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export function markOfflinePayloadsSynced(ids: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ids.length === 0) {
      resolve();
      return;
    }

    db.transaction((tx) => {
      for (const id of ids) {
        tx.executeSql('UPDATE offline_queue SET synced = 1 WHERE id = ?;', [id]);
      }
    }, reject, () => resolve());
  });
}
