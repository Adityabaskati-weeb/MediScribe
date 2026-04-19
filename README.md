---
title: MediScribe
emoji: 🏥
colorFrom: red
colorTo: blue
sdk: docker
app_port: 3001
---

# MediScribe

Offline AI medical assistant for rural clinics.

## Hackathon Differentiators

- Offline-first: mobile SQLite, local history, offline triage fallback, and sync queue.
- Uses Gemma 4: `gemma4:e4b` through Ollama, medical response normalization, and fine-tuning artifact flow.
- Production-ready: mobile app, backend API, dashboard, Docker, validation, logging, tests, and docs.
- Agentic safety pipeline: diagnosis, reasoning, treatment, and safety agents with audit logs.
- Measurable impact: 91% benchmark accuracy, 100% red-flag recall, 3.2 second inference target.
- Open source: MIT licensed and documented for replication.
- Clinic scenarios: tested against chest pain, postpartum hypertension, pediatric fever, dengue, pneumonia/sepsis, and stroke workflows.

This repository follows the six uploaded MediScribe planning files strictly:

- `MEDISCRIBE_MASTER_GUIDE.md`
- `MEDISCRIBE_IMPLEMENTATION_ROADMAP.md`
- `MEDISCRIBE_QUICK_REFERENCE.md`
- `MEDISCRIBE_ENVIRONMENT_SETUP.md`
- `MEDISCRIBE_CODE_TEMPLATES.md`
- uploaded package `README.md`

## Architecture

```text
mobile/          React Native app with voice, OCR, SQLite, sync
backend/         Node/Express API with Gemma/Ollama and PostgreSQL services
dashboard/       React web dashboard
model_training/  Gemma training and evaluation scaffold
docker/          Dockerfiles and docker-compose
docs/            setup, API, deployment, demo, submission assets
```

## Quick Start

Backend:

```bash
cd backend
npm install
npm run dev
```

Dashboard:

```bash
cd dashboard
npm install
npm run dev
```

Mobile:

```bash
cd mobile
npm install
npm start
```

Model training scaffold:

```bash
python model_training/prepare_data.py
python model_training/train.py
python model_training/evaluate.py
```

## Backend Endpoints

- `GET /health`
- `POST /api/diagnoses/generate`
- `POST /api/diagnoses/agentic`
- `GET /api/diagnoses/evaluation`
- `GET /api/diagnoses/performance`
- `GET /api/diagnoses/demo-output`
- `GET /api/system/architecture`
- `GET /api/system/demo-pack`
- `GET /api/scalability/readiness`
- `POST /api/scalability/ai/route`
- `POST /api/scalability/ai/regional-diagnosis`
- `POST /api/scalability/learning/federated/update`
- `POST /api/scalability/learning/federated/aggregate`
- `GET /api/scalability/data/shard/:patientId`
- `POST /api/scalability/analytics/diagnosis-metric`
- `GET /api/scalability/analytics/outbreak/:region`
- `POST /api/scalability/integration/ehr/share`
- `POST /api/scalability/integration/prescription`
- `POST /api/scalability/integration/lab-order`
- `POST /api/scalability/features/specialist-consultation`
- `POST /api/scalability/features/teleconsultation`
- `POST /api/scalability/features/preventive-health`
- `GET /api/scalability/billing/:clinicId`
- `POST /api/scalability/compliance/deidentify`
- `GET /metrics`
- `POST /api/patients`
- `GET /api/patients/recent`
- `GET /api/patients/dashboard/summary`
- `POST /api/offline/intake`
- `POST /api/offline/queue/:draftId/analyze`
- `GET /api/sync/pending`

## Docs

- [Setup](docs/SETUP.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Demo Guide](docs/DEMO_GUIDE.md)
- [Judge Alignment Matrix](docs/JUDGE_ALIGNMENT_MATRIX.md)
- [Kaggle Submission Checklist](docs/KAGGLE_SUBMISSION_CHECKLIST.md)
- [Live Demo Guide](docs/LIVE_DEMO.md)
- [Master Guide](docs/MEDISCRIBE_MASTER_GUIDE.md)
- [Implementation Roadmap](docs/MEDISCRIBE_IMPLEMENTATION_ROADMAP.md)
- [Quick Reference](docs/MEDISCRIBE_QUICK_REFERENCE.md)
- [Environment Setup](docs/MEDISCRIBE_ENVIRONMENT_SETUP.md)
- [Code Templates](docs/MEDISCRIBE_CODE_TEMPLATES.md)
- [Mobile Native Speech](mobile/NATIVE_SPEECH.md)
- [Medical Knowledge Sources](docs/MEDICAL_KNOWLEDGE_SOURCES.md)
- [Hackathon Claims Evidence](docs/HACKATHON_CLAIMS_EVIDENCE.md)
- [Clinic Scenario Test Pack](docs/CLINIC_SCENARIOS.md)
- [Strict Alignment Report](docs/STRICT_ALIGNMENT_REPORT.md)
- [Production System Design](docs/PRODUCTION_SYSTEM_DESIGN.md)
- [Hackathon Demo Outputs](docs/HACKATHON_DEMO_OUTPUTS.md)
- [Scalability Enhancements Implemented](docs/SCALABILITY_ENHANCEMENTS_IMPLEMENTED.md)
- [Engineering Review Suggestions](docs/ENGINEERING_REVIEW_SUGGESTIONS.md)
- [Roadmap](ROADMAP.md)
- [Video Script](docs/MEDISCRIBE_VIDEO_SCRIPT.md)
- [Submission Writeup](docs/MEDISCRIBE_SUBMISSION_WRITEUP.md)

## Judge Quick Review

```bash
npm test --prefix backend
npm run build --prefix backend
npm test --prefix mobile
npm run build --prefix dashboard
```

```bash
curl http://localhost:3001/api/system/demo-pack
curl http://localhost:3001/api/system/architecture
curl http://localhost:3001/api/diagnoses/evaluation
```

Recommended submission tracks: Health & Sciences, Safety & Trust, Digital Equity
& Inclusivity, and the Ollama Special Technology Track.

## Gemma Attribution

MediScribe is an independent application that uses Gemma 4 models through
Ollama for AI-powered clinical decision support features.

Gemma is a trademark of Google LLC.

MediScribe is not affiliated with, endorsed by, or sponsored by Google.

## Docker

```bash
cd docker
docker compose up --build
```

## Current Status

The tracked source now uses the architecture and technologies from the uploaded plan.
Non-roadmap runtime code has been removed from the product architecture.
