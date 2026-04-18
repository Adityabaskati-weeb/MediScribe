import { ClinicalIntake, MediScribeAssessment, SafetySignal } from '../models/Clinical';

export interface GuardrailResult {
  safe_to_display: boolean;
  fallback_required: boolean;
  escalation_required: boolean;
  blocked_claims: string[];
  safety_messages: SafetySignal[];
}

function textOf(intake: ClinicalIntake) {
  return [intake.chief_complaint, ...(intake.symptoms || []), ...(intake.notes || [])].join(' ').toLowerCase();
}

export function evaluateSafetyGuardrails(intake: ClinicalIntake, assessment?: Partial<MediScribeAssessment>): GuardrailResult {
  const text = textOf(intake);
  const vitals = intake.vitals || {};
  const safety_messages: SafetySignal[] = [];
  const blocked_claims: string[] = [];

  if (!intake.patient.age_years || intake.patient.age_years < 0) {
    safety_messages.push({ level: 'amber', message: 'Patient age is missing or invalid. Ask before final advice.' });
  }

  if ((vitals.oxygen_saturation ?? 100) < 90) {
    safety_messages.push({ level: 'red', message: 'Low oxygen saturation. Do not delay referral while waiting for AI.' });
  }

  if ((vitals.systolic_bp ?? 999) < 90) {
    safety_messages.push({ level: 'red', message: 'Shock-range blood pressure. Stabilize and refer urgently.' });
  }

  if (/pregnan|postpartum/.test(text) && /headache|bleeding|seizure|visual/.test(text)) {
    safety_messages.push({ level: 'red', message: 'Pregnancy or postpartum danger signs. Escalate immediately.' });
  }

  if (/child|infant|baby/.test(text) && /not feeding|lethargic|blue|convulsion/.test(text)) {
    safety_messages.push({ level: 'red', message: 'Pediatric danger sign detected. Urgent clinician review required.' });
  }

  if (/guarantee|cure|definitely|no need to refer/i.test(assessment?.clinical_summary || '')) {
    blocked_claims.push('Unsafe certainty language removed from clinical summary.');
  }

  const hasRed = safety_messages.some((message) => message.level === 'red') || assessment?.red_flags?.some((flag) => flag.level === 'red');
  return {
    safe_to_display: blocked_claims.length === 0,
    fallback_required: blocked_claims.length > 0 || !assessment?.differential_diagnoses?.length,
    escalation_required: Boolean(hasRed),
    blocked_claims,
    safety_messages: safety_messages.length ? safety_messages : [{ level: 'green', message: 'No extra guardrail escalation beyond clinical assessment.' }]
  };
}

export function applySafetyGuardrails(assessment: MediScribeAssessment, guardrails: GuardrailResult): MediScribeAssessment {
  const mergedFlags = [...assessment.red_flags, ...guardrails.safety_messages].filter(
    (flag, index, list) => list.findIndex((item) => item.message === flag.message) === index
  );

  return {
    ...assessment,
    urgency: guardrails.escalation_required && assessment.urgency === 'routine' ? 'urgent' : assessment.urgency,
    triage_category: guardrails.escalation_required ? Math.min(assessment.triage_category, 2) : assessment.triage_category,
    red_flags: mergedFlags,
    clinical_summary: guardrails.blocked_claims.length
      ? `${assessment.clinical_summary} Safety note: uncertain or unsafe model claims were removed.`
      : assessment.clinical_summary,
    disclaimer: `${assessment.disclaimer} MediScribe never replaces a clinician; red flags override AI confidence.`
  };
}
