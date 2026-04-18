# Clinic Scenario Test Pack

These scenarios are used for demos, evaluation, and manual QA. They reflect
common rural-clinic workflows and are designed to exercise offline capture,
red-flag triage, referral guidance, and sync behavior.

| Scenario | Input | Expected behavior |
| --- | --- | --- |
| Chest pain emergency | 58-year-old woman with crushing chest pain, BP 84/56, HR 118, SpO2 91 | Immediate triage, acute coronary syndrome differential, ECG/troponin if available, urgent referral |
| Postpartum severe hypertension | 29-year-old postpartum day 5 with severe headache, visual spots, BP 174/112 | Red-flag postpartum warning, urgent obstetric referral, BP reassessment |
| Child fever and poor intake | 3-year-old child with fever, cough, reduced oral intake, temp 39.1 | Urgent pediatric review, hydration assessment, respiratory assessment, safety-net advice |
| Dengue warning signs | Fever with abdominal pain, vomiting, rash, bleeding gums | Dengue warning signs, avoid aspirin/ibuprofen, monitor or refer depending severity |
| Pneumonia risk | Cough, shortness of breath, fever, rapid breathing, low oxygen | Pneumonia/respiratory infection differential, oxygen/respiratory-rate check, urgent referral if hypoxic |
| Stroke FAST | Facial droop, arm weakness, slurred speech | Immediate stroke pathway referral, glucose/BP check, onset-time capture |

## Manual Demo Flow

1. Disconnect the phone from the internet or stop the backend.
2. Register a patient on the mobile app.
3. Capture symptoms using voice fallback, manual intake, or chart scan.
4. Confirm the offline triage result is saved locally.
5. Reconnect backend and verify sync queue behavior.
6. Open the dashboard to show metrics and recent urgent assessments.
