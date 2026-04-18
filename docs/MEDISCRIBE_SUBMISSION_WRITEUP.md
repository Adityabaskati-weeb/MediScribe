# MediScribe: Offline AI Medical Assistant for Rural Clinics

MediScribe is an offline-first clinical assistant designed for rural health workers.
It follows a mobile-first architecture: React Native for patient intake, local SQLite
for offline persistence, a Node/Express backend for APIs, PostgreSQL for central
storage, a React dashboard for clinic analytics, Docker for deployment, and Gemma via
Ollama for AI-assisted reasoning.

## Product Flow

A health worker creates or selects a patient in the mobile app, captures symptoms by
typing, voice, or OCR, and submits the case for analysis. The backend evaluates red
flags, triage urgency, possible diagnoses, recommended tests, and immediate actions.
When the clinic is offline, the mobile app queues records locally and syncs them later.

## Technical Architecture

- `mobile/`: React Native app with patient form, voice input, OCR placeholder, diagnosis
  result, and history screens.
- `backend/`: Express API with diagnosis, patient, sync, Gemma, validation, and database
  modules.
- `dashboard/`: React dashboard for analytics and patient review.
- `model_training/`: Gemma fine-tuning scaffold and evaluation artifacts.
- `docker/`: Compose stack for backend, dashboard, PostgreSQL, and Ollama.

## AI and Safety

Gemma/Ollama support is implemented through the backend service wrapper. The application
keeps deterministic safety guardrails local so high-risk cases are still handled even
when model serving is unavailable.

## Submission Readiness

The repository includes setup, API, deployment, demo, evaluation, and video-script docs.
The structure mirrors the uploaded implementation roadmap and is ready for continued
feature completion without changing technology direction.
