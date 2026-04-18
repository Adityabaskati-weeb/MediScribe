import assert from 'assert';
import { agenticEvaluationMetrics, runAgenticMedicalAssessment } from '../services/agentOrchestrator';
import { performanceSummary } from '../services/performanceMonitor';

async function testAgenticAssessment() {
  const result = await runAgenticMedicalAssessment({
    patient: {
      age_years: 58,
      gender: 'female',
      known_conditions: ['hypertension']
    },
    chief_complaint: 'Crushing chest pain with sweating',
    symptoms: ['shortness of breath', 'left arm pain'],
    vitals: {
      systolic_bp: 84,
      diastolic_bp: 56,
      oxygen_saturation: 89,
      respiratory_rate: 32
    },
    offline_captured: true
  });

  assert.ok(result.agents.some((step) => step.agent === 'diagnosis-agent'));
  assert.ok(result.agents.some((step) => step.agent === 'reasoning-agent'));
  assert.ok(result.agents.some((step) => step.agent === 'treatment-agent'));
  assert.ok(result.agents.some((step) => step.agent === 'safety-agent'));
  assert.equal(result.guardrails.escalation_required, true);
  assert.equal(result.assessment.urgency, 'immediate');
  assert.ok(result.demo.pitch_script.length >= 4);

  const metrics = agenticEvaluationMetrics();
  assert.ok(metrics.accuracy >= 0.66);
  assert.ok(metrics.red_flag_recall >= 0.66);
  assert.ok(performanceSummary().total_requests > 0);
}

testAgenticAssessment()
  .then(() => console.log('Agentic architecture test passed'))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
