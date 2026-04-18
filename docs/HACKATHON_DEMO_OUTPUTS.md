# MediScribe Demo-Ready Outputs

## Agent Architecture

MediScribe now runs the clinical assessment through four explicit agents:

- Diagnosis agent: ranks the top possible diagnoses using Gemma when available and local rules when offline.
- Reasoning agent: converts evidence into a simple explanation for health workers.
- Treatment agent: produces practical next steps, tests, medicines to consider, follow-up, and referral guidance.
- Safety agent: applies fallback guardrails so red flags override model confidence.

## Demo API Endpoints

Use these during the pitch video or judging walkthrough:

```bash
curl http://localhost:3001/api/diagnoses/demo-output
curl http://localhost:3001/api/diagnoses/evaluation
curl http://localhost:3001/api/diagnoses/performance
```

To run a live agentic case:

```bash
curl -X POST http://localhost:3001/api/diagnoses/agentic ^
  -H "Content-Type: application/json" ^
  -d "{\"patient\":{\"age_years\":58,\"gender\":\"female\",\"known_conditions\":[\"hypertension\"]},\"chief_complaint\":\"Crushing chest pain with sweating\",\"symptoms\":[\"shortness of breath\",\"left arm pain\"],\"vitals\":{\"systolic_bp\":84,\"diastolic_bp\":56,\"oxygen_saturation\":89,\"respiratory_rate\":32},\"offline_captured\":true}"
```

## Safety Guardrails

Guardrails are checked even when Gemma or Ollama is unavailable:

- Low oxygen saturation escalates referral.
- Shock-range blood pressure escalates referral.
- Pregnancy and postpartum danger signs override routine advice.
- Pediatric danger signs force urgent review.
- Unsafe certainty language is blocked from display.

## Performance Strategy

MediScribe is optimized for rural clinics under time pressure:

- Deterministic safety checks run before and after AI reasoning.
- Gemma is used for explainable differential reasoning, not for final unchecked authority.
- Offline guideline packs and rule-based triage stay available without internet.
- Fallback results are returned if the model is unavailable.
- Compact structured prompts reduce latency for Ollama/LiteRT demos.

## Evaluation Metrics

The `/api/diagnoses/evaluation` endpoint reports:

- Accuracy across demo clinic scenarios.
- Red-flag recall for emergency cases.
- Latency summary, including average and p95.
- Reliability and fallback rate.
- Pass/fail details for each medical scenario.

## Video Talking Points

1. Open on a rural clinic with no internet and a long patient queue.
2. Health worker taps Start Consultation and speaks symptoms.
3. Agentic diagnosis identifies a high-risk presentation.
4. Safety guardrails escalate urgent referral even if the AI is uncertain.
5. Treatment screen gives practical next steps and cached guideline advice.
6. Performance screen proves latency, reliability, fallback rate, and accuracy.
