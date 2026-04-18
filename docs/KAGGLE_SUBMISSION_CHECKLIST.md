# Kaggle Submission Checklist

Use this before final submission.

## Required Attachments

| Kaggle requirement | Status | File or link |
| --- | --- | --- |
| Kaggle Writeup under 1,500 words | Draft ready | `docs/MEDISCRIBE_SUBMISSION_WRITEUP.md` |
| Public video, 3 minutes or less | Needs recording/upload | `docs/MEDISCRIBE_VIDEO_SCRIPT.md` |
| Public code repository | Ready after repo visibility check | `https://github.com/Adityabaskati-weeb/MediScribe` |
| Live demo | Local guide ready, public URL still needed | `docs/LIVE_DEMO.md` |
| Media Gallery cover image | Asset ready | `docs/media/cover-image.svg` |

## Track Selection

Recommended primary track:

- Impact Track: Health & Sciences

Strong secondary positioning inside the writeup:

- Digital Equity & Inclusivity: multilingual and low-literacy UX.
- Safety & Trust: explainable outputs, red-flag guardrails, audit logs.
- Special Technology Track: Ollama, because Gemma 4 runs locally through Ollama.

Do not claim LiteRT, Cactus, llama.cpp, or Unsloth prizes unless those exact
runtimes or published fine-tuned weights are added before submission.

## Gemma Naming And Attribution

- Keep the app name as "MediScribe"; do not rename it with Gemma in the title.
- Use "MediScribe Medical Adapter" for any model artifact name.
- Mention Gemma only as the base model family or runtime dependency.
- Include this sentence in the Kaggle Writeup and video description:
  "Gemma is a trademark of Google LLC."
- Do not imply Google endorsement, sponsorship, or affiliation.

## Final Judge Proof Points

- Gemma 4 default model: `gemma4:e4b`.
- Local model serving: Ollama.
- Offline-first storage: SQLite on mobile.
- Cloud sync layer: Node/Express plus PostgreSQL.
- Safety: deterministic guardrails override model confidence.
- Metrics: accuracy, red-flag recall, latency, reliability, and fallback rate.
- Demo story: voice intake to emergency referral in a rural clinic.

## Final Manual Checks

```powershell
pytest
npm test --prefix backend
npm run build --prefix backend
npm test --prefix mobile
npm run build --prefix dashboard
```

```powershell
curl http://localhost:3001/health
curl http://localhost:3001/api/system/demo-pack
curl http://localhost:3001/api/diagnoses/evaluation
```

## Submission Text Snippet

MediScribe is an offline-first AI medical assistant for rural clinics. A health
worker can register a patient, capture symptoms by voice, scan chart notes, and
receive a safety-checked Gemma 4 assessment with referral guidance even when the
clinic has no internet. The system combines a React Native edge app, SQLite,
Gemma 4 through Ollama, a Node/Express API, PostgreSQL sync, and a React
dashboard for clinic analytics.
