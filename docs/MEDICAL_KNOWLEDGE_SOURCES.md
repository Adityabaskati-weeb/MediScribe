# Medical Knowledge Sources

MediScribe uses two lightweight evidence layers:

- `backend/src/data/medicalKnowledge.ts` for compact red-flag and symptom rules
- `backend/src/data/guidelinePack.ts` for source-backed referral grounding
- `mobile/src/utils/clinicalDecisionSupport.ts` for an offline-safe mirror of the
  most important evidence and handoff logic

This is not a diagnostic authority. It is decision support designed to make
danger signs more visible, keep referrals cleaner, and help rural health
workers act faster when internet or specialist support is limited.

## Current evidence pack

The app now grounds its hero workflows and referral summaries in official WHO
resources that fit low-resource clinic scenarios:

- WHO Emergency and critical care:
  https://www.who.int/health-topics/emergency-care
- WHO-ICRC Basic Emergency Care:
  https://www.who.int/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured
- WHO Pre-eclampsia fact sheet:
  https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia
- WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia:
  https://www.who.int/publications/i/item/9789241548335
- WHO recommendations for prevention and treatment of postpartum haemorrhage:
  https://www.who.int/publications/i/item/9789241548502
- WHO Stroke fact sheet:
  https://www.who.int/news-room/fact-sheets/detail/stroke
- WHO Cardiovascular diseases (CVDs) fact sheet:
  https://www.who.int/en/news-room/fact-sheets/detail/cardiovascular-diseases-%28cvds%29
- WHO Sepsis fact sheet:
  https://www.who.int/news-room/fact-sheets/detail/sepsis
- WHO Pneumonia fact sheet:
  https://www.who.int/en/news-room/fact-sheets/detail/pneumonia
- WHO IMCI danger signs review:
  https://www.who.int/publications/i/item/WHO-MCA-19.02

## What the evidence layer currently supports

- Maternal emergency referral
- Stroke fast-track escalation
- Cardiac emergency triage
- Child respiratory and IMCI-style escalation
- Sepsis warning detection
- Clean referral handoff summaries for receiving facilities

The app still requires clinical judgement, local protocols, medicine safety
checks, and urgent referral for red flags.
