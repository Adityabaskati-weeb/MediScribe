# MediScribe 3-Minute Demo Script

## 0:00-0:18 Opening Hook

Visual: crowded rural clinic, paper notebook, unstable network icon.

Voiceover:

"In many rural clinics, one health worker may see more than 50 patients a day.
The internet is unreliable, records are paper-based, and the most dangerous cases
can look ordinary at first."

## 0:18-0:42 The App Starts Offline

Show mobile home screen.

Voiceover:

"This is MediScribe: an offline AI medical assistant built for low-resource
clinics. It starts with the real workflow: register the patient, capture symptoms,
and keep the visit saved locally."

Show: Start Consultation, patient form, language indicator, offline-ready status.

## 0:42-1:18 Voice And OCR Intake

Show voice screen and chart scan.

Voiceover:

"The worker can speak symptoms, type notes, or scan a chart. MediScribe turns
messy intake into structured vitals and symptoms before sending it to the
clinical agents."

Show: voice intake, waveform, chart OCR demo, patient summary risk banner.

## 1:18-1:58 Gemma 4 Agentic Diagnosis

Show AI diagnosis screen and backend `/api/diagnoses/agentic` response.

Voiceover:

"Gemma 4 runs locally through Ollama. A diagnosis agent ranks the differential, a
reasoning agent explains why, a treatment agent gives next steps, and a safety
agent checks red flags before anything is displayed."

Show: top 3 diagnoses, confidence bars, why-this-diagnosis, red flags.

## 1:58-2:24 Offline Safety Moment

Show backend stopped or offline mode, then run diagnosis fallback.

Voiceover:

"If the model or internet is unavailable, MediScribe does not freeze. Local
safety rules still catch low oxygen, shock blood pressure, postpartum danger
signs, and pediatric emergencies."

Show: emergency referral guidance and saved local visit.

## 2:24-2:45 Dashboard And Metrics

Show web dashboard and API metrics.

Voiceover:

"Clinic leads can review urgent cases, sync status, accuracy, latency,
red-flag recall, and patient trends."

Show: dashboard KPIs, `/api/diagnoses/evaluation`, `/metrics`.

## 2:45-3:00 Closing

Voiceover:

"MediScribe brings Gemma 4 intelligence to the edge: private, explainable, and
ready where healthcare needs it most. No cloud dependency. No waiting. Safer
decisions in the clinic."
