import {
  ClinicalIntake,
  GuidelineCitation,
  MediScribeAssessment,
  ReferralHandoff
} from '../models/Clinical';
import { citationById } from '../data/guidelinePack';

type WorkflowId =
  | 'maternal-emergency'
  | 'stroke-fast-track'
  | 'cardiac-emergency'
  | 'child-respiratory'
  | 'sepsis-escalation'
  | 'general-triage';

function intakeText(intake: ClinicalIntake) {
  return [intake.chief_complaint, ...(intake.symptoms || []), ...(intake.notes || [])].join(' ').toLowerCase();
}

function topDiagnosis(assessment: MediScribeAssessment) {
  return assessment.differential_diagnoses[0]?.name || 'Urgent clinical review needed';
}

function includesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function detectWorkflow(intake: ClinicalIntake, assessment: MediScribeAssessment): WorkflowId {
  const text = intakeText(intake);
  const diagnosis = topDiagnosis(assessment).toLowerCase();

  const maternal =
    Boolean(intake.patient.pregnancy_weeks || intake.patient.postpartum_days) ||
    includesAny(text, ['pregnan', 'postpartum']);
  const maternalDanger = maternal && includesAny(text, ['bleeding', 'severe headache', 'headache', 'visual', 'seizure', 'abdominal pain']);
  if (maternalDanger) return 'maternal-emergency';

  if (
    includesAny(text, ['facial droop', 'slurred speech', 'speech difficulty', 'arm weakness', 'unilateral weakness']) ||
    diagnosis.includes('stroke')
  ) {
    return 'stroke-fast-track';
  }

  if (
    includesAny(text, ['crushing chest', 'chest pain', 'left arm', 'jaw pain', 'cold sweat', 'sweating']) ||
    diagnosis.includes('coronary')
  ) {
    return 'cardiac-emergency';
  }

  if (
    intake.patient.age_years < 5 &&
    (includesAny(text, ['cough', 'fast breathing', 'difficulty breathing', 'eating less', 'not feeding']) ||
      diagnosis.includes('pneumonia'))
  ) {
    return 'child-respiratory';
  }

  if (
    diagnosis.includes('sepsis') ||
    (includesAny(text, ['fever', 'infection']) &&
      includesAny(text, ['confusion', 'low blood pressure', 'difficulty breathing', 'shivering', 'weak pulse']))
  ) {
    return 'sepsis-escalation';
  }

  return 'general-triage';
}

function destinationFor(workflow: WorkflowId) {
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

function priorityLabel(assessment: MediScribeAssessment) {
  if (assessment.urgency === 'immediate') return 'Refer now';
  if (assessment.urgency === 'emergent') return 'Urgent referral';
  if (assessment.urgency === 'urgent') return 'Same-day clinician review';
  return 'Routine follow-up';
}

function reasonForReferral(_intake: ClinicalIntake, assessment: MediScribeAssessment, workflow: WorkflowId) {
  const redFlags = assessment.red_flags
    .filter((flag) => flag.level === 'red')
    .map((flag) => flag.message.replace(/\.$/, ''));
  if (redFlags.length) {
    return redFlags.slice(0, 2).join('; ');
  }
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
      return `${topDiagnosis(assessment)} requires clinician review with local protocol confirmation.`;
  }
}

function selectCitations(intake: ClinicalIntake, _assessment: MediScribeAssessment, workflow: WorkflowId): GuidelineCitation[] {
  const text = intakeText(intake);
  const selected: GuidelineCitation[] = [
    citationById(
      'who-emergency-care-overview',
      'This case involves a time-sensitive acute presentation where first-contact recognition and escalation matter.'
    ),
    citationById(
      'who-bec-manual',
      'The limited-resource workflow needs a structured ABC-first emergency approach before transfer.'
    )
  ];

  if (workflow === 'maternal-emergency') {
    selected.push(
      citationById(
        'who-preeclampsia-factsheet',
        'Severe headache, visual change, and hypertension in pregnancy or postpartum fit WHO pre-eclampsia warning features.'
      )
    );
    selected.push(
      citationById(
        includesAny(text, ['bleeding', 'heavy bleeding']) ? 'who-pph-guideline' : 'who-preeclampsia-guideline',
        includesAny(text, ['bleeding', 'heavy bleeding'])
          ? 'Bleeding in pregnancy or postpartum increases urgency and supports haemorrhage-focused referral readiness.'
          : 'Protocol-level maternal hypertension guidance helps justify urgent escalation.'
      )
    );
  } else if (workflow === 'stroke-fast-track') {
    selected.push(
      citationById(
        'who-stroke-factsheet',
        'Face, arm, speech, or balance symptoms match WHO stroke warning patterns that require rapid emergency action.'
      )
    );
  } else if (workflow === 'cardiac-emergency') {
    selected.push(
      citationById(
        'who-cvd-factsheet',
        'Chest discomfort, arm pain, sweating, and breathlessness are consistent with WHO heart attack warning symptoms.'
      )
    );
  } else if (workflow === 'child-respiratory') {
    selected.push(
      citationById(
        'who-pneumonia-children',
        'Fast breathing, feeding difficulty, fever, or low oxygen in a child support pneumonia-risk triage.'
      )
    );
    selected.push(
      citationById(
        'who-imci-danger-signs',
        'IMCI danger signs help justify referral when a child is lethargic, not feeding, convulsing, or vomiting everything.'
      )
    );
  } else if (workflow === 'sepsis-escalation') {
    selected.push(
      citationById(
        'who-sepsis-factsheet',
        'Fever, confusion, rapid breathing, and low blood pressure are all WHO sepsis warning features.'
      )
    );
  }

  return selected
    .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, 4);
}

function evidenceSummary(intake: ClinicalIntake, assessment: MediScribeAssessment, workflow: WorkflowId, citations: GuidelineCitation[]) {
  const diagnosis = topDiagnosis(assessment);
  const age = intake.patient.age_years;
  const redCount = assessment.red_flags.filter((flag) => flag.level === 'red').length;
  const citationTitles = citations.slice(0, 2).map((item) => item.title).join(' and ');

  switch (workflow) {
    case 'maternal-emergency':
      return `${age}-year-old maternal case with danger signs. ${diagnosis} is being treated as an emergency referral because maternal symptoms plus red flags align with ${citationTitles}.`;
    case 'stroke-fast-track':
      return `${age}-year-old patient with stroke-pattern symptoms. Time-sensitive transfer is prioritized because the findings align with ${citationTitles}.`;
    case 'cardiac-emergency':
      return `${age}-year-old patient with cardiac warning features. Emergency referral is prioritized because chest pain plus instability align with ${citationTitles}.`;
    case 'child-respiratory':
      return `Child respiratory case with same-day risk features. The care path is grounded in ${citationTitles} to support oxygen checks, feeding assessment, and referral when danger signs appear.`;
    case 'sepsis-escalation':
      return `Serious infection pathway activated. Fever plus systemic instability is treated as high risk and grounded in ${citationTitles}.`;
    default:
      return `${diagnosis} is being handled through a safety-first rural triage workflow with ${redCount} red-flag override(s) and protocol grounding from ${citationTitles}.`;
  }
}

function completedActions(_assessment: MediScribeAssessment, workflow: WorkflowId) {
  const base = [
    'Structured intake captured',
    'Danger signs reviewed',
    'Referral urgency classified',
    workflow === 'maternal-emergency' ? 'Maternal emergency pathway selected' : 'Safety guardrails applied'
  ];
  return Array.from(new Set(base));
}

function pendingActions(assessment: MediScribeAssessment) {
  return Array.from(new Set((assessment.treatment.immediate_actions || []).slice(0, 4)));
}

function buildReferralHandoff(intake: ClinicalIntake, assessment: MediScribeAssessment, workflow: WorkflowId): ReferralHandoff {
  const reason = reasonForReferral(intake, assessment, workflow);
  const pending = pendingActions(assessment);
  const diagnosis = topDiagnosis(assessment);
  const patientName = intake.patient.name || 'Unnamed patient';
  const patientDescriptor = `${patientName}, ${intake.patient.age_years} years, ${intake.patient.gender}`;
  return {
    priority_label: priorityLabel(assessment),
    destination: destinationFor(workflow),
    reason_for_referral: reason,
    actions_completed: completedActions(assessment, workflow),
    actions_pending: pending,
    summary_text: [
      'MediScribe referral handoff',
      `Patient: ${patientDescriptor}`,
      `Urgency: ${assessment.urgency.toUpperCase()} / triage category ${assessment.triage_category}`,
      `Leading concern: ${diagnosis}`,
      `Reason to escalate: ${reason}`,
      `Actions completed: ${completedActions(assessment, workflow).join('; ')}`,
      `Actions pending: ${pending.join('; ') || 'Continue local monitoring and follow receiving facility instructions'}`,
      `Destination: ${destinationFor(workflow)}`
    ].join('\n')
  };
}

export function enrichAssessmentWithEvidence(intake: ClinicalIntake, assessment: MediScribeAssessment): MediScribeAssessment {
  const workflow = detectWorkflow(intake, assessment);
  const citations = selectCitations(intake, assessment, workflow);
  return {
    ...assessment,
    hero_workflow: workflow,
    citations,
    evidence_summary: evidenceSummary(intake, assessment, workflow, citations),
    referral_handoff: buildReferralHandoff(intake, assessment, workflow)
  };
}
