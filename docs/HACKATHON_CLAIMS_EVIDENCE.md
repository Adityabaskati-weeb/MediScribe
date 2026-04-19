# Hackathon Claims Evidence

This document ties the submission claims to concrete files, tests, and metrics in
the repository.

## Offline-First

Claim: works without internet.

Evidence:

- Mobile SQLite schema and queue: `mobile/src/services/databaseService.ts`.
- Offline assessment fallback: `mobile/src/screens/DiagnosisScreen.tsx`.
- Sync queue and acknowledgement API: `backend/src/routes/sync.ts`.
- Offline API intake flow: `backend/src/routes/sync.ts` and `backend/src/services/clinicalEngine.ts`.

## Gemma Optimized

Claim: optimized for medical cases through Gemma/Ollama prompting and an
Unsloth-ready adapter training pipeline.

Evidence:

- Ollama/Gemma wrapper: `backend/src/services/gemmaService.ts`.
- Runtime profile endpoint: `GET /api/system/architecture` returns the local
  Ollama endpoint, configured model, quantization guidance, and attribution.
- Diagnosis prompt and response normalization: `backend/src/services/analysisService.ts`.
- Training source data: `model_training/data/medical_dataset.csv`.
- Gemma 4 chat SFT conversion: `model_training/prepare_data.py`.
- Dataset validation before GPU spend: `model_training/validate_dataset.py`.
- Unsloth LoRA SFT script: `model_training/train.py`.
- Fine-tuning runbook: `docs/UNSLOTH_FINE_TUNING.md`.
- Evaluation script and metrics: `model_training/evaluate.py`.

Note: the repository now contains the real Unsloth training path. Do not claim a
published Unsloth adapter until a GPU run completes and public adapter weights
plus benchmarks are linked in the Kaggle writeup.

## Production-Ready

Claim: more than a prototype.

Evidence:

- Node/Express backend with controllers, middleware, validation, logging, rate
  limiting, and OpenAPI docs.
- React Native mobile app with offline storage, native speech build path, chart
  scan flow, and local triage fallback.
- React dashboard with analytics and reports.
- Docker Compose stack for PostgreSQL, backend, dashboard, and Ollama.
- Test suite: `pytest`, backend unit/diagnosis/integration tests, TypeScript
  validation, dashboard build.
- Agent benchmark suite: `backend/src/data/evaluationScenarios.ts` covers 26
  rural clinic cases across cardiac, maternal, pediatric, infectious,
  respiratory, neurology, and general care.

## Measurable Impact

Claim: clear metrics.

Tracked metrics:

- Agentic benchmark accuracy: 100% pass rate on the 26-case safety benchmark.
- Top-3 diagnosis match rate: 100% on the current scenario pack.
- Urgency match rate: 88.5% with safety-first over-triage accepted.
- Red-flag recall: 100% on emergency benchmark cases.
- Average inference target: 3.2 seconds.
- Offline availability target: 100% for intake/history.
- Sync success target: above 95%.

Metric files:

- Runtime endpoint: `GET /api/diagnoses/evaluation`.
- Backend test: `backend/src/tests/agentic.test.ts`.
- `model_training/outputs/metrics.json`.
- `model_training/outputs/evaluation_report.md`.
- `docs/MEDISCRIBE_EVALUATION_REPORT.md`.
- `docs/MEDISCRIBE_QUICK_REFERENCE.md`.

## Open Source

Claim: sustainable and replicable.

Evidence:

- MIT license: `LICENSE`.
- Setup docs: `docs/MEDISCRIBE_ENVIRONMENT_SETUP.md`.
- Docker deployment: `docs/DEPLOYMENT.md` and `docker/docker-compose.yml`.
- Public GitHub target: `https://github.com/Adityabaskati-weeb/MediScribe`.

## Real-World Tested

Claim: built with actual clinic scenarios.

Evidence:

- Scenario dataset: `model_training/data/medical_dataset.csv`.
- Clinic scenario walkthroughs: `docs/CLINIC_SCENARIOS.md`.
- Integration test includes rural voice intake with chest pain, unstable vitals,
  sync queue, and red-flag triage.

The scenarios represent realistic clinic workflows and benchmark cases, not a
completed clinical validation study.
