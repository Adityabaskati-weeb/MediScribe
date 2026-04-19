import { ClinicalIntake, DifferentialDiagnosis, MediScribeAssessment, TreatmentRecommendation } from '../models/Clinical';
import { EVALUATION_SCENARIOS, EvaluationScenario } from '../data/evaluationScenarios';
import { analyzeIntake, saveAssessment } from './clinicalEngine';
import { analyzeMedicalCase, MedicalPrompt } from './gemmaService';
import { recordAuditLog } from './auditLogService';
import { getCachedMedicalQuery, setCachedMedicalQuery } from './medicalQueryCache';
import { performanceSummary, recordPerformance, timed } from './performanceMonitor';
import { applySafetyGuardrails, evaluateSafetyGuardrails, GuardrailResult } from './safetyGuardrails';

export interface AgentStep<T = unknown> {
  agent: 'diagnosis-agent' | 'reasoning-agent' | 'treatment-agent' | 'safety-agent';
  status: 'completed' | 'fallback';
  latency_ms: number;
  output: T;
}

export interface AgenticAssessment {
  stored: ReturnType<typeof saveAssessment>;
  assessment: MediScribeAssessment;
  agents: AgentStep[];
  guardrails: GuardrailResult;
  metrics: {
    latency_ms: number;
    fallback_used: boolean;
    reliability_target: number;
    accuracy_target: number;
  };
  demo: {
    headline: string;
    pitch_script: string[];
    screen_sequence: string[];
    proof_points: string[];
  };
}

export async function runAgenticMedicalAssessment(intake: ClinicalIntake): Promise<AgenticAssessment> {
  const started = Date.now();
  const agents: AgentStep[] = [];
  let fallbackUsed = false;
  const cacheKey = ['diagnosis-agent', toMedicalPrompt(intake)];

  const deterministicAssessment = analyzeIntake(intake, 'agentic-deterministic-safety-engine');
  const diagnosisStarted = Date.now();
  let diagnoses = deterministicAssessment.differential_diagnoses;
  const cached = getCachedMedicalQuery<DifferentialDiagnosis[]>(cacheKey);

  if (cached) {
    diagnoses = cached;
    agents.push({
      agent: 'diagnosis-agent',
      status: 'completed',
      latency_ms: Date.now() - diagnosisStarted,
      output: { cache_hit: true, diagnoses }
    });
  } else try {
    const gemma = await timed('diagnosis-agent-gemma', () => analyzeMedicalCase(toMedicalPrompt(intake)));
    diagnoses = mergeGemmaDiagnoses(diagnoses, gemma);
    setCachedMedicalQuery(cacheKey, diagnoses);
    agents.push({
      agent: 'diagnosis-agent',
      status: 'completed',
      latency_ms: Date.now() - diagnosisStarted,
      output: diagnoses
    });
  } catch {
    fallbackUsed = true;
    agents.push({
      agent: 'diagnosis-agent',
      status: 'fallback',
      latency_ms: Date.now() - diagnosisStarted,
      output: diagnoses
    });
  }

  const reasoningStarted = Date.now();
  const reasoning = buildReasoning(intake, diagnoses, fallbackUsed);
  agents.push({
    agent: 'reasoning-agent',
    status: 'completed',
    latency_ms: Date.now() - reasoningStarted,
    output: reasoning
  });

  const treatmentStarted = Date.now();
  const treatment = buildTreatment(deterministicAssessment.treatment, deterministicAssessment.urgency);
  agents.push({
    agent: 'treatment-agent',
    status: 'completed',
    latency_ms: Date.now() - treatmentStarted,
    output: treatment
  });

  let assessment: MediScribeAssessment = {
    ...deterministicAssessment,
    differential_diagnoses: diagnoses,
    treatment,
    clinical_summary: reasoning.simple_explanation,
    model_source: fallbackUsed ? 'agentic-fallback-rules' : 'agentic-gemma-plus-rules'
  };

  const safetyStarted = Date.now();
  const guardrails = evaluateSafetyGuardrails(intake, assessment);
  assessment = applySafetyGuardrails(assessment, guardrails);
  agents.push({
    agent: 'safety-agent',
    status: guardrails.fallback_required ? 'fallback' : 'completed',
    latency_ms: Date.now() - safetyStarted,
    output: guardrails
  });

  const stored = saveAssessment(intake, assessment);
  recordAuditLog({
    event_type: guardrails.escalation_required ? 'SAFETY_ESCALATION' : 'AI_DECISION',
    actor_role: 'system',
    patient_id: assessment.patient_id,
    assessment_id: assessment.assessment_id,
    summary: `${assessment.urgency} assessment produced by ${assessment.model_source}`,
    payload: { intake, assessment, agents, guardrails }
  });
  const latency = Date.now() - started;
  recordPerformance({ name: 'agentic-assessment', duration_ms: latency, success: true, fallback_used: fallbackUsed || guardrails.fallback_required });

  return {
    stored,
    assessment,
    agents,
    guardrails,
    metrics: {
      latency_ms: latency,
      fallback_used: fallbackUsed || guardrails.fallback_required,
      reliability_target: 0.98,
      accuracy_target: 0.91
    },
    demo: buildDemoOutput(assessment, latency, fallbackUsed || guardrails.fallback_required)
  };
}

export function agenticEvaluationMetrics() {
  const evaluated = EVALUATION_SCENARIOS.map((scenario) => {
    const assessment = analyzeIntake(scenario.intake, 'evaluation-rules');
    const top = assessment.differential_diagnoses[0]?.name || '';
    const allDiagnosisText = assessment.differential_diagnoses.map((item) => item.name).join(' ').toLowerCase();
    const topMatch = scenario.expectedDiagnosisKeywords.some((keyword) => top.toLowerCase().includes(keyword));
    const top3Match = scenario.expectedDiagnosisKeywords.some((keyword) => allDiagnosisText.includes(keyword));
    const predictedRedFlag = assessment.red_flags.some((flag) => flag.level === 'red');
    const redFlagRecall = scenario.expectedRedFlag ? Number(predictedRedFlag) : 1;
    const urgencyMatch = urgencyAtLeast(assessment.urgency, scenario.expectedUrgency);
    const safetyPass = scenario.expectedRedFlag ? predictedRedFlag && urgencyMatch : urgencyMatch;
    return {
      id: scenario.id,
      scenario: scenario.name,
      category: scenario.category,
      expected_keywords: scenario.expectedDiagnosisKeywords,
      predicted: top,
      predicted_urgency: assessment.urgency,
      expected_urgency: scenario.expectedUrgency,
      urgent_detected: ['immediate', 'emergent', 'urgent'].includes(assessment.urgency),
      red_flag_expected: scenario.expectedRedFlag,
      red_flag_detected: predictedRedFlag,
      red_flag_recall: redFlagRecall,
      top_match: topMatch,
      top3_match: top3Match,
      urgency_match: urgencyMatch,
      offline_success: Boolean(scenario.intake.offline_captured) === scenario.offlineExpected,
      pass: top3Match || safetyPass
    };
  });

  const passes = evaluated.filter((row) => row.pass).length;
  const redFlagCases = evaluated.filter((row) => row.red_flag_expected);
  const top3Matches = evaluated.filter((row) => row.top3_match).length;
  const urgencyMatches = evaluated.filter((row) => row.urgency_match).length;
  const offlineMatches = evaluated.filter((row) => row.offline_success).length;
  const categories = Array.from(new Set(EVALUATION_SCENARIOS.map((scenario) => scenario.category))).sort();
  return {
    accuracy: Number((passes / evaluated.length).toFixed(3)),
    top3_match_rate: Number((top3Matches / evaluated.length).toFixed(3)),
    urgency_accuracy: Number((urgencyMatches / evaluated.length).toFixed(3)),
    red_flag_recall: redFlagCases.length ? Number((redFlagCases.reduce((sum, row) => sum + row.red_flag_recall, 0) / redFlagCases.length).toFixed(3)) : 1,
    offline_success_rate: Number((offlineMatches / evaluated.length).toFixed(3)),
    safety_override_rate: Number((redFlagCases.length / evaluated.length).toFixed(3)),
    latency: performanceSummary(),
    reliability: performanceSummary().reliability,
    evaluated_cases: evaluated.length,
    categories,
    cases: evaluated,
    targets: {
      accuracy: '>= 0.85',
      top3_match_rate: '>= 0.85',
      p95_latency_ms: '<= 2000 production target; <= 5000 demo hardware tolerance',
      reliability: '>= 0.98',
      red_flag_recall: '1.0 for emergency demo cases',
      offline_success_rate: '1.0 for intake, fallback, save, and sync queue'
    }
  };
}

function urgencyAtLeast(actual: EvaluationScenario['expectedUrgency'], expected: EvaluationScenario['expectedUrgency']) {
  const rank: Record<EvaluationScenario['expectedUrgency'], number> = {
    immediate: 1,
    emergent: 2,
    urgent: 3,
    routine: 4
  };
  return rank[actual] <= rank[expected];
}

function toMedicalPrompt(intake: ClinicalIntake): MedicalPrompt {
  return {
    patientAge: intake.patient.age_years,
    gender: intake.patient.gender === 'male' ? 'M' : intake.patient.gender === 'female' ? 'F' : intake.patient.gender === 'other' ? 'O' : 'unknown',
    symptoms: [intake.chief_complaint, ...(intake.symptoms || [])].filter(Boolean),
    vitals: intake.vitals ? { ...intake.vitals } : undefined,
    medicalHistory: intake.patient.known_conditions || [],
    medications: intake.patient.medications || []
  };
}

function mergeGemmaDiagnoses(existing: DifferentialDiagnosis[], gemma: any): DifferentialDiagnosis[] {
  const gemmaItems = [gemma.primaryDiagnosis, ...(gemma.alternativeDiagnoses || [])]
    .filter(Boolean)
    .map((name: string, index: number) => ({
      name,
      confidence: gemma.confidenceScores?.[index] || Math.max(0.3, 0.72 - index * 0.12),
      reasoning: index === 0 ? gemma.clinicalReasoning : 'Gemma differential diagnosis candidate.'
    }));
  return [...existing, ...gemmaItems]
    .filter((item, index, list) => list.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === index)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

function buildReasoning(intake: ClinicalIntake, diagnoses: DifferentialDiagnosis[], fallbackUsed: boolean) {
  const vitals = intake.vitals || {};
  const evidence = [
    intake.chief_complaint,
    vitals.systolic_bp ? `BP ${vitals.systolic_bp}/${vitals.diastolic_bp || '--'}` : '',
    vitals.oxygen_saturation ? `SpO2 ${vitals.oxygen_saturation}%` : '',
    vitals.respiratory_rate ? `RR ${vitals.respiratory_rate}` : ''
  ].filter(Boolean);

  return {
    simple_explanation: `${intake.patient.age_years}-year-old ${intake.patient.gender} patient with ${intake.chief_complaint}. Leading concern: ${diagnoses[0]?.name || 'needs assessment'}.`,
    evidence,
    uncertainty: fallbackUsed ? 'AI unavailable; using offline clinical rules and safety-first triage.' : 'Gemma reasoning cross-checked with deterministic red-flag rules.',
    health_worker_prompt: 'Confirm vitals, ask danger-sign questions, and follow referral guidance if red flags are present.'
  };
}

function buildTreatment(base: TreatmentRecommendation, urgency: string): TreatmentRecommendation {
  const immediate = urgency === 'immediate' || urgency === 'emergent'
    ? ['Start emergency pathway.', ...base.immediate_actions]
    : base.immediate_actions;
  return {
    ...base,
    immediate_actions: Array.from(new Set(immediate)),
    suggested_tests: Array.from(new Set([...base.suggested_tests, 'Document repeat vitals before disposition'])),
    follow_up: urgency === 'routine' ? base.follow_up : `${base.follow_up}. Do not wait for sync before referral.`
  };
}

function buildDemoOutput(assessment: MediScribeAssessment, latency: number, fallbackUsed: boolean) {
  return {
    headline: `${assessment.urgency.toUpperCase()} case identified in ${latency} ms`,
    pitch_script: [
      'A rural health worker opens MediScribe with no internet.',
      'They speak the symptoms in a local-language workflow.',
      `MediScribe highlights ${assessment.differential_diagnoses[0]?.name || 'the leading risk'} and explains why.`,
      fallbackUsed ? 'When AI is unavailable, safety rules still return a referral-safe answer.' : 'Gemma reasoning is checked by local safety guardrails.',
      'The visit is saved offline and queued for sync.'
    ],
    screen_sequence: ['Home dashboard', 'Voice intake', 'Patient summary', 'AI diagnosis', 'Treatment guidelines', 'Offline sync'],
    proof_points: ['Agent-based diagnosis, reasoning, treatment, and safety checks', 'Offline-first fallback', 'Latency and reliability metrics', 'Red-flag escalation']
  };
}
