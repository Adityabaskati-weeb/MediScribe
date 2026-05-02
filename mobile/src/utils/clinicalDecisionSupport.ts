import { extractClinicalSymptoms, extractClinicalVitals } from './clinicalText';
import type {
  ClinicalVitals,
  DemoMode,
  GuidelineCitation,
  MediScribeAssessment,
  PatientProfile,
  ReferralHandoff
} from '../types/clinical';

export type GuardianFlag = {
  level: 'red' | 'amber' | 'green';
  title: string;
  message: string;
  action: string;
};

export type DemoCase = {
  id: string;
  title: string;
  story: string;
  risk: 'red' | 'amber' | 'green';
  hero?: boolean;
  language?: string;
  demoMode?: DemoMode;
  expectedTrackStrength?: string[];
  patient: PatientProfile;
  transcript: string;
};

export const clinicDemoCases: DemoCase[] = [
  {
    id: 'airplane-maternal-emergency',
    title: 'Airplane mode emergency',
    story: 'A rural health worker catches maternal bleeding danger signs offline and prepares transfer before sync.',
    risk: 'red',
    hero: true,
    language: 'Hindi',
    demoMode: 'offline',
    expectedTrackStrength: ['health', 'ollama', 'safety', 'inclusivity'],
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
    id: 'stroke-fast-track',
    title: 'Golden-hour stroke rescue',
    story: 'One-sided weakness and slurred speech trigger rapid escalation, last-known-well capture, and faster transfer.',
    risk: 'red',
    hero: true,
    language: 'Hindi',
    demoMode: 'local-ai',
    expectedTrackStrength: ['health', 'ollama', 'safety', 'inclusivity'],
    patient: {
      name: 'Kamala Devi',
      age_years: 61,
      gender: 'female',
      address: 'Highway village clinic',
      known_conditions: ['hypertension'],
      medications: ['amlodipine'],
      allergies: []
    },
    transcript: 'Complaint: facial droop and slurred speech with right arm weakness. BP 188/104 HR 96 Glucose 116. Symptoms started about 45 minutes ago while eating breakfast.'
  },
  {
    id: 'chest-pain-shock',
    title: 'Chest pain emergency',
    story: 'Shock-range vitals and chest pain trigger immediate cardiac escalation in a crowded clinic.',
    risk: 'red',
    language: 'Hindi',
    demoMode: 'local-ai',
    expectedTrackStrength: ['health', 'ollama', 'safety'],
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
    story: 'Postpartum headache, severe hypertension, and bleeding surface a maternal referral path fast.',
    risk: 'red',
    language: 'Hindi',
    demoMode: 'offline',
    expectedTrackStrength: ['health', 'safety', 'inclusivity'],
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
    story: 'A child respiratory case highlights oxygen, feeding, and same-day escalation cues.',
    risk: 'amber',
    language: 'Hindi',
    demoMode: 'local-ai',
    expectedTrackStrength: ['health', 'inclusivity'],
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
    story: 'Fever plus abdominal pain and vomiting raise concern for severe febrile illness needing close review.',
    risk: 'amber',
    demoMode: 'local-ai',
    expectedTrackStrength: ['health'],
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
    story: 'A routine primary-care visit stays structured and safe without over-referring.',
    risk: 'green',
    demoMode: 'local-ai',
    expectedTrackStrength: ['health'],
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

export function buildTranscriptFromIntake({
  chief_complaint,
  symptoms,
  vitals,
  notes
}: {
  chief_complaint: string;
  symptoms?: string[];
  vitals?: ClinicalVitals;
  notes?: string[];
}) {
  const vitalSnippets: string[] = [];
  if (vitals?.systolic_bp || vitals?.diastolic_bp) {
    vitalSnippets.push(`BP ${vitals?.systolic_bp || '--'}/${vitals?.diastolic_bp || '--'}`);
  }
  if (vitals?.heart_rate) vitalSnippets.push(`HR ${vitals.heart_rate}`);
  if (vitals?.oxygen_saturation) vitalSnippets.push(`SpO2 ${vitals.oxygen_saturation}`);
  if (vitals?.respiratory_rate) vitalSnippets.push(`RR ${vitals.respiratory_rate}`);
  if (vitals?.temperature_c) vitalSnippets.push(`Temp ${vitals.temperature_c}`);
  if (vitals?.glucose_mg_dl) vitalSnippets.push(`Glucose ${vitals.glucose_mg_dl}`);

  return [
    `Complaint: ${chief_complaint}.`,
    symptoms?.length ? `Symptoms: ${symptoms.join(', ')}.` : '',
    vitalSnippets.length ? `${vitalSnippets.join(' ')}.` : '',
    notes?.length ? notes.join(' ') : ''
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type WorkflowId =
  | 'maternal-emergency'
  | 'stroke-fast-track'
  | 'cardiac-emergency'
  | 'child-respiratory'
  | 'sepsis-escalation'
  | 'general-triage';

type CitationTemplate = Omit<GuidelineCitation, 'why_it_applies'>;

const LOCAL_GUIDELINES: Record<string, CitationTemplate> = {
  'who-emergency-care-overview': {
    id: 'who-emergency-care-overview',
    title: 'Emergency and critical care',
    organization: 'World Health Organization',
    url: 'https://www.who.int/health-topics/emergency-care',
    updated_at: '2026-04',
    summary: 'WHO frames emergency care as the time-sensitive first-contact platform for acutely ill patients, including strokes, sepsis, heart attacks, and obstetric emergencies.'
  },
  'who-bec-manual': {
    id: 'who-bec-manual',
    title: 'WHO-ICRC Basic Emergency Care',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured',
    updated_at: '2018-10-30',
    summary: 'WHO and ICRC provide a limited-resource ABC-first approach for recognition, resuscitation, and transfer of emergencies.'
  },
  'who-preeclampsia-factsheet': {
    id: 'who-preeclampsia-factsheet',
    title: 'Pre-eclampsia',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia',
    updated_at: '2025-12-10',
    summary: 'WHO notes severe headache, visual disturbance, abdominal pain, and hypertension in pregnancy as danger signs that need early recognition and management.'
  },
  'who-preeclampsia-guideline': {
    id: 'who-preeclampsia-guideline',
    title: 'WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789241548335',
    updated_at: '2011-11-02',
    summary: 'WHO provides protocol-level recommendations for maternal hypertension and eclampsia management in low-resource settings.'
  },
  'who-pph-guideline': {
    id: 'who-pph-guideline',
    title: 'WHO recommendations for the prevention and treatment of postpartum haemorrhage',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789241548502',
    updated_at: '2012-01-01',
    summary: 'WHO outlines prevention, recognition, and treatment principles for severe postpartum bleeding and referral readiness.'
  },
  'who-stroke-factsheet': {
    id: 'who-stroke-factsheet',
    title: 'Stroke',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/stroke',
    updated_at: '2025-12-19',
    summary: 'WHO identifies sudden facial droop, arm weakness, speech disturbance, vision change, and balance loss as stroke signs needing urgent treatment.'
  },
  'who-cvd-factsheet': {
    id: 'who-cvd-factsheet',
    title: 'Cardiovascular diseases (CVDs)',
    organization: 'World Health Organization',
    url: 'https://www.who.int/en/news-room/fact-sheets/detail/cardiovascular-diseases-%28cvds%29',
    updated_at: '2025-07-31',
    summary: 'WHO lists chest discomfort, arm pain, sweating, breathlessness, and faintness among common heart attack warning symptoms.'
  },
  'who-sepsis-factsheet': {
    id: 'who-sepsis-factsheet',
    title: 'Sepsis',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/sepsis',
    updated_at: '2024-05-03',
    summary: 'WHO describes sepsis as a medical emergency and highlights fever, confusion, rapid breathing, low blood pressure, and weak pulse as danger signs.'
  },
  'who-pneumonia-children': {
    id: 'who-pneumonia-children',
    title: 'Pneumonia in children',
    organization: 'World Health Organization',
    url: 'https://www.who.int/en/news-room/fact-sheets/detail/pneumonia',
    updated_at: '2022-11-11',
    summary: 'WHO highlights fast breathing, feeding difficulty, chest indrawing, and low oxygen as dangerous pneumonia features in children.'
  },
  'who-imci-danger-signs': {
    id: 'who-imci-danger-signs',
    title: 'IMCI danger signs review',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/WHO-MCA-19.02',
    updated_at: '2019-10-17',
    summary: 'WHO IMCI danger signs include convulsions, inability to drink, lethargy, vomiting everything, severe dehydration, and stridor in a calm child.'
  }
};

function cite(id: keyof typeof LOCAL_GUIDELINES, whyItApplies: string): GuidelineCitation {
  return {
    ...LOCAL_GUIDELINES[id],
    why_it_applies: whyItApplies
  };
}

function detectWorkflow(text: string, patient?: PatientProfile): WorkflowId {
  const lower = text.toLowerCase();
  const maternal =
    Boolean(patient?.pregnancy_weeks || patient?.postpartum_days) || /pregnan|postpartum/.test(lower);

  if (maternal && /bleeding|headache|visual|seizure|abdominal pain|dizzy/.test(lower)) {
    return 'maternal-emergency';
  }
  if (/facial droop|slurred speech|speech difficulty|arm weakness|unilateral weakness|one side/.test(lower)) {
    return 'stroke-fast-track';
  }
  if (/crushing chest|chest pain|left arm|jaw pain|sweating|shortness of breath/.test(lower)) {
    return 'cardiac-emergency';
  }
  if ((patient?.age_years || 99) < 5 && /cough|fast breathing|difficulty breathing|not feeding|eating less/.test(lower)) {
    return 'child-respiratory';
  }
  if (/fever|infection/.test(lower) && /confusion|low blood pressure|difficulty breathing|weak pulse|shivering/.test(lower)) {
    return 'sepsis-escalation';
  }
  return 'general-triage';
}

function destinationForWorkflow(workflow: WorkflowId) {
  switch (workflow) {
    case 'maternal-emergency':
      return 'Emergency obstetric care center';
    case 'stroke-fast-track':
      return 'Stroke-capable hospital';
    case 'cardiac-emergency':
      return 'Higher-level emergency facility';
    case 'child-respiratory':
      return 'Pediatric-capable referral facility';
    case 'sepsis-escalation':
      return 'Emergency department or inpatient-capable facility';
    default:
      return 'Local clinician review pathway';
  }
}

function priorityLabel(assessment?: MediScribeAssessment) {
  if (!assessment) return 'Clinical review required';
  if (assessment.urgency === 'immediate') return 'Refer now';
  if (assessment.urgency === 'emergent') return 'Urgent referral';
  if (assessment.urgency === 'urgent') return 'Same-day clinician review';
  return 'Routine follow-up';
}

function selectGuidelines(workflow: WorkflowId, text: string): GuidelineCitation[] {
  const items = [
    cite('who-emergency-care-overview', 'This case involves a time-sensitive presentation where first-contact recognition and escalation matter.'),
    cite('who-bec-manual', 'The clinic needs an ABC-first emergency approach before transfer.')
  ];

  if (workflow === 'maternal-emergency') {
    items.push(
      cite('who-preeclampsia-factsheet', 'Maternal warning signs such as bleeding, severe headache, visual change, abdominal pain, or hypertension need urgent recognition.'),
      cite(
        /bleeding/.test(text) ? 'who-pph-guideline' : 'who-preeclampsia-guideline',
        /bleeding/.test(text)
          ? 'Bleeding in pregnancy or postpartum increases urgency and supports haemorrhage-focused referral readiness.'
          : 'Maternal hypertension guidance supports emergency escalation.'
      )
    );
  } else if (workflow === 'stroke-fast-track') {
    items.push(cite('who-stroke-factsheet', 'Speech disturbance, facial droop, or unilateral weakness match time-sensitive stroke warning patterns.'));
  } else if (workflow === 'cardiac-emergency') {
    items.push(cite('who-cvd-factsheet', 'Chest discomfort, arm pain, sweating, and breathlessness fit WHO heart attack warning features.'));
  } else if (workflow === 'child-respiratory') {
    items.push(
      cite('who-pneumonia-children', 'Fast breathing, feeding difficulty, and low oxygen support pneumonia-risk triage in children.'),
      cite('who-imci-danger-signs', 'IMCI danger signs justify referral when a child is not feeding, lethargic, convulsing, or vomiting everything.')
    );
  } else if (workflow === 'sepsis-escalation') {
    items.push(cite('who-sepsis-factsheet', 'Fever, confusion, rapid breathing, and low blood pressure raise concern for sepsis and deterioration.'));
  }

  return items.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 4);
}

function evidenceSummaryForWorkflow(
  workflow: WorkflowId,
  patient: PatientProfile | undefined,
  assessment: MediScribeAssessment,
  citations: GuidelineCitation[]
) {
  const age = patient?.age_years || '--';
  const diagnosis = assessment.differential_diagnoses?.[0]?.name || 'Clinical review needed';
  const sourceLabel = citations.slice(0, 2).map((item) => item.title).join(' and ');

  switch (workflow) {
    case 'maternal-emergency':
      return `${age}-year-old maternal case with danger signs. ${diagnosis} is being treated as an emergency referral because the presentation aligns with ${sourceLabel}.`;
    case 'stroke-fast-track':
      return `${age}-year-old patient with stroke-pattern symptoms. Time-sensitive transfer is prioritized because the findings align with ${sourceLabel}.`;
    case 'cardiac-emergency':
      return `${age}-year-old patient with cardiac warning features. Emergency referral is prioritized because the presentation aligns with ${sourceLabel}.`;
    case 'child-respiratory':
      return `Child respiratory case with same-day risk features. Oxygen checks, feeding assessment, and referral are grounded in ${sourceLabel}.`;
    case 'sepsis-escalation':
      return `Serious infection pathway activated. Fever plus systemic instability is treated as high risk and grounded in ${sourceLabel}.`;
    default:
      return `${diagnosis} is being handled through a safety-first rural triage workflow with protocol grounding from ${sourceLabel}.`;
  }
}

function reasonForReferral(workflow: WorkflowId, assessment: MediScribeAssessment) {
  const redFlags = (assessment.red_flags || [])
    .filter((flag) => flag.level === 'red')
    .map((flag) => flag.message.replace(/\.$/, ''));
  if (redFlags.length) return redFlags.slice(0, 2).join('; ');

  switch (workflow) {
    case 'maternal-emergency':
      return 'Maternal danger signs require urgent obstetric assessment before complications progress.';
    case 'stroke-fast-track':
      return 'Time-sensitive neurologic symptoms need rapid imaging and transfer.';
    case 'cardiac-emergency':
      return 'Possible acute coronary syndrome requires rapid monitoring and escalation.';
    case 'child-respiratory':
      return 'Child respiratory distress and feeding risk need same-day evaluation and oxygen assessment.';
    case 'sepsis-escalation':
      return 'Systemic infection features raise concern for sepsis and rapid deterioration.';
    default:
      return `${assessment.differential_diagnoses?.[0]?.name || 'This case'} requires clinician review with local protocol confirmation.`;
  }
}

function buildStructuredReferralHandoff(
  workflow: WorkflowId,
  patient: PatientProfile | undefined,
  assessment: MediScribeAssessment
): ReferralHandoff {
  const pending = (assessment.treatment?.immediate_actions || []).slice(0, 4);
  const reason = reasonForReferral(workflow, assessment);
  const diagnosis = assessment.differential_diagnoses?.[0]?.name || 'Urgent clinical review needed';
  const descriptor = `${patient?.name || 'Unnamed patient'}, ${patient?.age_years || '--'} years, ${patient?.gender || 'unknown'}`;

  return {
    priority_label: priorityLabel(assessment),
    destination: destinationForWorkflow(workflow),
    reason_for_referral: reason,
    actions_completed: [
      'Structured intake captured',
      'Danger signs reviewed',
      workflow === 'maternal-emergency' ? 'Maternal emergency pathway selected' : 'Safety guardrails applied'
    ],
    actions_pending: pending,
    summary_text: [
      'MediScribe referral handoff',
      `Patient: ${descriptor}`,
      `Urgency: ${assessment.urgency.toUpperCase()} / triage category ${assessment.triage_category}`,
      `Leading concern: ${diagnosis}`,
      `Reason to escalate: ${reason}`,
      `Actions completed: Structured intake captured; Danger signs reviewed; ${workflow === 'maternal-emergency' ? 'Maternal emergency pathway selected' : 'Safety guardrails applied'}`,
      `Actions pending: ${pending.join('; ') || 'Continue local monitoring and follow receiving facility instructions'}`,
      `Destination: ${destinationForWorkflow(workflow)}`
    ].join('\n')
  };
}

export function buildOfflineClinicalEvidence({
  patient,
  transcript,
  assessment
}: {
  patient?: PatientProfile;
  transcript: string;
  assessment: MediScribeAssessment;
}) {
  const workflow = detectWorkflow(transcript, patient);
  const citations = selectGuidelines(workflow, transcript.toLowerCase());
  return {
    hero_workflow: workflow,
    citations,
    evidence_summary: evidenceSummaryForWorkflow(workflow, patient, assessment, citations),
    referral_handoff: buildStructuredReferralHandoff(workflow, patient, assessment)
  };
}

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
  if (assessment?.referral_handoff?.summary_text) {
    return [
      assessment.referral_handoff.summary_text,
      'Generated by MediScribe. Decision support only; confirm with clinician and local protocol.',
      'Gemma is a trademark of Google LLC.'
    ].join('\n');
  }
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
