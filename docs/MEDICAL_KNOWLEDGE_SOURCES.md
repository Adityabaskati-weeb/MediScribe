# Medical Knowledge Sources

MediScribe uses a compact local clinical knowledge layer in
`backend/src/data/medicalKnowledge.ts`. It is not a diagnostic authority; it is
decision support that strengthens red-flag triage, suggested tests, and referral
guidance.

Sources used:

- CDC heart attack symptoms: https://www.cdc.gov/heart-disease/about/heart-attack.html
- American Heart Association heart attack and stroke symptoms: https://www.heart.org/en/about-us/heart-attack-and-stroke-symptoms
- WHO pneumonia overview: https://www.who.int/health-topics/pneumonia/
- WHO sepsis fact sheet: https://www.who.int/news-room/fact-sheets/detail/sepsis
- CDC dengue symptoms and warning signs: https://www.cdc.gov/dengue/signs-symptoms/index.html
- WHO dengue fact sheet: https://www.who.int/en/news-room/fact-sheets/detail/dengue-and-severe-dengue

The rule layer focuses on:

- Heart attack warning signs.
- Stroke FAST warning signs.
- Sepsis emergency symptoms.
- Dengue warning signs.
- Pneumonia and respiratory infection warning signs.

The app must still be used with clinical judgement, local protocols, and urgent
referral for red flags.
