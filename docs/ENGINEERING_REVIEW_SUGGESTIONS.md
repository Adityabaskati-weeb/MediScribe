# Engineering Review Suggestions

This review removed stale scaffolding and added stricter unused-code checks. These are the next high-value improvements to implement after the current hackathon build is stable.

## 1. Add a Real Dashboard Typecheck

The dashboard currently relies on Vite build behavior but does not have a dedicated `tsconfig.json` or `tsc --noEmit` test script. Add a dashboard TypeScript config and change `npm test --prefix dashboard` to run typechecking before build.

Why it matters: dashboard regressions will be caught before judges see broken analytics or reports.

## 2. Replace `any` in Mobile Consultation Draft

`mobile/src/App.tsx` still uses `patient?: any` and `assessment?: any`. Replace those with shared mobile types based on the backend `Clinical.ts` model shape.

Why it matters: it will catch broken patient fields, missing assessment fields, and wrong treatment data at compile time.

## 3. Split Large Backend Scalability Service

`backend/src/services/scalabilityService.ts` intentionally implements the full scalability guide in one place for speed. Once stable, split it into:

- `modelRouterService.ts`
- `federatedLearningService.ts`
- `regionalContextService.ts`
- `interoperabilityService.ts`
- `complianceService.ts`
- `billingService.ts`

Why it matters: smaller files are easier to test, review, and extend.

## 4. Add API Contract Tests

Current backend tests call services directly. Add HTTP-level tests for:

- `/api/diagnoses/agentic`
- `/api/scalability/readiness`
- `/api/scalability/integration/ehr/share`
- `/api/scalability/compliance/deidentify`

Why it matters: this validates middleware, response envelopes, routing, and auth behavior together.

## 5. Make Mobile Demo State Resettable

Add a Settings action that clears local SQLite demo data and AsyncStorage language/theme state.

Why it matters: hackathon demos often need repeated clean runs. A reset button avoids manually clearing app data.

## 6. Add Offline Sync Conflict Tests

The sync service accepts mobile payloads, but conflict behavior should be tested for:

- same patient edited on two devices
- duplicate queued diagnosis
- stale assessment update after doctor review

Why it matters: offline-first is one of MediScribe's strongest claims; conflict tests make it credible.

## 7. Add a Minimal Error Boundary in Mobile

Wrap the app shell in a recoverable error boundary with a "Return home" action.

Why it matters: if one screen crashes during a demo, the whole app should not become unrecoverable.
