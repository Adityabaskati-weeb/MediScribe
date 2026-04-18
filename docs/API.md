# MediScribe API

The source-of-truth runtime API is the Node/Express backend in `backend/`.

## Health

- `GET /health`

The health response includes the backend service name, timestamp, and the approved
Node/Express + PostgreSQL + Gemma/Ollama architecture marker.

## Diagnoses

- `POST /api/diagnoses/generate`

Request body:

```json
{
  "patient": {
    "name": "Asha",
    "age_years": 58,
    "gender": "female"
  },
  "chief_complaint": "Crushing chest pain radiating to left arm",
  "symptoms": ["shortness of breath", "sweating"],
  "vitals": {
    "heart_rate": 118,
    "systolic_bp": 84,
    "diastolic_bp": 56,
    "oxygen_saturation": 91,
    "respiratory_rate": 26,
    "temperature_c": 36.8
  }
}
```

## Patients

- `POST /api/patients`
- `GET /api/patients/recent`
- `GET /api/patients/dashboard/summary`

## Offline Workflow

- `POST /api/offline/intake`
- `POST /api/offline/queue/:draftId/analyze`

## Sync

- `GET /api/sync/pending`
- `POST /api/sync/push`
- `POST /api/sync/ack`
- `GET /api/sync/status`

Push request:

```json
{
  "items": [
    {
      "record_id": "local-diagnosis-1",
      "operation": "UPSERT_DIAGNOSIS",
      "payload": {
        "patient_id": "patient-1",
        "symptoms": ["fever", "cough"]
      },
      "created_at": "2026-04-18T10:00:00.000Z"
    }
  ]
}
```

Ack request:

```json
{
  "sync_ids": ["sync-abc123"]
}
```

## Operational Guardrails

- Optional API key auth via `API_KEY` and `x-api-key`.
- In-memory rate limiting via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- JSON request logging for method, path, status code, and duration.
