# MediScribe Demo-Ready Outputs

## Hero Story Runbook

Do not start the pitch with architecture. Start with pressure.

1. Show a rural clinic where the network is down and the queue is long.
2. Introduce one patient: 32 weeks pregnant with bleeding, abdominal pain, and dizziness.
3. Open MediScribe and run Airplane Mode Emergency Demo.
4. Pause on the red REFER NOW state.
5. Show the AI Safety Council: Diagnosis, Reasoning, Treatment, and Safety agents.
6. Show the referral handoff summary in clean, readable language.
7. Switch to the dashboard and show how offline visits become clinic intelligence.

The sentence judges should remember: sync can wait, red flags cannot.

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

1. Open on the problem, not the app: one health worker, no internet, 50 patients waiting.
2. Show the phone offline so the viewer immediately understands the constraint.
3. Run the Airplane Mode Emergency Demo with the maternal danger-sign case.
4. Let the REFER NOW screen land before explaining the model.
5. Show the Safety Agent overriding routine advice because red flags are present.
6. Show the clean referral handoff as the practical output a real worker can use.
7. Use the dashboard Outbreak Radar and benchmark metrics as proof that this is a system, not a mockup.
8. Close with the GitHub repo, local Gemma 4 via Ollama, and the core line: local medical AI for the places the cloud cannot reach.
