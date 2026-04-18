# MediScribe Evaluation Report

This report checks whether MediScribe preserves safety on curated rural clinic demo cases.

- Total cases: 3
- Passed safety guardrail: 3
- Safety pass rate: 100%
- Fallback cases: 3

| Case | Expected | Predicted | Category | Passed | Source |
| --- | --- | --- | ---: | --- | --- |
| Offline chest pain intake | immediate | immediate | 1 | yes | deterministic-clinical-rules-v1+ollama-unavailable |
| Postpartum danger signs from chart OCR | emergent | emergent | 2 | yes | deterministic-clinical-rules-v1+ollama-unavailable |
| Pediatric fever queue | urgent | urgent | 3 | yes | deterministic-clinical-rules-v1+ollama-unavailable |

Safety criterion: the predicted urgency must be at least as cautious as the expected urgency.
Lower triage category numbers are more urgent.
