# MediScribe 3-Minute Demo Script

## 0:00-0:20 Problem

Rural clinics need fast triage support, offline records, and clear escalation guidance.

## 0:20-1:00 Mobile Workflow

Show the React Native app scaffold:

- new patient form
- voice symptom capture
- OCR chart scan
- diagnosis result view
- patient history

## 1:00-1:45 Backend Workflow

Show the Node/Express API:

- `POST /api/diagnoses/generate`
- `POST /api/offline/intake`
- `POST /api/offline/queue/:draftId/analyze`
- `GET /api/sync/pending`

Explain that Gemma/Ollama is wrapped in the backend service and safety guardrails remain local.

## 1:45-2:25 Dashboard

Show dashboard metrics, patient list, reports, and sync status.

## 2:25-2:50 Model Training

Show `model_training/` with prepared data, Gemma adapter metadata, metrics output, and evaluation report.

## 2:50-3:00 Close

MediScribe is an offline-first medical assistant built with React Native, Node/Express,
React dashboard, PostgreSQL/SQLite, Docker, and Gemma/Ollama.
