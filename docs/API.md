# MediScribe API

The source-of-truth runtime API is the Node/Express backend in `backend/`.

## Health

- `GET /health`

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
