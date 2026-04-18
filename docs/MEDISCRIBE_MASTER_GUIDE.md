# MediScribe Master Guide

This is the start-here guide for the MediScribe implementation. It keeps the
project aligned with the uploaded package and points each hackathon task to the
right implementation files in this repository.

## Project Scope

MediScribe is an offline-first AI medical assistant for rural clinics. The
architecture follows the uploaded plan:

- React Native mobile app for patient intake, voice symptoms, OCR, diagnosis results, and history.
- SQLite on device for offline patient, consultation, diagnosis, treatment, chart, and sync data.
- Node.js/Express backend for patients, diagnoses, dashboard data, and sync APIs.
- PostgreSQL schema for production persistence.
- Ollama plus Gemma for local medical reasoning and translation support.
- React dashboard for clinic analytics, patient review, reports, and settings.
- Docker Compose for PostgreSQL, backend, dashboard, and Ollama deployment.

## Quick Navigation By Task

### I need to start from scratch

1. Read this guide.
2. Do the environment setup in `docs/MEDISCRIBE_ENVIRONMENT_SETUP.md`.
3. Implement or verify Week 1 in `ROADMAP.md` and `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
4. Run `scripts/verify_environment.ps1`.

### I am on Day 10 and need to implement OCR

1. Check Day 10-11 in `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
2. Follow the Week 2 OCR section in `ROADMAP.md`.
3. Use `mobile/src/services/ocrService.ts` and `mobile/src/components/ChartOCR.tsx`.
4. Confirm the parser returns structured vitals, chart text, and confidence.

### I need to build the diagnosis system

1. Reference Days 12-13 in `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
2. Confirm Ollama/Gemma setup from `docs/MEDISCRIBE_ENVIRONMENT_SETUP.md`.
3. Use `backend/src/services/gemmaService.ts` for model inference.
4. Use `backend/src/services/analysisService.ts` for deterministic clinical guardrails.
5. Test with `npm run test:integration` and optionally `RUN_OLLAMA_TESTS=1 npm run test:gemma`.

### I need to debug database issues

1. Start with the Troubleshooting section in `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
2. Deep dive into PostgreSQL and SQLite setup in `docs/MEDISCRIBE_ENVIRONMENT_SETUP.md`.
3. Check mobile schema in `mobile/src/services/databaseService.ts`.
4. Check backend schema in `backend/src/config/database.ts`.
5. Run `scripts/verify_environment.ps1`.

### I am ready to deploy

1. Use the readiness checks in `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
2. Use Docker commands from `docs/DEPLOYMENT.md`.
3. Verify environment requirements with `scripts/verify_environment.ps1`.
4. Confirm `docker/docker-compose.yml` includes PostgreSQL, backend, dashboard, and Ollama.

### I need to create the submission video

1. Use `docs/MEDISCRIBE_VIDEO_SCRIPT.md`.
2. Follow the Video Production Checklist in `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
3. Show the mobile flow, red-flag triage, dashboard metrics, offline sync, and model metrics.

### I need to write the technical writeup

1. Use the Writeup Structure in `docs/MEDISCRIBE_QUICK_REFERENCE.md`.
2. Pull implementation details from Week 4 in `ROADMAP.md`.
3. Use metrics from `model_training/outputs/metrics.json` after running evaluation.
4. Final writeup lives in `docs/MEDISCRIBE_SUBMISSION_WRITEUP.md`.

## Content Distribution

| Document | Purpose | Repo location |
| --- | --- | --- |
| Master Guide | Overview, strategy, navigation | `docs/MEDISCRIBE_MASTER_GUIDE.md` |
| Roadmap | Four-week implementation plan | `ROADMAP.md` |
| Quick Reference | Daily checklist, commands, metrics, troubleshooting | `docs/MEDISCRIBE_QUICK_REFERENCE.md` |
| Environment Setup | Installation, dependencies, verification | `docs/MEDISCRIBE_ENVIRONMENT_SETUP.md` |
| Code Templates | Reusable backend/mobile/test patterns | `docs/MEDISCRIBE_CODE_TEMPLATES.md` |
| Package README | Project entry point and doc links | `README.md` |

## File Organization

The uploaded package uses this start-here organization:

```text
Your Downloads/
|-- MEDISCRIBE_MASTER_GUIDE.md           START HERE
|-- MEDISCRIBE_IMPLEMENTATION_ROADMAP.md MAIN GUIDE
|-- MEDISCRIBE_QUICK_REFERENCE.md        DAILY CHECKLIST
|-- MEDISCRIBE_ENVIRONMENT_SETUP.md      SETUP
`-- MEDISCRIBE_CODE_TEMPLATES.md         CODE SNIPPETS
```

This repository keeps those roles in the checked-in implementation docs:

```text
MediScribe/
|-- README.md
|-- ROADMAP.md
|-- docs/
|   |-- MEDISCRIBE_MASTER_GUIDE.md
|   |-- MEDISCRIBE_QUICK_REFERENCE.md
|   |-- MEDISCRIBE_ENVIRONMENT_SETUP.md
|   `-- MEDISCRIBE_CODE_TEMPLATES.md
|-- mobile/
|-- backend/
|-- dashboard/
|-- model_training/
`-- docker/
```

## Recommended Reading Order

1. `docs/MEDISCRIBE_MASTER_GUIDE.md` - 20 minute project overview and navigation.
2. `docs/MEDISCRIBE_ENVIRONMENT_SETUP.md` - 1-2 hour setup and verification pass.
3. `ROADMAP.md` - ongoing implementation reference for the four phases.
4. `docs/MEDISCRIBE_CODE_TEMPLATES.md` - use as needed while coding.
5. `docs/MEDISCRIBE_QUICK_REFERENCE.md` - daily checklist, commands, metrics, and fixes.

## Unique Features Of This Package

- Production-ready code: implemented services, screens, routes, tests, Docker, and docs.
- Copy-paste ready patterns: reusable backend middleware, mobile hooks, API client patterns, and tests.
- Day-by-day breakdown: 28-day checklist with phase checkpoints.
- Real stack: React Native, Expo SDK 54, SQLite, Node/Express, PostgreSQL, Ollama/Gemma, React, Docker.
- Error handling: backend error middleware, validators, logging, rate limiting, and troubleshooting docs.
- Testing: unit tests, integration tests, roadmap alignment tests, TypeScript validation, and model evaluation.
- Deployment: Dockerfiles, Compose orchestration, health checks, and deployment guide.
- Hackathon optimized: demo guide, video script, writeup, metrics, and winning strategy.
- Multi-platform: Windows-focused local commands with stack choices that also work on macOS and Linux.
- Medical focus: clinical red flags, urgency scoring, referral guidance, vitals parsing, and treatment planning.

## Implementation Timeline

### Week 1: Foundation

- Day 1-2: environment setup, repository structure, dependency checks.
- Day 3-4: Ollama and Gemma service wrapper.
- Day 5-6: SQLite and PostgreSQL schema foundations.
- Day 7: review, alignment tests, and commit.

### Week 2: Core Features

- Day 8-9: speech-to-text and multilingual symptom capture.
- Day 10-11: OCR chart capture and medical text parsing.
- Day 12-14: diagnosis engine with Gemma integration and clinical guardrails.
- Checkpoint: speech, OCR, diagnosis, database, and backend integration working.

### Week 3: Mobile UI

- Day 15-16: patient registration and symptom forms.
- Day 17-20: diagnosis results, patient history, navigation, and sync surfaces.
- Day 21: mobile validation and Expo device testing.

### Week 4: Backend And Deployment

- Day 22-23: backend API hardening, validation, logging, rate limiting, sync.
- Day 24-25: dashboard analytics, patient review, reports, and settings.
- Day 26: model training/evaluation artifacts.
- Day 27: Docker deployment checks.
- Day 28: video, writeup, demo guide, and final submission checklist.

## Winning Strategy

- Lead with real impact: rural clinics need offline triage support where specialists and internet are unreliable.
- Show technical depth: mobile offline SQLite, sync queue, backend APIs, Gemma/Ollama inference, dashboard, and Docker.
- Demonstrate safety: red-flag detection, confidence scoring, referral guidance, and deterministic guardrails.
- Prove readiness: tests, setup verification, evaluation metrics, Docker deployment, and clear submission docs.

## Pre-Submission Checklist

- `pytest` passes.
- `npm run build --prefix backend` passes.
- `npm run test:integration --prefix backend` passes.
- `npm run build --prefix dashboard` passes.
- `cd mobile && npx tsc --noEmit` passes.
- `python model_training/train.py` and `python model_training/evaluate.py` generate artifacts.
- Expo Go opens the mobile app with the SDK version in `mobile/package.json`.
- Docker Compose starts the production services.
- GitHub repo is public and `main` contains the final implementation.
- Video script, writeup, deployment checklist, and demo guide are complete.
