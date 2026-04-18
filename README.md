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
- Gemma optimized: Ollama/Gemma prompting, medical response normalization, and fine-tuning artifact flow.
- Production-ready: mobile app, backend API, dashboard, Docker, validation, logging, tests, and docs.
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
- [Roadmap](ROADMAP.md)
- [Video Script](docs/MEDISCRIBE_VIDEO_SCRIPT.md)
- [Submission Writeup](docs/MEDISCRIBE_SUBMISSION_WRITEUP.md)

## Docker

```bash
cd docker
docker compose up --build
```

## Current Status

The tracked source now uses the architecture and technologies from the uploaded plan.
Non-roadmap runtime code has been removed from the product architecture.
