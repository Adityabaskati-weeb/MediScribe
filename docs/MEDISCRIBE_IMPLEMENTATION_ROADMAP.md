# MediScribe Implementation Roadmap

This is the main implementation guide for the MediScribe hackathon project. It
expands the four-phase `ROADMAP.md` into the 28-day build plan described in the
uploaded package.

## Complete File Structure

```text
MediScribe/
|-- mobile/          React Native app with voice, OCR, SQLite, sync, and screens
|-- backend/         Node/Express API with Gemma/Ollama, PostgreSQL, validation, logging
|-- dashboard/       React dashboard for analytics, patient review, reports, settings
|-- model_training/  Training, evaluation, metrics, adapter artifact generation
|-- docker/          Dockerfiles and Compose services
|-- docs/            Setup, API, deployment, demo, video, writeup, roadmap guides
|-- scripts/         Local verification helpers
`-- tests/           Roadmap and architecture alignment tests
```

## Week 1: Foundation

### Day 1-2: Environment Setup

- Install Node.js, npm, Python, Docker, Git, Ollama, Expo tooling, and VS Code extensions.
- Configure `.env` values from `backend/.env.example` and `mobile/.env.example`.
- Run `scripts/verify_environment.ps1`.
- Confirm `npx expo install --check`, backend build, dashboard build, and Python tooling.

### Day 3-4: Ollama And Gemma

- Pull the local Gemma model with `ollama pull gemma2:2b`.
- Keep inference wrapped in `backend/src/services/gemmaService.ts`.
- Normalize model responses into structured JSON.
- Keep deterministic fallback guardrails in `backend/src/services/analysisService.ts`.
- Verify with `npm run test:gemma`; set `RUN_OLLAMA_TESTS=1` for the live Ollama test.

### Day 5-6: Database Schema

- Mobile SQLite schema lives in `mobile/src/services/databaseService.ts`.
- Backend PostgreSQL schema lives in `backend/src/config/database.ts`.
- Required tables include patients, consultations, diagnoses, treatments, chart images, sync queues, and offline intake.
- Verify sync endpoints in `backend/src/routes/sync.ts`.

### Day 7: Review And Commit

- Run `pytest`.
- Run backend build and integration tests.
- Run mobile TypeScript validation.
- Run dashboard production build.
- Commit and push to GitHub `main`.

## Week 2: Core Features

### Day 8-9: Speech-To-Text

- Use `mobile/src/services/speechService.ts`.
- Support multilingual symptom capture and text-to-speech response.
- Integrate through `mobile/src/components/VoiceInput.tsx`.
- Persist captured symptoms into local SQLite.

### Day 10-11: OCR

- Use `mobile/src/services/ocrService.ts`.
- Use `mobile/src/components/ChartOCR.tsx` for chart capture.
- Parse chart text into vitals, medications, diagnoses, and confidence.
- Store chart images and parsed chart text locally.

### Day 12-14: Diagnosis Engine

- Use `backend/src/services/gemmaService.ts` for Gemma/Ollama prompts.
- Use `backend/src/services/analysisService.ts` for red flags, urgency, differential diagnosis, and treatment planning.
- Use `backend/src/routes/diagnoses.ts` for API integration.
- Test with `npm run test:integration`.

## Week 3: Mobile UI

### Day 15-16: Forms

- Use `mobile/src/components/PatientForm.tsx`.
- Keep intake offline-first and persist patient records locally.
- Validate required demographics and symptoms before diagnosis generation.

### Day 17-20: Components And Navigation

- Use `mobile/src/components/SymptomChecker.tsx`.
- Use `mobile/src/components/DiagnosisResult.tsx`.
- Use `mobile/src/components/PatientHistory.tsx`.
- Use screens in `mobile/src/screens/` for Home, New Patient, Diagnosis, and History.
- Keep navigation wired through `mobile/src/App.tsx`.

### Day 21: Testing

- Run `cd mobile && npx tsc --noEmit`.
- Open the Expo app on a real device when possible.
- Confirm patient intake, OCR, voice, history, and sync queue flows.

## Week 4: Backend And Deployment

### Day 22-23: Backend API

- Use Express routes in `backend/src/routes/`.
- Keep validators in `backend/src/utils/validators.ts`.
- Keep logging, auth, rate limiting, and error handling in `backend/src/middleware/`.
- Keep API docs in `backend/openapi.yaml` and `docs/API.md`.

### Day 24-25: Dashboard

- Use `dashboard/src/pages/Dashboard.tsx` for KPIs and charts.
- Use Patients, Reports, and Settings pages for clinic review workflows.
- Verify with `npm run build` in `dashboard/`.

### Day 26: Model Training

- Run `python model_training/prepare_data.py`.
- Run `python model_training/train.py`.
- Run `python model_training/evaluate.py`.
- Confirm metrics and evaluation artifacts in `model_training/outputs/`.

### Day 27: Docker

- Use `docker/docker-compose.yml`.
- Confirm services: PostgreSQL, backend, dashboard, Ollama.
- Run `docker compose up --build` from `docker/`.

### Day 28: Video, Writeup, Submit

- Use `docs/MEDISCRIBE_VIDEO_SCRIPT.md`.
- Use `docs/MEDISCRIBE_SUBMISSION_WRITEUP.md`.
- Use `docs/MEDISCRIBE_DEPLOYMENT_CHECKLIST.md`.
- Confirm GitHub main branch is clean and public.

## Testing Strategy

- Roadmap alignment: `pytest`.
- Backend compile: `npm run build --prefix backend`.
- Backend integration: `npm run test:integration --prefix backend`.
- Backend unit: `npm run test:unit --prefix backend`.
- Optional live Gemma: `RUN_OLLAMA_TESTS=1 npm run test:gemma --prefix backend`.
- Mobile typing: `cd mobile && npx tsc --noEmit`.
- Dashboard production build: `npm run build --prefix dashboard`.
- Model evaluation: `python model_training/evaluate.py`.

## Video Creation Guide

Show these moments in order:

1. Rural clinic problem.
2. Open the mobile app.
3. Register patient.
4. Capture symptoms by voice.
5. Scan chart with OCR.
6. Generate diagnosis and treatment plan.
7. Show red flags and referral guidance.
8. Show history and offline queue.
9. Show dashboard KPIs and reports.
10. End with GitHub, metrics, and impact.
