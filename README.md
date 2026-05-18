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

## Story Judges Should Remember

A rural health worker is offline, the waiting line is long, and a 32-week
pregnant patient arrives with bleeding, abdominal pain, and dizziness.
MediScribe catches the red flag locally, explains the risk in simple language,
creates a referral handoff, saves the visit on-device, and syncs later.

Core demo line: sync can wait, red flags cannot.

## Hackathon Differentiators

- Offline-first: mobile SQLite, local history, offline triage fallback, and sync queue.
- Uses Gemma 4: `gemma4:e4b` through Ollama, medical response normalization, and fine-tuning artifact flow.
- Production-ready: mobile app, backend API, dashboard, Docker, validation, logging, tests, and docs.
- Agentic safety pipeline: diagnosis, reasoning, treatment, and safety agents with audit logs.
- Measurable impact: 26-case system benchmark, 100% current pass rate, 100% red-flag recall, and a published Unsloth adapter trained from 32 curated SFT rows plus a 26-case adapter benchmark pack.
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
mobile/          React Native app with voice, chart-scan assist, SQLite, sync
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

Model training and Unsloth fine-tuning:

```bash
python model_training/prepare_data.py
python model_training/validate_dataset.py
python model_training/train.py --dry-run
# On a CUDA GPU or Hugging Face Jobs:
python model_training/train.py --base-model unsloth/gemma-4-E4B-it-unsloth-bnb-4bit --load-in-4bit --max-steps 150
python model_training/evaluate.py
```

Published adapter proof:

- Model repo: `https://hf.co/prodigyhuh/mediscribe-medical-adapter`
- Completed GPU job: `https://huggingface.co/jobs/prodigyhuh/6a096bf83308d79117b91adc`
- Base model for the public adapter: `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`
- Training pack: 32 curated SFT rows, 6 held-out eval rows, 26 post-training benchmark cases

The fine-tuning dataset is a curated scenario pack for rural-clinic workflows.
It is not a real-patient validation set and should be described that way in the
submission.

If you push adapter weights to Hugging Face, use a `write` token whose account
matches the namespace in `--hub-model-id`. For example,
`prodigyhuh/mediscribe-medical-adapter` needs a token that can write under
`prodigyhuh`.

## Backend Endpoints

- `GET /health`
- `POST /api/diagnoses/generate`
- `POST /api/diagnoses/agentic`
- `POST /api/diagnoses/chart-vision`
- `GET /api/diagnoses/evaluation`
- `GET /api/diagnoses/performance`
- `GET /api/diagnoses/demo-cases`
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
- [Winning Phase Implementation](docs/WINNING_PHASE_IMPLEMENTATION.md)
- [Hackathon Readiness Scorecard](docs/HACKATHON_READINESS_SCORECARD.md)
- [Video Production Playbook](docs/MEDISCRIBE_VIDEO_SCRIPT.md)
- [English Voiceover Script](docs/MEDISCRIBE_VIDEO_VOICEOVER_EN.md)
- [English Subtitle File](docs/MEDISCRIBE_VIDEO_SUBTITLES_EN.srt)
- [AI Dubbing Handoff](docs/AIDUBBING_VIDEO_HANDOFF.md)
- [Unsloth Fine-Tuning](docs/UNSLOTH_FINE_TUNING.md)
- [Roadmap](ROADMAP.md)
- [Submission Writeup](docs/MEDISCRIBE_SUBMISSION_WRITEUP.md)

## Judge Quick Review

```bash
npm test --prefix backend
npm run test:agentic --prefix backend
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
