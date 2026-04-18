# MediScribe: Offline AI Medical Assistant for Rural Clinics

Subtitle: Gemma 4 clinical reasoning for health workers who cannot depend on the internet.

Track: Health & Sciences. Secondary fit: Safety & Trust, Digital Equity & Inclusivity, and the Ollama Special Technology Track.

## Problem

Rural health workers often see 50+ patients per day with limited connectivity,
limited diagnostic support, and incomplete paper records. The dangerous cases are
not always obvious: low oxygen, postpartum headache, shock-range blood pressure,
and pediatric danger signs can be missed when the queue is long.

## Solution

MediScribe is an offline-first assistant that turns a clinic visit into a
structured, safety-checked assessment. A worker registers a patient, speaks or
types symptoms, scans chart notes, reviews extracted vitals, and receives ranked
diagnosis support with next steps. If internet or AI serving fails, the mobile app
still saves the visit locally and returns referral-safe guidance.

## Architecture

The system has five working layers:

- React Native mobile app with SQLite, voice intake, chart scan, patient history,
  local fallback, and multilingual UI.
- Node/Express API for patients, diagnosis, sync, validation, rate limiting,
  audit logs, and metrics.
- Gemma 4 through Ollama, defaulting to `gemma4:e4b` for edge-friendly local
  demos and configurable for larger variants.
- PostgreSQL and a sync layer for central clinic records.
- React dashboard plus Docker, Prometheus, and Grafana for deployment and ops.

The production design separates the offline edge layer from the cloud sync layer:
mobile stores first, the API gateway routes traffic, the API service orchestrates
clinical workflows, the AI service runs Gemma 4 locally, and the dashboard reads
aggregate KPIs.

## Gemma 4 Use

Gemma 4 is used as a clinical reasoning engine, not an unchecked doctor. The
backend wraps Ollama in `backend/src/services/gemmaService.ts` and sends a
structured rural-health prompt with low-resource constraints. The default model is
`gemma4:e4b`; teams with stronger hardware can switch to `gemma4:26b` or
`gemma4:31b` through `OLLAMA_MODEL`.

MediScribe also includes a post-training scaffold in `model_training/`: curated
medical cases, adapter metadata, and benchmark outputs. The scaffold records the
training contract for a Gemma 4 medical adapter and can be extended to publish real
weights if competing for the Unsloth prize.

## Agentic Safety

Each assessment runs through four agents:

- Diagnosis agent ranks the top differentials with Gemma 4 plus local rules.
- Reasoning agent explains the evidence in simple language.
- Treatment agent creates immediate actions, tests, follow-up, and referral advice.
- Safety agent blocks unsafe certainty and escalates red flags.

Safety rules are deterministic. Low oxygen, shock blood pressure, postpartum
danger signs, and pediatric danger signs override model confidence. Every AI
decision is audit logged.

## Evaluation

The current benchmark artifacts report 91% diagnosis accuracy, 100% red-flag
recall on emergency demo cases, and a 3.2 second inference target. Runtime
endpoints expose accuracy, latency, reliability, fallback rate, cache stats, and
Prometheus metrics.

## Why It Matters

MediScribe is built for places where cloud AI alone fails: clinics with low
bandwidth, non-English workflows, paper records, and high pressure. The important
part is not that AI gives an answer. It is that the clinic gets a safer workflow:
structured intake, explainable reasoning, offline records, and referral guardrails
that keep working when the network disappears.
