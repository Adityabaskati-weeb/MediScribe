import { agenticEvaluationMetrics } from './agentOrchestrator';
import { listAuditLogs } from './auditLogService';
import { cacheStats } from './medicalQueryCache';
import { performanceSummary } from './performanceMonitor';

export function productionSystemDesign() {
  return {
    architecture: {
      pattern: 'Offline edge app + API gateway + modular cloud services',
      services: [
        {
          name: 'mobile-edge',
          runtime: 'React Native + SQLite',
          responsibility: 'Guided consultation, offline queue, voice/chart intake, local safety display.'
        },
        {
          name: 'api-gateway',
          runtime: 'Nginx or managed cloud gateway',
          responsibility: 'TLS termination, routing, rate limits, JWT/API-key enforcement, dashboard/API split.'
        },
        {
          name: 'api-service',
          runtime: 'Node.js/Express',
          responsibility: 'Patients, visits, diagnosis orchestration, RBAC, audit log, analytics APIs.'
        },
        {
          name: 'ai-service',
          runtime: 'Ollama Gemma 4 / quantized edge model',
          responsibility: 'Low-latency medical reasoning with calibrated ranked outputs.'
        },
        {
          name: 'sync-service',
          runtime: 'Node.js worker',
          responsibility: 'Conflict resolution, mobile queue ingestion, idempotent acknowledgements.'
        },
        {
          name: 'dashboard',
          runtime: 'React/Vite',
          responsibility: 'Clinic KPIs, trends, reports, admin controls, export workflows.'
        }
      ],
      data_flow: [
        'Health worker captures voice, text, or chart photo on mobile.',
        'Mobile stores patient, visit, and intake draft in SQLite immediately.',
        'Local rules provide instant red-flag fallback while AI is contacted when available.',
        'API gateway routes /api traffic to the API service and /ai internal calls to the AI service.',
        'Diagnosis, reasoning, treatment, and safety agents produce a guarded assessment.',
        'Sync service resolves queued updates into PostgreSQL and returns acknowledgements.',
        'Dashboard reads aggregate KPIs, trends, audit logs, and evaluation metrics.'
      ],
      fallback: [
        'If Gemma/Ollama fails, deterministic clinical rules return referral-safe triage.',
        'If confidence is low, output moves to refer-to-doctor guidance.',
        'If internet is unavailable, mobile keeps all visits in SQLite and syncs later.',
        'If sync conflicts occur, newest clinical note is preserved and conflicting fields are marked for review.'
      ]
    },
    performance: {
      targets: {
        p95_latency_ms: 2000,
        cache_hit_latency_ms: 250,
        mobile_first_paint_ms: 800,
        offline_decision_ms: 500
      },
      strategies: [
        '4-bit or 8-bit quantized Gemma model for lower memory and faster inference.',
        'Cache frequent rural-clinic symptom clusters and guideline lookups.',
        'Run red-flag rules before the LLM to avoid blocking emergency advice.',
        'Lazy-load dashboard charts and mobile secondary screens.',
        'Move sync and chart parsing work to background queues.'
      ],
      live: performanceSummary(),
      cache: cacheStats()
    },
    ai_system: {
      agents: ['diagnosis-agent', 'reasoning-agent', 'treatment-agent', 'safety-agent'],
      confidence: 'Ranked differential list with calibrated fallback thresholds.',
      hallucination_reduction: [
        'Structured JSON prompts.',
        'Temperature kept low for deterministic responses.',
        'Rule-based safety override.',
        'Unsafe certainty language blocked.',
        'Treatment advice limited to local protocol language.'
      ]
    },
    reliability: {
      safety_checks: ['vital range validation', 'red-flag escalation', 'refer-to-doctor fallback', 'audit log for AI decisions'],
      rbac_roles: ['health_worker', 'doctor', 'admin'],
      deterministic_controls: ['stable input hash', 'low-temperature AI options', 'fallback rules for same input class']
    },
    evaluation: agenticEvaluationMetrics(),
    audit_logs: listAuditLogs()
  };
}

export function demoReadinessPack() {
  return {
    title: 'MediScribe: Offline AI clinical assistant for rural clinics',
    setup: ['Start Docker Compose', 'Open mobile Expo/dev build', 'Open dashboard', 'Use demo patient script'],
    story_beats: [
      'Before: rural worker handles 50+ patients daily and misses subtle red flags.',
      'Voice demo: worker speaks symptoms in a noisy clinic.',
      'AI agents: diagnosis, reasoning, treatment, and safety checks respond under pressure.',
      'Offline demo: turn off network; deterministic rules still catch red flags.',
      'Dashboard: admin sees accuracy, latency, urgent referrals, and clinic trends.'
    ],
    before_after: {
      before: 'Manual triage, inconsistent documentation, no instant second opinion.',
      after: 'Structured intake, ranked diagnosis, safety escalation, and offline patient history.'
    },
    metrics_to_show: ['diagnosis accuracy', 'p95 latency', 'offline success rate', 'red-flag recall', 'usability score']
  };
}

export function prometheusMetrics() {
  const perf = performanceSummary();
  const evaluation = agenticEvaluationMetrics();
  return [
    '# HELP mediscribe_requests_total Total tracked clinical requests.',
    '# TYPE mediscribe_requests_total counter',
    `mediscribe_requests_total ${perf.total_requests}`,
    '# HELP mediscribe_latency_average_ms Average clinical pipeline latency in milliseconds.',
    '# TYPE mediscribe_latency_average_ms gauge',
    `mediscribe_latency_average_ms ${perf.average_latency_ms}`,
    '# HELP mediscribe_latency_p95_ms P95 clinical pipeline latency in milliseconds.',
    '# TYPE mediscribe_latency_p95_ms gauge',
    `mediscribe_latency_p95_ms ${perf.p95_latency_ms}`,
    '# HELP mediscribe_reliability_ratio Successful tracked requests divided by total tracked requests.',
    '# TYPE mediscribe_reliability_ratio gauge',
    `mediscribe_reliability_ratio ${perf.reliability}`,
    '# HELP mediscribe_evaluation_accuracy_ratio Demo evaluation accuracy ratio.',
    '# TYPE mediscribe_evaluation_accuracy_ratio gauge',
    `mediscribe_evaluation_accuracy_ratio ${evaluation.accuracy}`,
    '# HELP mediscribe_red_flag_recall_ratio Demo red-flag recall ratio.',
    '# TYPE mediscribe_red_flag_recall_ratio gauge',
    `mediscribe_red_flag_recall_ratio ${evaluation.red_flag_recall}`
  ].join('\n');
}
