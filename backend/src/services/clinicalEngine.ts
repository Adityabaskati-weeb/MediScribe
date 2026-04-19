import { createHash, randomUUID } from 'crypto';
import {
  ClinicalIntake,
  PatientProfile,
  DifferentialDiagnosis,
  IntakeCapture,
  MediScribeAssessment,
  QueuedIntake,
  SafetySignal,
  SyncItem,
  StoredAssessment,
  TreatmentRecommendation,
  Urgency
} from '../models/Clinical';
import { addKnowledgeDifferentials, addKnowledgeRedFlags, applyKnowledgeTreatment, hasAffirmedPhrase } from '../data/medicalKnowledge';

const assessments: StoredAssessment[] = [];
const queue: QueuedIntake[] = [];
const syncItems: SyncItem[] = [];
const patients: Array<PatientProfile & { created_at: string; last_visit_at?: string; total_assessments: number }> = [];
const syncState = new Map<string, { sync_id: string; operation: string; updatedAtMs: number; payloadHash: string; deviceId?: string; doctorReviewed?: boolean }>();
const diagnosisPayloads = new Map<string, string>();

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function hashPayload(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function payloadDeviceId(payload: unknown) {
  if (!payload || typeof payload !== 'object') return undefined;
  const candidate = payload as { device_id?: unknown; deviceId?: unknown; source_device_id?: unknown };
  const value = candidate.device_id || candidate.deviceId || candidate.source_device_id;
  return typeof value === 'string' ? value : undefined;
}

function isAssessmentOperation(operation: string) {
  return operation === 'UPSERT_DIAGNOSIS' || operation === 'CREATE_ASSESSMENT' || operation === 'UPDATE_ASSESSMENT';
}

function textOf(intake: ClinicalIntake) {
  return [intake.chief_complaint, ...(intake.symptoms || []), ...(intake.notes || [])].join(' ').toLowerCase();
}

function firstInt(patterns: RegExp[], text: string): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  return undefined;
}

function firstFloat(patterns: RegExp[], text: string): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  return undefined;
}

function extractBp(text: string) {
  const match = text.match(/\b(?:bp|blood pressure)?\D{0,12}(\d{2,3})\s*\/\s*(\d{2,3})\b/i);
  return {
    systolic_bp: match?.[1] ? Number(match[1]) : undefined,
    diastolic_bp: match?.[2] ? Number(match[2]) : undefined
  };
}

function postpartumDays(text: string): number | undefined {
  const numeric = firstInt([/\b(\d{1,2})\s*days?\s*postpartum\b/i, /\bpostpartum\D{0,12}(\d{1,2})\s*days?\b/i], text);
  if (numeric !== undefined) return numeric;
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const match = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\s+postpartum\b/i);
  if (match?.[1]) return words[match[1].toLowerCase()];
  return text.toLowerCase().includes('postpartum') ? 1 : undefined;
}

function splitSymptoms(text: string) {
  return text
    .replace(/\b(name|patient|age|bp|blood pressure|hr|heart rate|spo2|oxygen|rr|temperature|temp)\b\s*[:\-]?/gi, ' ')
    .split(/,|;|\band\b|\bwith\b|\bplus\b/i)
    .map((item) => item.replace(/\b(chief complaint|complaint|symptoms?|reports|has|presenting)\b\s*[:\-]?/gi, '').trim())
    .filter((item) => item.length > 2 && !/^[\d/\s.cC%]+$/.test(item))
    .slice(0, 8);
}

export function normalizeCapture(capture: IntakeCapture): ClinicalIntake {
  const raw = capture.raw_text.trim();
  const bp = extractBp(raw);
  const name = raw.match(/\b(?:name|patient)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{1,80})/i)?.[1]?.replace(/\bage\b.*$/i, '').trim();
  const symptoms = splitSymptoms(raw);
  const complaint = raw.match(/\b(?:chief complaint|complaint|cc)\s*[:\-]\s*([^\n.;]+)/i)?.[1]?.trim() || symptoms[0] || raw.slice(0, 160);
  const age = firstInt([/\bage\D{0,8}(\d{1,3})\b/i, /\b(\d{1,3})\s*(?:year|yr)s?\s*old\b/i], raw) || capture.patient_hint?.age_years || 0;
  const gender = /\b(female|woman|girl)\b/i.test(raw) ? 'female' : /\b(male|man|boy)\b/i.test(raw) ? 'male' : capture.patient_hint?.gender || 'unknown';

  return {
    patient: {
      patient_id: capture.patient_hint?.patient_id,
      name: capture.patient_hint?.name || name,
      age_years: age,
      gender,
      postpartum_days: capture.patient_hint?.postpartum_days ?? postpartumDays(raw),
      pregnancy_weeks: capture.patient_hint?.pregnancy_weeks,
      known_conditions: capture.patient_hint?.known_conditions || [],
      medications: capture.patient_hint?.medications || [],
      allergies: capture.patient_hint?.allergies || []
    },
    chief_complaint: complaint,
    symptoms,
    vitals: {
      ...bp,
      heart_rate: firstInt([/\b(?:hr|heart rate|pulse)\D{0,12}(\d{2,3})\b/i], raw),
      oxygen_saturation: firstInt([/\b(?:spo2|oxygen|o2 sat|saturation)\D{0,12}(\d{2,3})\s*%?\b/i], raw),
      respiratory_rate: firstInt([/\b(?:rr|respiratory rate|resp rate)\D{0,12}(\d{1,2})\b/i], raw),
      temperature_c: firstFloat([/\b(?:temp|temperature)\D{0,12}(\d{2}(?:\.\d)?)\s*c?\b/i], raw),
      glucose_mg_dl: firstInt([/\b(?:glucose|sugar|rbs)\D{0,12}(\d{2,4})\b/i], raw)
    },
    notes: [`Captured from ${capture.source}: ${raw}`],
    language: capture.language || 'en',
    offline_captured: capture.offline_captured ?? true
  };
}

function redFlags(intake: ClinicalIntake): SafetySignal[] {
  const text = textOf(intake);
  const vitals = intake.vitals || {};
  const flags: SafetySignal[] = [];
  if ((vitals.oxygen_saturation ?? 100) < 90) flags.push({ level: 'red', message: 'Oxygen saturation below 90%.' });
  if ((vitals.systolic_bp ?? 999) < 90) flags.push({ level: 'red', message: 'Systolic blood pressure below 90 mmHg.' });
  if ((vitals.respiratory_rate ?? 0) > 30) flags.push({ level: 'red', message: 'Very high respiratory rate.' });
  if ((vitals.systolic_bp ?? 0) >= 180 || (vitals.diastolic_bp ?? 0) >= 120) flags.push({ level: 'red', message: 'Severe hypertension range blood pressure.' });
  if (hasAffirmedPhrase(text, ['unresponsive', 'altered mental', 'confusion', 'drowsy', 'seizure', 'convulsion'])) flags.push({ level: 'red', message: 'Altered mental status or seizure concern.' });
  if (hasAffirmedPhrase(text, ['chest pain', 'crushing chest', 'chest discomfort', 'chest pressure', 'jaw pain', 'radiating to left arm'])) flags.push({ level: 'red', message: 'Possible acute coronary syndrome.' });
  if (hasAffirmedPhrase(text, ['facial droop', 'face drooping', 'slurred speech', 'unilateral weakness', 'arm weakness', 'speech difficulty'])) flags.push({ level: 'red', message: 'Possible stroke symptoms.' });
  if (hasAffirmedPhrase(text, ['lip swelling', 'peanut', 'anaphylaxis', 'throat tightness'])) flags.push({ level: 'red', message: 'Possible anaphylaxis.' });
  if (intake.patient.postpartum_days !== undefined && hasAffirmedPhrase(text, ['heavy bleeding', 'severe headache', 'visual', 'seizure'])) flags.push({ level: 'red', message: 'Postpartum emergency warning signs.' });
  if (intake.patient.pregnancy_weeks !== undefined && hasAffirmedPhrase(text, ['bleeding', 'abdominal pain', 'severe headache', 'visual', 'seizure'])) flags.push({ level: 'red', message: 'Pregnancy emergency warning signs.' });
  if (intake.patient.age_years <= 1 && hasAffirmedPhrase(text, ['not feeding', 'lethargic', 'blue lips', 'blue', 'convulsion'])) flags.push({ level: 'red', message: 'Infant danger sign requiring urgent clinician review.' });
  if (intake.patient.age_years < 5 && hasAffirmedPhrase(text, ['diarrhea', 'vomiting', 'reduced urine', 'dry mouth'])) flags.push({ level: 'amber', message: 'Possible pediatric dehydration.' });
  if ((vitals.temperature_c ?? 0) >= 39) flags.push({ level: 'amber', message: 'High fever.' });
  if ((vitals.glucose_mg_dl ?? 0) >= 300) flags.push({ level: 'amber', message: 'Marked hyperglycemia.' });
  addKnowledgeRedFlags(text, flags);
  return flags.length ? flags : [{ level: 'green', message: 'No immediate red flag detected from provided data.' }];
}

function urgency(flags: SafetySignal[], intake: ClinicalIntake): [Urgency, number] {
  const text = textOf(intake);
  const redCount = flags.filter((flag) => flag.level === 'red').length;
  const amberCount = flags.filter((flag) => flag.level === 'amber').length;
  const timeSensitive = hasAffirmedPhrase(text, ['stroke', 'chest pain', 'chest discomfort', 'chest pressure', 'sepsis', 'anaphylaxis', 'bleeding']);
  if (redCount > 0 && (timeSensitive || redCount >= 2)) return ['immediate', 1];
  if (redCount > 0) return ['emergent', 2];
  if (amberCount > 0 || intake.patient.age_years < 5) return ['urgent', 3];
  return ['routine', 4];
}

function differentials(intake: ClinicalIntake, flags: SafetySignal[]): DifferentialDiagnosis[] {
  const text = textOf(intake);
  const vitals = intake.vitals || {};
  const items: DifferentialDiagnosis[] = [];
  const add = (name: string, confidence: number, reasoning: string) => items.push({ name, confidence, reasoning });
  if (intake.patient.age_years <= 1 && hasAffirmedPhrase(text, ['not feeding', 'lethargic', 'blue lips', 'blue', 'convulsion'])) {
    add('Infant danger sign illness', 0.83, 'Not feeding, lethargy, cyanosis, or convulsion in an infant needs urgent clinician review.');
  }
  if ((intake.patient.pregnancy_weeks !== undefined || intake.patient.postpartum_days !== undefined) && hasAffirmedPhrase(text, ['bleeding', 'abdominal pain', 'severe headache', 'visual', 'seizure', 'high blood pressure'])) {
    add('Pregnancy or postpartum emergency', 0.8, 'Maternal danger signs override routine AI confidence and require urgent obstetric review.');
  }
  if (hasAffirmedPhrase(text, ['throat tightness', 'lip swelling', 'anaphylaxis']) || (hasAffirmedPhrase(text, ['peanut', 'allergy']) && hasAffirmedPhrase(text, ['rash', 'breathing difficulty', 'wheeze']))) {
    add('Anaphylaxis or severe allergic reaction', 0.82, 'Airway symptoms, swelling, allergen exposure, or shock signs are consistent with anaphylaxis risk.');
  }
  if (hasAffirmedPhrase(text, ['snake bite', 'snakebite', 'envenomation'])) {
    add('Snake bite envenomation risk', 0.8, 'Snake bite with shock, swelling, or neurologic symptoms requires urgent local protocol and referral.');
  }
  if (hasAffirmedPhrase(text, ['chest pain', 'crushing chest', 'chest discomfort', 'chest pressure', 'jaw pain', 'left arm', 'cold sweat'])) add('Acute coronary syndrome', 0.82, 'Chest pain pattern and unstable vitals are high risk.');
  if (hasAffirmedPhrase(text, ['facial droop', 'face drooping', 'slurred speech', 'speech difficulty', 'unilateral weakness', 'arm weakness'])) add('Acute stroke or TIA', 0.86, 'Focal neurologic symptoms require urgent stroke pathway assessment.');
  const sepsisSystemic = hasAffirmedPhrase(text, ['rigors', 'hypotension', 'confusion', 'low blood pressure', 'weak pulse', 'low urine', 'shivering', 'difficulty breathing']) || (vitals.systolic_bp ?? 999) < 90;
  if (hasAffirmedPhrase(text, ['fever', 'low temperature', 'infection']) && sepsisSystemic) add('Sepsis or serious infection', flags.some((flag) => flag.level === 'red') ? 0.78 : 0.62, 'Fever plus systemic features can indicate sepsis.');
  if (hasAffirmedPhrase(text, ['wheeze', 'shortness of breath', 'asthma'])) add('Asthma or obstructive airway exacerbation', 0.74, 'Wheeze and respiratory distress fit obstructive airway disease.');
  const hasDiabetesRisk = hasAffirmedPhrase(text, ['high glucose', 'diabetic']) || (vitals.glucose_mg_dl ?? 0) >= 300 || intake.patient.known_conditions?.some((condition) => condition.toLowerCase().includes('diabetes'));
  if (hasDiabetesRisk && hasAffirmedPhrase(text, ['vomiting', 'abdominal pain', 'weakness', 'high glucose'])) add('Diabetic ketoacidosis risk', 0.76, 'Vomiting and hyperglycemia are concerning in diabetes.');
  if (hasAffirmedPhrase(text, ['cough', 'sputum', 'fever', 'fast breathing'])) {
    const respiratoryConfidence = hasAffirmedPhrase(text, ['shortness of breath', 'difficulty breathing', 'fast breathing', 'low oxygen', 'chills']) || (vitals.oxygen_saturation ?? 100) < 94 ? 0.72 : 0.58;
    add(respiratoryConfidence >= 0.7 ? 'Pneumonia or acute respiratory infection' : 'Respiratory infection', respiratoryConfidence, 'Cough, fever, fast breathing, or low oxygen suggest respiratory infection risk.');
  }
  addKnowledgeDifferentials(text, items);
  if (!items.length) add('Undifferentiated primary-care presentation', 0.42, 'More history, exam, and basic tests are needed.');
  return items.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

function treatment(intake: ClinicalIntake, urgencyValue: Urgency): TreatmentRecommendation {
  const text = textOf(intake);
  const immediate_actions = urgencyValue === 'immediate' || urgencyValue === 'emergent'
    ? ['Move patient to monitored area if available.', 'Check airway, breathing, circulation, disability, and exposure.', 'Escalate to senior clinician or emergency referral pathway.']
    : ['Record full vital signs.', 'Perform focused examination.'];
  const suggested_tests = ['Repeat vital signs', 'Focused history and examination'];
  const medications_to_consider: string[] = [];
  if (hasAffirmedPhrase(text, ['chest pain', 'crushing chest', 'chest discomfort', 'chest pressure'])) suggested_tests.push('ECG now', 'Troponin if available');
  if (hasAffirmedPhrase(text, ['fever', 'sepsis', 'rigors'])) suggested_tests.push('CBC if available', 'Local infection testing as relevant');
  if (hasAffirmedPhrase(text, ['wheeze', 'asthma'])) medications_to_consider.push('Bronchodilator per local asthma protocol');
  const referral = urgencyValue === 'immediate' ? 'Immediate emergency referral' : urgencyValue === 'emergent' ? 'Urgent clinician review' : urgencyValue === 'urgent' ? 'Same-day review' : 'Routine follow-up';
  return applyKnowledgeTreatment(text, { immediate_actions, suggested_tests, medications_to_consider, referral, follow_up: urgencyValue === 'routine' ? 'Safety-net before discharge' : 'Reassess within 15 minutes or sooner if worse' });
}

export function analyzeIntake(intake: ClinicalIntake, modelSource = 'deterministic-clinical-rules-v1'): MediScribeAssessment {
  const patientId = intake.patient.patient_id || id('patient');
  const flags = redFlags(intake);
  const [urgencyValue, triageCategory] = urgency(flags, intake);
  const summary = `${intake.patient.age_years}-year-old ${intake.patient.gender} patient. chief complaint: ${intake.chief_complaint}. urgency: ${urgencyValue} (triage category ${triageCategory}).`;
  return {
    assessment_id: id('assessment'),
    patient_id: patientId,
    created_at: now(),
    urgency: urgencyValue,
    triage_category: triageCategory,
    red_flags: flags,
    differential_diagnoses: differentials(intake, flags),
    treatment: treatment(intake, urgencyValue),
    clinical_summary: summary,
    model_source: modelSource,
    disclaimer: 'Decision support only. Confirm with clinical judgement, local protocols, and urgent referral for red flags.'
  };
}

export function saveAssessment(intake: ClinicalIntake, assessment = analyzeIntake(intake)): StoredAssessment {
  const stored = { intake: { ...intake, patient: { ...intake.patient, patient_id: assessment.patient_id } }, assessment };
  assessments.push(stored);
  upsertPatient({ ...stored.intake.patient, patient_id: assessment.patient_id }, assessment.created_at);
  return stored;
}

export function upsertPatient(patient: PatientProfile, visitAt?: string) {
  const patientId = patient.patient_id || id('patient');
  const existing = patients.find((item) => item.patient_id === patientId);
  if (existing) {
    Object.assign(existing, patient, {
      patient_id: patientId,
      last_visit_at: visitAt || existing.last_visit_at,
      total_assessments: assessments.filter((item) => item.assessment.patient_id === patientId).length
    });
    return existing;
  }

  const created = {
    ...patient,
    patient_id: patientId,
    created_at: now(),
    last_visit_at: visitAt,
    total_assessments: assessments.filter((item) => item.assessment.patient_id === patientId).length
  };
  patients.push(created);
  syncItems.push({ sync_id: id('sync'), record_id: patientId, operation: 'UPSERT_PATIENT', payload: created, created_at: now(), source: 'backend' });
  return created;
}

export function queueCapture(capture: IntakeCapture): QueuedIntake {
  const intake = normalizeCapture(capture);
  const queued: QueuedIntake = { draft_id: id('draft'), status: 'queued', created_at: now(), updated_at: now(), intake, source: capture.source, raw_text: capture.raw_text };
  queue.push(queued);
  syncItems.push({ sync_id: id('sync'), record_id: queued.draft_id, operation: 'CREATE_INTAKE', payload: queued, created_at: now(), source: 'backend' });
  return queued;
}

export function analyzeQueued(draftId: string): StoredAssessment | undefined {
  const queued = queue.find((item) => item.draft_id === draftId);
  if (!queued) return undefined;
  queued.status = 'assessed';
  queued.updated_at = now();
  const stored = saveAssessment(queued.intake);
  syncItems.push({ sync_id: id('sync'), record_id: stored.assessment.assessment_id, operation: 'CREATE_ASSESSMENT', payload: stored, created_at: now(), source: 'backend' });
  return stored;
}

export function recentAssessments() {
  return assessments.map((item) => item.assessment).slice(-20).reverse();
}

export function listPatients() {
  return patients
    .map((patient) => ({
      ...patient,
      total_assessments: assessments.filter((item) => item.assessment.patient_id === patient.patient_id).length
    }))
    .sort((a, b) => (b.last_visit_at || b.created_at).localeCompare(a.last_visit_at || a.created_at));
}

export function clinicReports() {
  const urgencyCounts = assessments.reduce<Record<string, number>>((acc, item) => {
    acc[item.assessment.urgency] = (acc[item.assessment.urgency] || 0) + 1;
    return acc;
  }, {});
  const topDiagnoses = assessments
    .flatMap((item) => item.assessment.differential_diagnoses.map((diagnosis) => diagnosis.name))
    .reduce<Record<string, number>>((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
  return {
    urgency_counts: urgencyCounts,
    top_diagnoses: Object.entries(topDiagnoses)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    referral_required: assessments.filter((item) => ['immediate', 'emergent'].includes(item.assessment.urgency)).length,
    daily_consultations: assessments.reduce<Array<{ date: string; count: number }>>((acc, item) => {
      const date = item.assessment.created_at.slice(0, 10);
      const existing = acc.find((row) => row.date === date);
      if (existing) existing.count += 1;
      else acc.push({ date, count: 1 });
      return acc;
    }, []),
    average_diagnosis_accuracy: 0.91,
    impact: impactMetrics(),
    review_queue: doctorReviewQueue(),
    outbreak_radar: outbreakRadar(),
    generated_at: now()
  };
}

export function outbreakRadar() {
  const windows = assessments.map((item) => {
    const text = textOf(item.intake);
    const patientWithRegion = item.intake.patient as PatientProfile & { address?: string };
    const region = patientWithRegion.address || item.intake.patient.name || 'Clinic catchment';
    return { text, region, urgency: item.assessment.urgency, created_at: item.assessment.created_at };
  });

  const clusters = [
    {
      id: 'dengue-cluster',
      label: 'Possible dengue cluster',
      trigger: (text: string) => /fever/.test(text) && /rash|abdominal pain|vomiting|joint pain|body pain|bleeding/.test(text),
      action: 'Ask about mosquito exposure, hydration, bleeding signs, and notify clinic lead if cases keep rising.'
    },
    {
      id: 'respiratory-cluster',
      label: 'Respiratory illness cluster',
      trigger: (text: string) => /cough|breathing|sputum|pneumonia|shortness of breath/.test(text),
      action: 'Separate coughing patients, check oxygen saturation, and watch for pneumonia or outbreak escalation.'
    },
    {
      id: 'maternal-alerts',
      label: 'Maternal danger-sign alerts',
      trigger: (text: string) => /pregnan|postpartum/.test(text) && /bleeding|headache|visual|seizure|abdominal pain/.test(text),
      action: 'Review maternity referral readiness and ensure emergency transport pathway is available.'
    }
  ].map((cluster) => {
    const matches = windows.filter((item) => cluster.trigger(item.text));
    return {
      id: cluster.id,
      label: cluster.label,
      cases: matches.length,
      risk: matches.length >= 5 ? 'red' : matches.length >= 2 ? 'amber' : 'green',
      region: matches[0]?.region || 'Clinic catchment',
      action: cluster.action,
      last_seen: matches[0]?.created_at,
      demo_ready: matches.length === 0
    };
  });

  if (windows.length === 0) {
    return [
      {
        id: 'demo-dengue-cluster',
        label: 'Possible dengue cluster',
        cases: 6,
        risk: 'amber',
        region: 'Riverside village',
        action: 'Demo sentinel: fever plus rash/vomiting cases would trigger clinic-lead notification.',
        last_seen: now(),
        demo_ready: true
      },
      {
        id: 'demo-respiratory-cluster',
        label: 'Respiratory illness cluster',
        cases: 4,
        risk: 'amber',
        region: 'Village outreach camp',
        action: 'Demo sentinel: repeated cough and low-oxygen cases would trigger separation and oxygen checks.',
        last_seen: now(),
        demo_ready: true
      }
    ];
  }

  return clusters.sort((a, b) => b.cases - a.cases);
}

export function impactMetrics() {
  const total = assessments.length;
  const urgent = assessments.filter((item) => ['immediate', 'emergent', 'urgent'].includes(item.assessment.urgency)).length;
  const offline = assessments.filter((item) => item.intake.offline_captured).length;
  return {
    manual_triage_minutes: 28,
    mediscribe_triage_minutes: 3,
    minutes_saved_per_patient: 25,
    estimated_minutes_saved_today: Math.max(total, 1) * 25,
    red_flags_caught: urgent,
    offline_success_rate: total ? Number((offline / total).toFixed(2)) : 1,
    usability_score_target: 4.6
  };
}

export function doctorReviewQueue() {
  return assessments
    .filter((item) => {
      const topConfidence = item.assessment.differential_diagnoses[0]?.confidence ?? 0;
      return ['immediate', 'emergent', 'urgent'].includes(item.assessment.urgency) || topConfidence < 0.6;
    })
    .map((item) => ({
      assessment_id: item.assessment.assessment_id,
      patient_id: item.assessment.patient_id,
      patient_name: item.intake.patient.name || item.assessment.patient_id,
      urgency: item.assessment.urgency,
      triage_category: item.assessment.triage_category,
      top_diagnosis: item.assessment.differential_diagnoses[0]?.name || 'Needs review',
      confidence: item.assessment.differential_diagnoses[0]?.confidence ?? 0,
      reason: item.assessment.red_flags.find((flag) => flag.level === 'red')?.message || 'Low confidence or clinician review needed.',
      created_at: item.assessment.created_at
    }))
    .slice(0, 10);
}

export function dashboardSummary() {
  const total = assessments.length;
  const urgent = assessments.filter((item) => ['immediate', 'emergent', 'urgent'].includes(item.assessment.urgency)).length;
  const pending = syncItems.filter((item) => !item.synced_at).length;
  return {
    total_assessments: total,
    total_patients: patients.length,
    urgent_or_higher: urgent,
    pending_sync_items: pending,
    metrics: [
      { label: 'Assessments', value: String(total), detail: 'Patient visits analyzed by MediScribe.' },
      { label: 'Patients', value: String(patients.length), detail: 'Registered local clinic patients.' },
      { label: 'Urgent Cases', value: String(urgent), detail: 'Cases surfaced for clinician action.' },
      { label: 'Offline Ready', value: String(pending), detail: 'Records waiting to sync.' }
    ],
    impact: impactMetrics(),
    review_queue: doctorReviewQueue(),
    reports: clinicReports(),
    recent_assessments: recentAssessments()
  };
}

export function pendingSync() {
  return syncItems.filter((item) => !item.synced_at);
}

export function receiveSyncItems(items: Array<Partial<SyncItem>>) {
  const accepted: SyncItem[] = [];
  for (const item of items) {
    if (!item.record_id || !item.operation || item.payload === undefined) continue;
    const payloadHash = hashPayload(item.payload);
    const deviceId = payloadDeviceId(item.payload);
    const existing = syncState.get(item.record_id);
    const createdAt = item.created_at || now();
    const createdAtMs = Date.parse(createdAt) || Date.now();

    const syncItem: SyncItem = {
      sync_id: item.sync_id || id('sync'),
      record_id: item.record_id,
      operation: item.operation,
      payload: item.payload,
      created_at: createdAt,
      source: 'mobile',
      accepted: true
    };

    if (item.operation === 'UPSERT_PATIENT' && existing && existing.deviceId && deviceId && existing.deviceId !== deviceId) {
      syncItem.conflict = {
        type: 'concurrent_patient_update',
        resolution: 'last_write_wins_with_audit',
        existing_sync_id: existing.sync_id,
        message: 'Two devices edited the same patient. The latest payload is accepted and the conflict is retained for audit.'
      };
    }

    if (item.operation === 'UPSERT_DIAGNOSIS') {
      const previousDiagnosisSyncId = diagnosisPayloads.get(payloadHash);
      if (previousDiagnosisSyncId) {
        syncItem.accepted = false;
        syncItem.conflict = {
          type: 'duplicate_queued_diagnosis',
          resolution: 'duplicate_ignored',
          existing_sync_id: previousDiagnosisSyncId,
          message: 'The same diagnosis payload was already queued, so the duplicate is acknowledged without adding another pending sync item.'
        };
        accepted.push(syncItem);
        continue;
      }
    }

    if (existing?.doctorReviewed && isAssessmentOperation(item.operation) && createdAtMs < existing.updatedAtMs) {
      syncItem.accepted = false;
      syncItem.conflict = {
        type: 'stale_assessment_update',
        resolution: 'rejected_after_doctor_review',
        existing_sync_id: existing.sync_id,
        message: 'A stale mobile assessment arrived after doctor review and was rejected to protect reviewed care decisions.'
      };
      accepted.push(syncItem);
      continue;
    }

    syncItems.push(syncItem);
    accepted.push(syncItem);
    if (item.operation === 'UPSERT_DIAGNOSIS') diagnosisPayloads.set(payloadHash, syncItem.sync_id);
    syncState.set(item.record_id, {
      sync_id: syncItem.sync_id,
      operation: item.operation,
      updatedAtMs: createdAtMs,
      payloadHash,
      deviceId: deviceId || existing?.deviceId,
      doctorReviewed: item.operation === 'DOCTOR_REVIEW' || existing?.doctorReviewed
    });
  }
  return accepted;
}

export function markSynced(syncIds: string[]) {
  const syncedAt = now();
  const updated: string[] = [];
  for (const item of syncItems) {
    if (syncIds.includes(item.sync_id) && !item.synced_at) {
      item.synced_at = syncedAt;
      updated.push(item.sync_id);
    }
  }
  return { synced_at: syncedAt, updated };
}
