# MediScribe 3-Minute Demo Production Playbook

Goal: deliver a judge-ready, story-first video that feels real in the first 20
seconds and proves the technology is not faked.

Core line:

`Sync can wait. Red flags cannot.`

## Video Outcome

By the end of the video, judges should remember five things:

1. MediScribe works when the internet does not.
2. It catches dangerous maternal and stroke cases quickly.
3. Gemma 4 is actually used, not just mentioned.
4. The workflow is built for rural health workers, not AI enthusiasts.
5. The system is real: public code, public adapter, real GPU run, real metrics.

## Final Runtime

- Target: `2:45` to `2:58`
- Never go over `3:00`

## Recording Order

Record in this order so editing stays easy:

1. Maternal emergency offline flow
2. Stroke hero flow
3. Voice intake
4. Chart scan
5. Dashboard and outbreak radar
6. Public proof: GitHub, Hugging Face adapter, completed HF job

## Shot-by-Shot Script

### 0:00-0:07 Cold Open

Visual:

- Black screen for a beat
- Cut immediately to phone in airplane mode
- Show no internet / offline state clearly

Voiceover:

`A rural clinic cannot wait for the cloud.`

On-screen text:

- `No internet`
- `Pregnant patient`
- `High-risk symptoms`

### 0:07-0:20 Problem Hook

Visual:

- Open MediScribe home
- Show one strong action, not menu wandering
- Tap `Airplane Mode Emergency Demo`

Voiceover:

`One health worker may see 50 patients in a day. The dangerous cases do not always look dramatic at first.`

On-screen text:

- `50+ patients/day`
- `Offline clinic`
- `Missed red flags cost lives`

### 0:20-0:42 Hero Case 1: Maternal Emergency

Visual:

- Show the seeded maternal case
- Focus on the patient summary, vitals, and danger signs
- Move fast, do not linger on typing

Voiceover:

`This patient is 32 weeks pregnant with bleeding, abdominal pain, and dizziness. The worker cannot wait for a network round-trip.`

On-screen text:

- `32 weeks pregnant`
- `Bleeding`
- `Abdominal pain`
- `Dizziness`

### 0:42-1:05 The Wow Moment

Visual:

- Land on the diagnosis/referral screen
- Hold on the red emergency state for a full beat
- Show referral guidance and offline save

Voiceover:

`MediScribe does not freeze. It catches the red flag, explains the danger in plain language, creates a referral handoff, and saves the visit offline.`

On-screen text:

- `REFER NOW`
- `Emergency transfer`
- `Saved offline`
- `Sync can wait. Red flags cannot.`

### 1:05-1:22 Why The AI Is Trustworthy

Visual:

- Show the AI Safety Council / multi-agent area
- Highlight Diagnosis, Reasoning, Treatment, and Safety
- Make Safety the last emphasis

Voiceover:

`Gemma 4 helps rank diagnoses and explain the reasoning. But the model does not act alone. Safety rules override routine advice when danger signs appear.`

On-screen text:

- `Diagnosis Agent`
- `Reasoning Agent`
- `Treatment Agent`
- `Safety Agent`

### 1:22-1:42 Hero Case 2: Stroke

Visual:

- Jump to the stroke hero workflow
- Show facial droop, weakness, slurred speech cues in the case summary
- Show urgent escalation

Voiceover:

`The second hero path is stroke. When FAST symptoms appear, the app escalates immediately and structures the handoff while the clock is still on the patient’s side.`

On-screen text:

- `Stroke pathway`
- `FAST symptoms`
- `Immediate escalation`

### 1:42-2:00 Real Workflow Proof

Visual:

- Show voice intake screen
- Show chart scan / confirmation
- Show patient summary

Voiceover:

`The workflow matches the clinic: speak symptoms, scan chart notes, confirm the extracted summary, and move straight to a safer decision.`

On-screen text:

- `Voice intake`
- `Chart scan`
- `Structured summary`

### 2:00-2:20 Offline-to-System Story

Visual:

- Show history saved on device
- Then cut to dashboard
- Show outbreak radar or clinic pattern view

Voiceover:

`One visit is the first layer. Across many offline visits, clinic leaders can see dangerous patterns: maternal risk, respiratory clusters, and outbreak signals.`

On-screen text:

- `Saved on device`
- `Synced later`
- `Clinic insight`

### 2:20-2:42 Technical Proof

Visual:

- Show dashboard metrics
- Show GitHub repo
- Show public Hugging Face adapter
- Show completed Hugging Face job page

Voiceover:

`This is a working Gemma 4 system: local inference through Ollama, offline mobile storage, deterministic safety checks, public code, and a published Unsloth adapter trained on curated clinic scenarios.`

On-screen text:

- `Gemma 4 via Ollama`
- `Offline-first mobile app`
- `Public code`
- `Public adapter`

### 2:42-2:58 Closing

Visual:

- Return to the maternal emergency referral screen
- End on the strongest UI state, not the dashboard

Voiceover:

`MediScribe brings local medical intelligence to the clinic moments where waiting is dangerous.`

On-screen text:

- `MediScribe`
- `Offline AI for rural clinics`

## Screen Recording Checklist

Record all of these before editing:

- Home screen with offline indicator visible
- Tap into `Airplane Mode Emergency Demo`
- Maternal emergency patient summary
- `REFER NOW` red-state screen
- Referral handoff screen
- Stroke hero case escalation
- Voice intake screen with captured text visible
- Chart scan screen with extracted text confirmation
- Patient history / offline save proof
- Dashboard readiness metrics
- Outbreak radar
- Public GitHub repo page
- Public HF adapter page
- Public HF completed job page

## Recording Rules

- Record in portrait for phone footage
- Keep taps slow and deliberate
- Turn on airplane mode before the maternal demo
- Hide system clutter and notifications
- Use seeded demo data, not ad-hoc manual typing
- Never scroll aimlessly
- Hold each important screen for at least `2` full seconds

## Edit Rules

- Use hard cuts, not slow fades
- Keep background music low
- Let the voiceover lead
- Use text overlays sparingly
- Put the strongest phrase on screen only once:
  `Sync can wait. Red flags cannot.`

## Screenshot Pack For Judges

Export these six images after recording:

1. Home screen with offline readiness
2. Maternal emergency `REFER NOW`
3. Multi-agent safety view
4. Stroke escalation screen
5. Dashboard outbreak radar
6. Hugging Face adapter proof

## Final Export Checklist

- Main export: `1080p` for YouTube
- Backup export: `720p`
- Ensure total runtime is under `3:00`
- Confirm all on-screen numbers match current product claims
- Confirm adapter link and repo link are visible and correct

## Voiceover Rules

- Calm, serious, trustworthy
- No hype words in the first 30 seconds
- Avoid jargon unless the visual is already proving it
- Keep medical wording simple and precise

## Last-Second QA

Before upload, confirm:

- The video starts with the clinic problem, not architecture
- The maternal emergency appears before the dashboard
- Gemma 4 is shown as real infrastructure, not just narration
- The HF adapter and completed job are visible somewhere
- The final frame leaves a strong human-use impression
