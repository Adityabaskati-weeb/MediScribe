import { extractClinicalSymptoms, extractClinicalVitals } from './clinicalText';
import type { MediScribeAssessment, PatientProfile } from '../types/clinical';

export type GuardianFlag = {
  level: 'red' | 'amber' | 'green';
  title: string;
  message: string;
  action: string;
};

export type DemoCase = {
  id: string;
  title: string;
  risk: 'red' | 'amber' | 'green';
  patient: PatientProfile;
  transcript: string;
};

export const clinicDemoCases: DemoCase[] = [
  {
    id: 'airplane-maternal-emergency',
    title: 'Airplane mode emergency',
    risk: 'red',
    patient: {
      name: 'Kavita Rao',
      age_years: 31,
      gender: 'female',
      address: 'No-network antenatal camp',
      known_conditions: [],
      medications: ['iron folate'],
      allergies: [],
      pregnancy_weeks: 32
    },
    transcript: 'Complaint: pregnant woman 32 weeks with bleeding, abdominal pain and dizziness. BP 104/70 HR 112 SpO2 96. No internet in clinic.'
  },
  {
    id: 'chest-pain-shock',
    title: 'Chest pain emergency',
    risk: 'red',
    patient: {
      name: 'Sunita Devi',
      age_years: 58,
      gender: 'female',
      address: 'Rampur rural clinic',
      known_conditions: ['hypertension'],
      medications: ['amlodipine'],
      allergies: []
    },
    transcript: 'Complaint: crushing chest pain with sweating and left arm pain. BP 84/56 HR 118 SpO2 89 RR 32. Patient looks weak and short of breath.'
  },
  {
    id: 'postpartum-danger',
    title: 'Postpartum danger signs',
    risk: 'red',
    patient: {
      name: 'Asha Kumari',
      age_years: 28,
      gender: 'female',
      address: 'Block clinic maternity ward',
      known_conditions: [],
      medications: [],
      allergies: [],
      postpartum_days: 3
    },
    transcript: 'Complaint: three days postpartum with severe headache, visual changes and heavy bleeding. BP 178/112 HR 104 SpO2 96.'
  },
  {
    id: 'child-pneumonia',
    title: 'Child pneumonia risk',
    risk: 'amber',
    patient: {
      name: 'Rohan',
      age_years: 4,
      gender: 'male',
      address: 'Village outreach camp',
      known_conditions: [],
      medications: [],
      allergies: []
    },
    transcript: 'Complaint: child with fever, cough and fast breathing. Temp 39.2 HR 132 RR 38 SpO2 91. Eating less than usual.'
  },
  {
    id: 'dengue-warning',
    title: 'Dengue warning signs',
    risk: 'amber',
    patient: {
      name: 'Imran Khan',
      age_years: 19,
      gender: 'male',
      address: 'Riverside village',
      known_conditions: [],
      medications: [],
      allergies: []
    },
    transcript: 'Complaint: fever for 4 days with severe body pain, vomiting and abdominal pain. BP 102/70 HR 112 Temp 39.0 SpO2 97. Possible dengue exposure.'
  },
  {
    id: 'routine-fever',
    title: 'Routine fever and cough',
    risk: 'green',
    patient: {
      name: 'Meena Patel',
      age_years: 36,
      gender: 'female',
      address: 'Primary health subcenter',
      known_conditions: [],
      medications: [],
      allergies: []
    },
    transcript: 'Complaint: mild fever and cough for two days. BP 120/80 HR 86 Temp 37.8 SpO2 98. No chest pain, no breathing difficulty, drinking fluids.'
  }
];

export function evaluateGuardian(text: string, patient?: PatientProfile): GuardianFlag[] {
  const lower = text.toLowerCase();
  const vitals = extractClinicalVitals(text);
  const flags: GuardianFlag[] = [];

  const add = (level: GuardianFlag['level'], title: string, message: string, action: string) => {
    if (!flags.some((flag) => flag.title === title)) flags.push({ level, title, message, action });
  };

  if ((vitals.oxygen_saturation ?? 100) < 90) {
    add('red', 'Low oxygen', 'SpO2 is below 90%.', 'Refer now. Keep airway and breathing under observation.');
  }
  if ((vitals.systolic_bp ?? 999) < 90) {
    add('red', 'Shock-range blood pressure', 'Systolic BP is below 90 mmHg.', 'Lay patient flat if appropriate, repeat BP, and prepare urgent transfer.');
  }
  if ((vitals.systolic_bp ?? 0) >= 180 || (vitals.diastolic_bp ?? 0) >= 110) {
    add('red', 'Severe hypertension', 'Blood pressure is in a severe range.', 'Repeat BP, check danger signs, and escalate for same-day emergency review.');
  }
  if (/chest pain|crushing chest|left arm pain|sweating/.test(lower) && /chest|arm|sweat/.test(lower)) {
    add('red', 'Possible cardiac emergency', 'Chest pain pattern may indicate acute coronary syndrome.', 'Do not wait for AI. Start referral pathway and get ECG if available.');
  }
  if (/postpartum|pregnan/.test(lower) && /headache|visual|bleeding|seizure/.test(lower)) {
    add('red', 'Maternal danger signs', 'Pregnancy or postpartum danger signs are present.', 'Escalate immediately and prepare referral.');
  }
  if (/facial droop|slurred speech|one side|unilateral weakness|stroke/.test(lower)) {
    add('red', 'Possible stroke', 'Focal neurologic symptoms are time-sensitive.', 'Record time last known well and refer urgently.');
  }
  if (/child|infant|baby/.test(lower) && /not feeding|lethargic|blue|convulsion/.test(lower)) {
    add('red', 'Pediatric danger sign', 'Child danger signs need urgent clinician review.', 'Refer now and monitor breathing.');
  }
  if ((vitals.temperature_c ?? 0) >= 39) {
    add('amber', 'High fever', 'Temperature is high.', 'Repeat vitals, assess hydration, and review same day if persistent or worsening.');
  }
  if ((vitals.oxygen_saturation ?? 100) >= 90 && (vitals.oxygen_saturation ?? 100) < 94) {
    add('amber', 'Borderline oxygen', 'SpO2 is below normal.', 'Repeat SpO2 and assess respiratory distress.');
  }
  if (patient?.allergies?.length) {
    add('amber', 'Allergy check', `Recorded allergies: ${patient.allergies.join(', ')}.`, 'Do not suggest medicine until allergy is checked.');
  }

  return flags.length ? flags : [{ level: 'green', title: 'No immediate red flag', message: 'No danger sign was detected from the available text.', action: 'Continue guided assessment and safety-net advice.' }];
}

export function followUpQuestions(text: string, patient?: PatientProfile) {
  const lower = text.toLowerCase();
  const questions: string[] = [];
  const vitals = extractClinicalVitals(text);
  const symptoms = extractClinicalSymptoms(text);

  if (!vitals.systolic_bp) questions.push('Record blood pressure before final advice.');
  if (!vitals.oxygen_saturation) questions.push('Check oxygen saturation if a pulse oximeter is available.');
  if (!vitals.temperature_c && /fever|hot|chills/.test(lower)) questions.push('Measure temperature and fever duration.');
  if (/fever|cough|breathing|pneumonia/.test(lower)) questions.push('Ask about fast breathing, chest indrawing, and ability to drink.');
  if (/chest pain|sweating|left arm/.test(lower)) questions.push('Ask onset time, ECG availability, diabetes history, and prior heart disease.');
  if (/pregnan|postpartum/.test(lower) || patient?.gender === 'female') questions.push('Ask pregnancy/postpartum status, bleeding, severe headache, and visual symptoms.');
  if ((patient?.age_years ?? 99) < 5) questions.push('Ask caregiver about feeding, lethargy, convulsions, and urine output.');
  if (!/allerg/.test(lower) && !patient?.allergies?.length) questions.push('Confirm medicine allergies before treatment advice.');
  if (!/medicine|medication|tablet|drug/.test(lower) && !patient?.medications?.length) questions.push('Ask current medicines and recent antibiotics.');

  if (symptoms.length < 2) questions.push('Ask the patient to describe the main symptom, duration, and what makes it worse.');
  return Array.from(new Set(questions)).slice(0, 5);
}

export function buildReferralLetter({ patient, transcript, assessment }: { patient?: PatientProfile; transcript?: string; assessment?: MediScribeAssessment }) {
  const flags = evaluateGuardian(transcript || assessment?.clinical_summary || '', patient).filter((flag) => flag.level !== 'green');
  const diagnosis = assessment?.differential_diagnoses?.[0]?.name || 'Urgent clinical assessment needed';
  const treatment = assessment?.treatment;
  const urgent = assessment ? ['immediate', 'emergent'].includes(assessment.urgency) : flags.some((flag) => flag.level === 'red');
  const referralPlan = urgent ? 'Emergency transfer now' : cleanReferralText(treatment?.referral || assessment?.urgency);
  return [
    'MediScribe Handoff Summary',
    `Referral plan: ${referralPlan}`,
    `Patient: ${patient?.name || 'Unnamed patient'} | Age: ${patient?.age_years || '--'} | Sex: ${patient?.gender || 'unknown'}`,
    `Main concern: ${diagnosis}`,
    `Red flags: ${flags.length ? flags.map((flag) => flag.title).join(', ') : 'None documented'}`,
    `Vitals/notes: ${transcript || assessment?.clinical_summary || 'Not recorded'}`,
    `Actions before transfer: ${(treatment?.immediate_actions || ['Repeat vitals', 'Follow local referral protocol']).map(cleanActionText).join('; ')}`,
    'Generated by MediScribe. Decision support only; confirm with clinician and local protocol.',
    'Gemma is a trademark of Google LLC.'
  ].join('\n');
}

function cleanReferralText(referral?: string) {
  if (!referral) return 'Clinical review required';
  return referral
    .replace(/^Immediate emergency referral$/i, 'Emergency transfer now')
    .replace(/^Urgent clinician review$/i, 'Urgent clinician review today')
    .replace(/^Same-day review$/i, 'Same-day clinical review')
    .replace(/^Routine follow-up$/i, 'Routine follow-up');
}

function cleanActionText(action: string) {
  return action
    .replace(/^Arrange urgent referral\.$/i, 'Arrange transfer')
    .replace(/^Check airway, breathing, circulation\.$/i, 'Check ABCs')
    .replace(/^Move patient to monitored area if available\.$/i, 'Move patient to monitored area')
    .replace(/^Escalate to senior clinician or emergency referral pathway\.$/i, 'Escalate to clinician and transfer pathway');
}

export function medicineSafetyMessages(patient?: PatientProfile) {
  const messages: string[] = [];
  if (!patient?.age_years) messages.push('Age missing: do not show dosage until age is entered.');
  if (!patient?.weight_kg) messages.push('Weight missing: pediatric and many adult dosages need weight.');
  if (!patient?.allergies?.length) messages.push('Allergy status not confirmed.');
  if (patient?.gender === 'female' && !patient?.pregnancy_weeks && !patient?.postpartum_days) messages.push('Pregnancy/postpartum status not confirmed.');
  if (!patient?.medications?.length) messages.push('Current medicines not recorded; check interactions before advice.');
  return messages.length ? messages : ['Minimum medicine safety fields are present. Follow local protocol before dosing.'];
}
