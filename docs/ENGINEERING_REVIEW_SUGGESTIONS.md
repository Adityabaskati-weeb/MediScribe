# Engineering Review Suggestions

This review removed stale scaffolding and added stricter unused-code checks. The follow-up engineering suggestions below have now been implemented so they can be enforced by code and tests instead of staying as notes.

## 1. Add a Real Dashboard Typecheck

Implemented: the dashboard now has a dedicated `tsconfig.json`, a `typecheck` script, and `npm test --prefix dashboard` runs typechecking before the production build.

Why it matters: dashboard regressions will be caught before judges see broken analytics or reports.

## 2. Replace `any` in Mobile Consultation Draft

Implemented: the mobile app now uses `mobile/src/types/clinical.ts` for `ConsultationDraft`, patient profiles, assessments, diagnosis envelopes, treatment recommendations, and safety signals.

Why it matters: it will catch broken patient fields, missing assessment fields, and wrong treatment data at compile time.

## 3. Split Large Backend Scalability Service

Implemented: `backend/src/services/scalabilityService.ts` now acts as a small public aggregator over:

- `modelRouterService.ts`
- `federatedLearningService.ts`
- `regionalContextService.ts`
- `interoperabilityService.ts`
- `complianceService.ts`
- `billingService.ts`

Why it matters: smaller files are easier to test, review, and extend.

## 4. Add API Contract Tests

Implemented: `backend/src/tests/apiContract.test.ts` starts the real Express app and validates auth, middleware, response envelopes, and routing for:

- `/api/diagnoses/agentic`
- `/api/scalability/readiness`
- `/api/scalability/integration/ehr/share`
- `/api/scalability/compliance/deidentify`

Why it matters: this validates middleware, response envelopes, routing, and auth behavior together.

## 5. Make Mobile Demo State Resettable

Implemented: Settings now includes a Demo reset action that clears local SQLite demo records and resets saved language/theme state for repeatable hackathon demos.

Why it matters: hackathon demos often need repeated clean runs. A reset button avoids manually clearing app data.

## 6. Add Offline Sync Conflict Tests

Implemented: `backend/src/tests/syncConflict.test.ts` validates conflict behavior for:

- same patient edited on two devices
- duplicate queued diagnosis
- stale assessment update after doctor review

Why it matters: offline-first is one of MediScribe's strongest claims; conflict tests make it credible.

## 7. Add a Minimal Error Boundary in Mobile

Implemented: the app shell is wrapped in `AppErrorBoundary`, which shows a recoverable fallback and a "Return home" action that remounts the app.

Why it matters: if one screen crashes during a demo, the whole app should not become unrecoverable.
