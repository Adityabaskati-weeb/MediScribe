# MediScribe Judge Alignment Matrix

This file maps the Gemma 4 Good Hackathon criteria to concrete proof in the
repository. It is written for judges and reviewers who need to verify quickly
that MediScribe is a working application, not a mockup.

## Competition Fit

| Requirement | MediScribe alignment | Proof |
| --- | --- | --- |
| Real-world positive change | Rural clinics need fast, offline triage support for high patient volumes and low connectivity. | `README.md`, `docs/CLINIC_SCENARIOS.md`, mobile workflow |
| Gemma 4 usage | Backend calls Gemma 4 locally through Ollama, defaulting to `gemma4:e4b` for edge-friendly demos. | `backend/src/services/gemmaService.ts`, `backend/.env.example` |
| Functional app demo | React Native mobile app, Node/Express backend, React dashboard, Docker stack, and local demo endpoints. | `mobile/`, `backend/`, `dashboard/`, `docker/docker-compose.yml` |
| Technical writeup | Draft under 1,500 words with architecture, Gemma 4 usage, challenges, and impact. | `docs/MEDISCRIBE_SUBMISSION_WRITEUP.md` |
| Public code repository | GitHub repository is the source of truth. | `https://github.com/Adityabaskati-weeb/MediScribe` |
| Live demo | Docker/local demo guide plus service URLs for mobile, backend, and dashboard. | `docs/LIVE_DEMO.md`, `docs/DEMO_GUIDE.md` |
| Media gallery | Cover image asset and video script are included. | `docs/media/cover-image.svg`, `docs/MEDISCRIBE_VIDEO_SCRIPT.md` |

## Evaluation Criteria

### Impact And Vision - 40 Points

MediScribe targets the Health & Sciences, Digital Equity & Inclusivity, and
Safety & Trust impact tracks. The product is built around a concrete clinic
workflow: register patient, capture symptoms by voice/text/OCR, detect danger
signs, explain likely diagnoses, show safe next steps, and save the visit
offline for follow-up.

Judge-visible proof:

- Rural clinic scenarios in `docs/CLINIC_SCENARIOS.md`.
- Offline-first queue, SQLite persistence, and fallback diagnosis in `mobile/src/services/databaseService.ts` and `mobile/src/screens/DiagnosisScreen.tsx`.
- Safety escalation for low oxygen, shock-range blood pressure, postpartum danger signs, and pediatric danger signs in `backend/src/services/safetyGuardrails.ts`.

### Video Pitch And Storytelling - 30 Points

The video should open with a high-pressure rural clinic and show the before/after
contrast in under three minutes. The best demo path is:

1. Home dashboard: offline ready, daily patient count, urgent alerts.
2. Patient registration: large fields and risk notes.
3. Voice intake: local-language symptom capture.
4. Chart scan: photo/OCR backup.
5. AI diagnosis: ranked differential, confidence, reason, red flags.
6. Treatment: refer-now alert and cached guideline advice.
7. Dashboard: KPIs, urgent trends, sync status.

Judge-visible proof:

- Video script: `docs/MEDISCRIBE_VIDEO_SCRIPT.md`.
- Demo outputs and endpoints: `docs/HACKATHON_DEMO_OUTPUTS.md`.
- Cover image: `docs/media/cover-image.svg`.

### Technical Depth And Execution - 30 Points

MediScribe uses a modular architecture with separate mobile edge, API service,
AI service, sync service, dashboard, database, and monitoring layers. The AI
pipeline is agent-based:

- Diagnosis agent ranks the differential using Gemma 4 plus local rules.
- Reasoning agent explains evidence in health-worker language.
- Treatment agent produces next steps and referral guidance.
- Safety agent blocks unsafe certainty and escalates red flags.

Judge-visible proof:

- Agent orchestration: `backend/src/services/agentOrchestrator.ts`.
- Gemma 4/Ollama service wrapper: `backend/src/services/gemmaService.ts`.
- Production design API: `backend/src/services/systemDesignService.ts`.
- Docker services: `docker/docker-compose.yml`.
- CI checks: `.github/workflows/ci.yml`.
- Evaluation artifacts: `model_training/outputs/metrics.json` and `docs/MEDISCRIBE_EVALUATION_REPORT.md`.

## Special Technology Track Fit

| Track | Fit |
| --- | --- |
| Ollama | Strong. Gemma 4 is served locally through Ollama with `OLLAMA_MODEL=gemma4:e4b`. |
| Cactus | Conceptual fit only unless a Cactus runtime is added later. |
| LiteRT | Conceptual fit only unless a LiteRT on-device model path is added later. |
| llama.cpp | Not currently implemented. |
| Unsloth | Training scaffold exists, but full GPU fine-tuning weights are not published yet. |

## Honest Remaining Work Before Final Submission

- Publish a public live demo URL after deploying the Docker stack or a hosted demo.
- Record and upload the YouTube video, then attach it to the Kaggle Media Gallery.
- Attach `docs/media/cover-image.svg` or an exported PNG cover image to the Writeup.
- If claiming the Unsloth award, run real Unsloth fine-tuning and publish weights plus benchmarks.
- If claiming LiteRT or Cactus, add a real runtime integration and document it.

## Naming And Trademark Compliance

- App name: MediScribe. The application branding does not use Gemma marks,
  logos, or colors as its own brand identity.
- Model artifact name: MediScribe Medical Adapter. Gemma is referenced only as
  the base model family in descriptions and configuration.
- Required attribution: Gemma is a trademark of Google LLC.
- Affiliation statement: MediScribe is not affiliated with, endorsed by, or
  sponsored by Google.
