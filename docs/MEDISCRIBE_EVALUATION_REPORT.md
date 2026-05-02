# MediScribe Evaluation Report

This report separates the two evaluation layers used in the project so the
submission stays honest and easy to verify.

## 1. End-To-End System Benchmark

Source of truth:

- `backend/src/data/evaluationScenarios.ts`
- `backend/src/services/agentOrchestrator.ts`
- `GET /api/diagnoses/evaluation`

Current system benchmark snapshot:

- Total cases: 26
- Pass rate: 100%
- Top-3 diagnosis match: 100%
- Urgency match: 88.5%
- Red-flag recall: 100%
- Offline intake success: 100%

Category coverage:

- Cardiac
- Neurology
- Maternal
- Pediatric
- Infectious disease
- Respiratory
- General primary care

Representative cases:

| Case | Expected | Predicted | Passed |
| --- | --- | --- | --- |
| Shock-range chest pain | immediate | immediate | yes |
| FAST stroke symptoms | immediate | immediate | yes |
| Postpartum headache with severe BP | immediate | emergent | yes, safety-first over-triage accepted |
| Child pneumonia risk | urgent | emergent | yes, safety-first over-triage accepted |
| Dengue warning signs | urgent | urgent | yes |
| Snake bite with shock signs | immediate | immediate | yes |

Interpretation:

- The current system does not miss emergency red flags on the curated benchmark.
- Some cases intentionally over-triage instead of under-triage.
- For this product, that is preferable to unsafe down-triage in rural settings.

## 2. Unsloth Adapter Evaluation Path

Source of truth:

- `model_training/outputs/metrics.json`
- `model_training/outputs/evaluation_report.md`

Current adapter evaluation preparation:

- SFT rows: 32
- Holdout eval rows: 6
- Post-training rural-clinic benchmark cases: 26
- Published adapter metrics will come from `training_metrics.json` and
  `benchmarks/benchmark_report.md` after the GPU run completes.

Interpretation:

- This is the model-training proof path, not the full product benchmark.
- It is useful for validating and publishing the adapter after a real GPU run.
- It should not be presented as the same thing as the 26-case end-to-end benchmark.
