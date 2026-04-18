# MediScribe Demo Guide

## Start Services

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd dashboard
npm install
npm run dev
```

## Demo Flow

1. Open the dashboard at `http://localhost:3000`.
2. Submit a high-risk patient to `POST /api/diagnoses/generate`.
3. Show dashboard metrics updating through `GET /api/patients/dashboard/summary`.
4. Queue an offline text capture with `POST /api/offline/intake`.
5. Analyze the queued visit with `POST /api/offline/queue/:draftId/analyze`.
6. Show pending sync records with `GET /api/sync/pending`.

## Video Story

- rural clinic has limited connectivity
- health worker captures symptoms by voice or OCR
- backend flags red signs and recommends escalation
- dashboard tracks urgent cases and offline sync
