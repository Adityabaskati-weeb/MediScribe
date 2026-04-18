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

Claim: optimized for medical cases through Gemma/Ollama prompting and training
artifacts.

Evidence:

- Ollama/Gemma wrapper: `backend/src/services/gemmaService.ts`.
- Diagnosis prompt and response normalization: `backend/src/services/analysisService.ts`.
- Training data: `model_training/data/medical_dataset.csv`.
- Fine-tuning artifact script: `model_training/train.py`.
- Evaluation script and metrics: `model_training/evaluate.py`.

Note: the checked-in path is a hackathon-safe fine-tuning scaffold that emits
adapter metadata and evaluation artifacts. Full GPU training can be run later on
Hugging Face Jobs or another GPU environment.

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

## Measurable Impact

Claim: clear metrics.

Tracked metrics:

- Diagnosis accuracy: 91%.
- Red-flag recall: 100%.
- Average inference target: 3.2 seconds.
- Offline availability target: 100% for intake/history.
- Sync success target: above 95%.

Metric files:

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
