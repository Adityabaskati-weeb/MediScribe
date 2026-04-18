# MediScribe Code Templates

This repository implements the reusable template patterns from the uploaded `MEDISCRIBE_CODE_TEMPLATES.md`.

## Backend Templates

| Pattern | File |
| --- | --- |
| API response wrapper | `backend/src/utils/apiResponse.ts` |
| Error middleware and async handler | `backend/src/middleware/errorHandler.ts` |
| Input validation | `backend/src/utils/validators.ts` |
| Request validation middleware | `backend/src/utils/validators.ts` |
| Rate limiting | `backend/src/middleware/rateLimiter.ts` |
| Request logging | `backend/src/middleware/logger.ts` |
| API key auth | `backend/src/middleware/auth.ts` |
| Model inference wrapper | `backend/src/services/gemmaService.ts` |
| Clinical analysis service | `backend/src/services/analysisService.ts` |
| Integration test example | `backend/src/tests/integration.test.ts` |
| Unit test example | `backend/src/tests/validators.test.ts` |

## Mobile Templates

| Pattern | File |
| --- | --- |
| API client | `mobile/src/services/apiClient.ts` |
| `useAsync` hook | `mobile/src/hooks/useAsync.ts` |
| Medical data hook | `mobile/src/hooks/useMedicalData.ts` |
| SQLite transactions and sync queue | `mobile/src/services/databaseService.ts` |
| Data synchronization | `mobile/src/services/syncService.ts` |
| Speech service | `mobile/src/services/speechService.ts` |
| OCR service | `mobile/src/services/ocrService.ts` |
| Patient form | `mobile/src/components/PatientForm.tsx` |
| Diagnosis result display | `mobile/src/components/DiagnosisResult.tsx` |
| Patient history display | `mobile/src/components/PatientHistory.tsx` |

## Configuration Templates

| Pattern | File |
| --- | --- |
| Backend env example | `backend/.env.example` |
| Docker Compose | `docker/docker-compose.yml` |
| OpenAPI reference | `backend/openapi.yaml` |
| VS Code settings | `.vscode/settings.json` |
| VS Code extension recommendations | `.vscode/extensions.json` |

## Test Commands

```bash
npm run test:unit --prefix backend
npm run test:integration --prefix backend
npm run test:gemma --prefix backend
pytest
cd mobile && npx tsc --noEmit
```

## Sync Template Flow

1. Mobile writes patient, diagnosis, treatment, chart, and queue rows to SQLite.
2. `mobile/src/services/syncService.ts` reads pending rows.
3. The mobile app sends queued records to `POST /api/sync/push`.
4. Backend returns accepted sync records.
5. Mobile marks local rows synced.
6. Backend records can be acknowledged through `POST /api/sync/ack`.
