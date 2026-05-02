# MediScribe Win Plan

Last updated: May 1, 2026

Goal: maximize MediScribe's chance of winning a Gemma 4 Good Hackathon prize by
focusing on the changes that most increase judge confidence in impact,
storytelling, and technical depth before the May 18, 2026 deadline.

Recommended primary targets:

1. Health & Sciences
2. Ollama Special Technology Track
3. Safety & Trust as a secondary angle

Recommended positioning:

- "Offline AI clinical decision support for rural health workers"
- not "AI doctor"
- not "hospital management platform"
- not "everything app for healthcare"

## What winning projects in this space did well

This plan is based on patterns from official winners and strong public writeups
in adjacent Google/Kaggle health challenges.

### 1. Winners solved one frontline workflow extremely clearly

Official MedGemma winners were described in one sentence each:

- EpiCast: local-language outbreak surveillance for West African community
  health workers.
- Sunny: privacy-first skin cancer self-screening.
- FieldScreen AI: on-device tuberculosis screening.
- Tracer: medical error prevention from notes + tests.

Special technology winners were also sharply scoped:

- ClinicDX: offline clinical AI integrated into OpenMRS for resource-limited
  health centers.
- BridgeDX: offline decision support for community health workers and first
  responders.
- UniRad3s: radiology workflow built around Spot, Segment, Simplify.

Lesson for MediScribe:

- Judges reward products that are easy to explain in under 20 seconds.
- MediScribe should lead with one hero use case:
  "A rural health worker catches a maternal emergency offline and creates a
  clean referral handoff in under a minute."

### 2. Mobile-first and offline-first are not side notes, they are the story

Official summaries emphasized mobile-first, on-device, or offline execution:

- EpiCast was a mobile-first system that turned local-language observations
  into structured WHO surveillance signals.
- FieldScreen AI ran entirely on-device and used voice input and local language
  output.
- ClinicDX positions itself as fully offline, EMR-native, and deployable on
  commodity hardware with no external API calls.
- Gemma 3n winners also leaned heavily on mobile-first, on-device, and
  accessibility-first execution.

Lesson for MediScribe:

- Offline behavior must be visible, not just documented.
- The app should make "works with no internet" emotionally obvious in the demo.

### 3. Winners grounded outputs in trusted medical structure

The strongest health entries did not just generate text. They transformed messy
input into structured clinical action:

- EpiCast turned observations into WHO IDSR signals.
- ClinicDX queries WHO and MSF guidance and cites it in outputs.
- DermaCheck used structured output, strong safety framing, visible workflow
  steps, and public artifacts for reproducibility.

Lesson for MediScribe:

- A diagnosis without citations and protocol grounding feels weaker than a
  protocol-guided triage assistant.
- "Why this?" must cite a known source set or rule pack.

### 4. Winners published proof, not just promises

Common patterns across strong public health entries:

- public writeup
- public repo
- public demo or deployed service
- public model/dataset artifacts when fine-tuning was claimed
- visible metrics
- strong safety framing

Lesson for MediScribe:

- Anything you claim in the writeup should have a clickable proof path.
- Unsloth should only be claimed after public adapter weights + benchmark.

## Current MediScribe strengths

Already strong in this repo:

- offline-first mobile workflow
- agentic diagnosis/reasoning/treatment/safety pipeline
- Ollama + Gemma 4 local runtime story
- benchmark and metrics scaffolding
- multilingual code path exists
- voice + OCR + patient history + sync architecture
- Dockerized full stack

These are real advantages. The issue is not lack of architecture. The issue is
that the judge-facing product proof is still weaker than the best comparable
healthcare winners.

## Current gaps that reduce win probability

### Gap 1. The hero story is still too broad

Right now MediScribe can do many things, but winning health entries usually
feel centered on one unforgettable workflow.

Risk:

- Judges remember "TB screening on-device" or "offline outbreak detection."
- They may remember MediScribe as "a clinic app with many features."

### Gap 2. The output is not visibly guideline-grounded enough

Current strengths:

- safety guardrails
- clinical heuristics
- structured outputs

Missing or not prominent enough:

- source-linked WHO/MSF/IMCI citations on diagnosis and treatment screens
- a visible "evidence used" layer in the mobile UI

### Gap 3. Public proof is not yet strong enough

Still needed to fully compete:

- a simple public live demo
- a polished 3-minute video
- public deployment that judges can open quickly
- if claiming Unsloth: public adapter weights + benchmark

### Gap 4. Local-language workflow needs to feel real, not optional

Winners in low-resource settings gained credibility by showing that the system
 matched field reality:

- local language input
- structured standardized output
- low-literacy UI
- privacy/offline behavior

MediScribe should demonstrate one true end-to-end local-language flow, not just
show a language switch.

### Gap 5. "Wow factor" needs to be functional, not decorative

Pretty UI helps, but it rarely wins health AI prizes by itself.
The better "wow" is:

- a rural emergency gets escalated correctly
- the app stays useful with no internet
- the output becomes a referral handoff, not just model prose
- the dashboard turns local decisions into district insight

## Highest-leverage improvements

These are ranked by expected impact on winning chances, not by engineering
novelty.

### P0. Make one hero demo flow unbeatable

Deadline target: May 4, 2026

Pick one and optimize everything around it:

1. Maternal emergency:
   postpartum headache/bleeding/hypertension -> refer now
2. Sepsis/pneumonia:
   fever + low SpO2 + confusion -> oxygen + urgent referral
3. Stroke:
   facial droop + arm weakness + speech change -> last-known-well + urgent
   referral

Required product changes:

- create a dedicated demo seed patient and transcript
- make the mobile flow one-tap from home screen into the hero case
- ensure the diagnosis screen shows:
  - risk level
  - top diagnosis
  - danger reason
  - immediate actions
  - referral handoff
  - offline status

Required code changes:

- add one explicit hero-case preset in mobile
- add a backend demo endpoint that returns the same case consistently
- add a printable/shareable referral summary object

Why this matters:

- judges remember one life-saving moment, not ten features

### P0. Add evidence-grounded triage citations

Deadline target: May 6, 2026

MediScribe should not stop at "clinical reasoning." It should show "clinical
reasoning grounded in these protocols."

Required changes:

- add a WHO/MSF/IMCI guideline pack in the backend
- attach at least 1-3 evidence references to every treatment/referral output
- render these as compact source chips in mobile and dashboard
- add "reason + evidence + action" structure to the output contract

Implementation direction:

- create a lightweight retrieval layer over curated guideline snippets
- map common emergency patterns to protocol references
- expose `citations` and `evidence_summary` in diagnosis responses

Why this matters:

- ClinicDX and BridgeDX are strong because they look grounded, not merely smart

### P0. Ship a public, dead-simple live demo

Deadline target: May 8, 2026

Required changes:

- deploy one stable public demo URL
- remove any setup friction that requires judges to install anything
- support a scripted hero case from browser + screenshots + public API
- expose a read-only "demo pack" page with:
  - architecture
  - benchmark
  - hero case
  - offline explanation

Why this matters:

- a repo plus localhost instructions is not enough against top submissions

### P0. Publish one real Gemma 4 specialization artifact

Deadline target: May 10, 2026

If going for Unsloth:

- run the real fine-tuning job
- publish adapter weights on Hugging Face
- publish benchmark results
- reference exactly how the fine-tuned adapter improves one real task

If not going for Unsloth:

- do not overclaim it
- instead, double down on Ollama + offline local inference + rule-grounded
  safety

Why this matters:

- published model artifacts sharply increase technical credibility

### P1. Turn the dashboard into a public-health "second wow"

Deadline target: May 11, 2026

EpiCast won by connecting frontline input to public-health structure.
MediScribe can echo that without changing its core product.

Required changes:

- add a district trend panel:
  - fever clusters
  - respiratory risk uptick
  - maternal emergency counts
  - urgent referral volume
- add clinic-level workload metrics:
  - consults saved offline
  - average decision time saved
  - top danger signs this week

Why this matters:

- it upgrades MediScribe from "triage app" to "clinical operations signal
  layer"

### P1. Make local-language capture visibly real

Deadline target: May 12, 2026

Required changes:

- prebuild one polished Hindi or Tamil hero transcript
- show local-language intake on screen
- show structured English/clinical summary as output
- add a visible "translated locally" or "captured offline" badge only if true

Avoid:

- fake multilingual claims with only translated labels

Why this matters:

- local language + offline + structure is exactly the kind of inclusivity story
  judges reward

### P1. Add a referral handoff artifact

Deadline target: May 13, 2026

This is one of the best missing "real-world utility" upgrades.

Required changes:

- generate a concise referral note with:
  - patient summary
  - red flags
  - last vital signs
  - working diagnosis
  - actions already taken
  - why referral is urgent
- allow this to be copied, printed, or exported

Why this matters:

- it converts model output into clinical action

### P1. Add visible trust instrumentation

Deadline target: May 14, 2026

Required changes:

- show when fallback rules were used
- show model vs guardrail override behavior
- expose latency and reliability in a clean benchmark panel
- optionally add a simple "confidence calibrated / low confidence / refer"
  indicator

Why this matters:

- Safety & Trust judges reward observability and honesty

### P2. Add EMR/FHIR export path

Deadline target: May 15, 2026

ClinicDX gets major credibility from OpenMRS/FHIR alignment.

Required changes:

- export one consultation to a simple FHIR-style bundle or JSON schema
- document how it could integrate with OpenMRS later
- bonus: build a mock OpenMRS handoff screen or endpoint

Why this matters:

- it makes MediScribe look deployment-minded, not hackathon-only

## Changes to avoid

Do not spend precious time on:

- fancy 3D UI that does not improve the demo story
- broad new disease domains with no benchmark
- generic chatbot features
- speculative cloud architecture that weakens the offline story
- claiming tracks you cannot support with public proof

## Proposed execution schedule

### Phase 1: Sharpen the product truth

May 1-4, 2026

- lock the hero workflow
- simplify the home-to-diagnosis path
- seed the hero demo patient
- polish the diagnosis + referral output

### Phase 2: Ground it in evidence

May 5-8, 2026

- add protocol citation layer
- add evidence chips in UI
- finalize benchmark endpoint
- deploy public demo

### Phase 3: Add one technical knockout

May 9-13, 2026

- publish Unsloth adapter and benchmark, or
- if not feasible, perfect Ollama/offline/public-health proof
- add dashboard outbreak and referral trends
- add FHIR/export handoff

### Phase 4: Package to win

May 14-18, 2026

- record the 3-minute video
- write a tighter Kaggle writeup
- create cover image and media gallery assets
- rehearse the live demo
- remove anything unstable

## Submission strategy

Primary claim:

- MediScribe gives rural health workers a safe, offline, evidence-grounded way
  to catch emergencies faster and make better referrals.

Main track story:

- a frontline worker with no internet catches a dangerous case in time

Health & Sciences story:

- better triage and better referral quality in low-resource settings

Ollama story:

- Gemma 4 runs locally in the actual workflow that needs it most

Safety & Trust story:

- guardrails override model confidence, outputs are explainable, and the system
  is explicit about uncertainty

## Winning checklist

MediScribe is ready to compete hard when all of these are true:

- one hero workflow feels unforgettable
- offline mode is shown, not merely claimed
- outputs cite medical guidance
- referral handoff is exportable
- local-language workflow is believable
- live demo is public and easy
- writeup is under 1,500 words and tightly scoped
- video opens with human stakes in the first 10 seconds
- every major claim has a public proof path

## Final recommendation

The best version of MediScribe is not "the biggest rural clinic platform."
The best version is:

"the offline maternal/sepsis/stroke referral assistant that rural health workers
trust when the network disappears."

That version has a much better chance of winning than a feature-maximal build.

## Research references

- Gemma 4 Good Hackathon overview:
  https://www.kaggle.com/competitions/gemma-4-good-hackathon/overview
- Official Gemma 4 announcement:
  https://www.linkedin.com/posts/kaggle_now-available-on-kaggle-gemma-4-in-partnership-activity-7445505784228073472-QYnt
- Official MedGemma winners announcement:
  https://blog.google/innovation-and-ai/technology/health/med-gemma-impact-challenge/
- ClinicDX public site:
  https://www.clinicdx.org/
- DermaCheck public Kaggle writeup:
  https://www.kaggle.com/competitions/med-gemma-impact-challenge/writeups/new-writeup-1769817673977
- Gemma 3n winners overview:
  https://blog.google/innovation-and-ai/technology/developers-tools/developers-changing-lives-with-gemma-3n/
