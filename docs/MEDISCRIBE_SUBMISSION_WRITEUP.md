# MediScribe: Offline AI Medical Assistant for Rural Clinics

Subtitle: Gemma 4 clinical reasoning for health workers who cannot depend on the internet.

Track: Health & Sciences. Secondary fit: Safety & Trust, Digital Equity & Inclusivity, and the Ollama Special Technology Track.

## Story First Summary

MediScribe is built around one clinic moment: a rural health worker has no
internet, a long queue, and a pregnant patient with bleeding and abdominal pain.
The app's job is not to look clever. It is to catch the danger sign, explain it
in plain language, create a referral plan, save the visit offline, and sync
later.

The demo's "wow" moment is the Airplane Mode Emergency Demo: the phone is
offline, but MediScribe still shows REFER NOW, highlights the Safety Agent
escalation, and creates a clean handoff summary for the receiving hospital.

## Problem

Rural health workers often see 50+ patients per day with limited connectivity,
limited diagnostic support, and incomplete paper records. The dangerous cases are
not always obvious: low oxygen, postpartum headache, shock-range blood pressure,
and pediatric danger signs can be missed when the queue is long. In the story we
show judges, the failure mode is delay: a life-threatening maternal emergency can
look like one more routine abdominal pain case unless the workflow forces the red
flag to the front.

## Solution

MediScribe is an offline-first assistant that turns a clinic visit into a
structured, safety-checked assessment. A worker registers a patient, speaks or
types symptoms, scans chart notes, reviews extracted vitals, and receives ranked
diagnosis support with next steps. If internet or AI serving fails, the mobile app
still saves the visit locally and returns referral-safe guidance.

The solution is intentionally safety-led: red flags outrank confidence scores,
plain-language reasoning outranks technical jargon, and urgent referral can be
triggered before any network sync happens.

## Demo Wow Moment

The video should feel like a real clinic scene, not a feature tour:

1. The phone is offline.
2. A pregnant patient reports bleeding, abdominal pain, and dizziness.
3. The worker taps Airplane Mode Emergency Demo.
4. MediScribe shows REFER NOW and "Sync can wait. Red flags cannot."
5. The AI Safety Council shows Diagnosis, Reasoning, Treatment, and Safety agents.
6. The referral handoff is clean enough to read aloud or send with the patient.
7. The dashboard turns many offline visits into outbreak and clinic-risk insight.

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

MediScribe also includes an Unsloth LoRA fine-tuning path in `model_training/`:
curated medical cases, Gemma 4 chat SFT conversion, dataset validation, a GPU
training script, adapter model-card generation, and optional Hugging Face Hub
publishing. The Unsloth prize should be claimed only after the public adapter
weights and benchmark metrics are linked.

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

MediScribe includes a 26-case rural clinic benchmark covering cardiac,
neurology, maternal, pediatric, infectious, respiratory, and general-care
scenarios. The current runtime benchmark reports 100% pass rate, 100% top-3
diagnosis match, 88.5% urgency match with safety-first over-triage, 100%
red-flag recall, and 100% offline intake success. Runtime endpoints expose
accuracy, latency, reliability, fallback rate, cache stats, and Prometheus
metrics.

## Why It Matters

MediScribe is built for places where cloud AI alone fails: clinics with low
bandwidth, non-English workflows, paper records, and high pressure. The important
part is not that AI gives an answer. It is that the clinic gets a safer workflow:
structured intake, explainable reasoning, offline records, and referral guardrails
that keep working when the network disappears.

## Attribution

MediScribe is an independent application that uses Gemma 4 models through Ollama
for AI-powered features.

Gemma is a trademark of Google LLC.

MediScribe is not affiliated with, endorsed by, or sponsored by Google.
