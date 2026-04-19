# MediScribe Quick Reference

This is the daily operating checklist for the current repository. It mirrors the uploaded `MEDISCRIBE_QUICK_REFERENCE.md` and uses commands that match this codebase.

## 28-Day Progress Tracker

| Day | Focus | Checkpoint | Status |
| --- | --- | --- | --- |
| 1-2 | Project and environment setup | Repo, env examples, Node, Expo, Python, Docker docs ready | Done |
| 3-4 | Ollama and Gemma 4 | `backend/src/services/gemmaService.ts` has prompt wrapper, translation, and optional live test | Done |
| 5-6 | Database schema | Mobile SQLite and backend PostgreSQL schemas include patients, consultations, diagnoses, treatment, chart, sync tables | Done |
| 7 | Foundation review | Setup, API, deployment, and alignment docs committed | Done |
| 8-9 | Speech-to-text | `startSpeechRecognition`, `textToSpeech`, multilingual capture flow present | Done |
| 10-11 | OCR | Chart OCR capture and medical text parser present | Done |
| 12-13 | Diagnosis engine | Clinical guardrails plus Gemma/Ollama service wrapper present | Done |
| 14 | Integration test | Backend integration test passes | Done |
| 15-16 | Patient form | React Native registration flow persists locally | Done |
| 17-18 | Diagnosis results | Mobile result card shows urgency, differentials, red flags, treatment, referral | Done |
| 19-20 | Navigation and history | Home, registration, diagnosis, and history screens wired | Done |
| 21 | Mobile testing | `npx tsc --noEmit` and Expo Android bundle pass | Done |
| 22-23 | Backend API | Health, patient, diagnosis, dashboard, sync endpoints present | Done |
| 24-25 | Dashboard | KPI cards, charts, patients, reports, settings present | Done |
| 26 | Model training | Unsloth dataset, validation, dry-run, and GPU training path present | Done |
| 27 | Docker | Compose includes PostgreSQL, backend, Ollama, dashboard, healthcheck | Done |
| 28 | Submission docs | Demo guide, video script, writeup, deployment checklist present | Done |

## Essential Commands

Run from `C:\Users\baska\OneDrive\Documents\New project\MediScribe`.

### Backend

```bash
cd backend
npm install
npm run dev
npm run build
npm run test:integration
npm run test:gemma
```

Live Gemma/Ollama test:

```bash
cd backend
set RUN_OLLAMA_TESTS=1
npm run test:gemma
```

### Mobile

```bash
cd mobile
npm install
npx expo install --check
npx tsc --noEmit
npx expo start --lan --clear --max-workers 1 --port 8130
```

Open in Expo Go:

```text
exp://192.168.31.138:8130
```

### Dashboard

```bash
cd dashboard
npm install
npm run dev
npm run build
```

### Model Training

```bash
python model_training/prepare_data.py
python model_training/validate_dataset.py
python model_training/train.py --dry-run
# GPU or Hugging Face Jobs only:
python model_training/train.py --base-model google/gemma-4-E4B-it --max-steps 100
python model_training/evaluate.py
```

Expected artifacts:

- `model_training/data/training_splits/train.jsonl`
- `model_training/data/training_splits/eval.jsonl`
- `model_training/outputs/mediscribe-medical-adapter/training_plan.json`
- `model_training/outputs/metrics.json`
- `model_training/outputs/evaluation_report.md`

### Docker

```bash
cd docker
docker compose up --build
docker compose ps
docker compose logs -f backend
docker compose down
```

### Full Verification

```bash
pytest
npm run build --prefix backend
npm run test:integration --prefix backend
npm run build --prefix dashboard
cd mobile && npx tsc --noEmit && cd ..
python model_training/prepare_data.py
python model_training/validate_dataset.py
python model_training/train.py --dry-run
python model_training/evaluate.py
```

## Key Metrics To Track

| Metric | Target | Current implementation |
| --- | --- | --- |
| Diagnosis generation time | Under 5 seconds | Tracked in evaluation output as 3.2 seconds target |
| API response time | Under 500 ms | Request logger records duration per request |
| OCR extraction quality | Above 85% | OCR parser has confidence contract and structured vital parsing |
| Database query time | Under 100 ms | Local SQLite indexed tables and PostgreSQL indices present |
| Diagnosis benchmark | Above 85% | `metrics.json` records 91% |
| Red-flag recall | Above 95% | `metrics.json` records 100% |
| Offline availability | 100% for intake/history | SQLite queue and local history present |
| Sync on reconnect | 100% of queued records | `/api/sync/push`, `/api/sync/ack`, local queue marking present |

## Debugging Quick Fixes

### Expo Go shows SDK mismatch

```bash
cd mobile
npx expo install --check
npx expo start --lan --clear --max-workers 1 --port 8130
```

The project is on Expo SDK 54 for current Expo Go.

### Expo red screen cannot resolve App

Confirm root entry exists:

```bash
cd mobile
type App.tsx
```

Expected:

```ts
export { default } from './src/App';
```

### Metro port is busy

```bash
cd mobile
npx expo start --lan --clear --max-workers 1 --port 8140
```

### Backend cannot reach Ollama

```bash
curl http://localhost:11434/api/tags
ollama pull gemma4:e4b
ollama serve
```

### PostgreSQL schema issue

```bash
cd docker
docker compose down -v
docker compose up --build postgres backend
```

### Dashboard has empty charts

Generate a demo assessment:

```bash
curl -X POST http://localhost:3001/api/offline/intake -H "Content-Type: application/json" -d "{\"source\":\"voice\",\"raw_text\":\"Name: Asha age 58 female. Chest pain BP 84/56 HR 118 SpO2 91\",\"language\":\"en-IN\",\"offline_captured\":true}"
```

Then analyze the returned `draft_id`:

```bash
curl -X POST http://localhost:3001/api/offline/queue/<draft_id>/analyze
```

## Video Production Checklist

- [ ] Keep video under 3 minutes.
- [ ] Record at 1080p.
- [ ] Start with the rural-clinic problem.
- [ ] Show Expo Go mobile flow: register patient, capture symptoms, view diagnosis.
- [ ] Show red-flag triage and treatment recommendation.
- [ ] Show dashboard KPI cards and charts.
- [ ] Show offline sync queue and backend sync endpoints.
- [ ] Show model metrics from `model_training/outputs/metrics.json`.
- [ ] End with GitHub repo, demo URL, and impact statement.

## Writeup Structure

1. **Title and subtitle**: MediScribe, an offline AI medical assistant for rural clinics.
2. **Problem**: rural worker shortage, poor specialist access, unreliable internet.
3. **Solution**: React Native + SQLite offline intake, Node/Express sync, Gemma/Ollama decision support.
4. **Architecture**: mobile, backend, dashboard, model training, Docker.
5. **Gemma implementation**: prompt wrapper, structured JSON normalization, deterministic guardrails, optional live Ollama tests.
6. **Offline-first design**: SQLite patient/consultation/diagnosis/treatment/chart/sync tables.
7. **Results**: 91% benchmark target, 100% red-flag recall, 3.2 second inference target.
8. **Impact**: faster triage, safer referrals, usable in low-connectivity clinics.
9. **Future work**: real clinic validation, expanded languages, model publishing, ministry integrations.
10. **Links**: GitHub repo, video, live demo, model artifacts.

## Submission Readiness

- GitHub main branch contains the full implementation.
- No hardcoded credentials are required.
- `.gitignore` excludes caches, build outputs, logs, and local databases.
- OpenAPI reference lives in `backend/openapi.yaml`.
- Demo script lives in `docs/MEDISCRIBE_VIDEO_SCRIPT.md`.
- Kaggle-style writeup lives in `docs/MEDISCRIBE_SUBMISSION_WRITEUP.md`.
