import { GuidelineCitation } from '../models/Clinical';

type GuidelineTemplate = Omit<GuidelineCitation, 'why_it_applies'> & {
  tags: string[];
};

export const GUIDELINE_PACK: GuidelineTemplate[] = [
  {
    id: 'who-emergency-care-overview',
    title: 'Emergency and critical care',
    organization: 'World Health Organization',
    url: 'https://www.who.int/health-topics/emergency-care',
    updated_at: '2026-04',
    summary: 'WHO frames emergency care as the time-sensitive first-contact platform for acutely ill patients, including strokes, sepsis, heart attacks, and obstetric emergencies.',
    tags: ['triage', 'emergency', 'stroke', 'sepsis', 'maternal', 'cardiac']
  },
  {
    id: 'who-bec-manual',
    title: 'WHO-ICRC Basic Emergency Care: approach to the acutely ill and injured',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured',
    updated_at: '2018-10-30',
    summary: 'WHO and ICRC provide a limited-resource first-contact framework built around early recognition, ABC assessment, resuscitation, and transfer of time-sensitive emergencies.',
    tags: ['triage', 'emergency', 'abc', 'transfer', 'cardiac', 'stroke', 'maternal', 'sepsis']
  },
  {
    id: 'who-preeclampsia-factsheet',
    title: 'Pre-eclampsia',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia',
    updated_at: '2025-12-10',
    summary: 'WHO notes that severe headache, visual disturbance, upper abdominal pain, and hypertension after 20 weeks can indicate dangerous pre-eclampsia that needs early recognition and management.',
    tags: ['maternal', 'pregnancy', 'postpartum', 'hypertension', 'headache', 'visual']
  },
  {
    id: 'who-preeclampsia-guideline',
    title: 'WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789241548335',
    updated_at: '2011-11-02',
    summary: 'WHO provides protocol-level recommendations for recognizing and treating pre-eclampsia and eclampsia, especially in low-resource maternal care settings.',
    tags: ['maternal', 'pregnancy', 'postpartum', 'eclampsia', 'hypertension']
  },
  {
    id: 'who-pph-guideline',
    title: 'WHO recommendations for the prevention and treatment of postpartum haemorrhage',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789241548502',
    updated_at: '2012-01-01',
    summary: 'WHO sets out the core principles for postpartum haemorrhage prevention, recognition, and treatment and is intended for protocol development in under-resourced settings.',
    tags: ['maternal', 'postpartum', 'bleeding', 'haemorrhage', 'transfer']
  },
  {
    id: 'who-stroke-factsheet',
    title: 'Stroke',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/stroke',
    updated_at: '2025-12-19',
    summary: 'WHO identifies sudden balance loss, vision change, facial droop, arm weakness, and speech disturbance as stroke signs that require urgent emergency treatment.',
    tags: ['stroke', 'neurology', 'speech', 'weakness', 'time-sensitive']
  },
  {
    id: 'who-cvd-factsheet',
    title: 'Cardiovascular diseases (CVDs)',
    organization: 'World Health Organization',
    url: 'https://www.who.int/en/news-room/fact-sheets/detail/cardiovascular-diseases-%28cvds%29',
    updated_at: '2025-07-31',
    summary: 'WHO lists chest discomfort, arm or jaw pain, shortness of breath, nausea, sweating, and faintness among common heart attack warning symptoms that need prompt management.',
    tags: ['cardiac', 'chest-pain', 'acs', 'shortness-of-breath', 'sweating']
  },
  {
    id: 'who-sepsis-factsheet',
    title: 'Sepsis',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/sepsis',
    updated_at: '2024-05-03',
    summary: 'WHO describes sepsis as a medical emergency and highlights fever, rapid breathing, confusion, weak pulse, low blood pressure, and low urine output as concerning signs.',
    tags: ['sepsis', 'infection', 'hypotension', 'confusion', 'tachypnea']
  },
  {
    id: 'who-pneumonia-children',
    title: 'Pneumonia in children',
    organization: 'World Health Organization',
    url: 'https://www.who.int/en/news-room/fact-sheets/detail/pneumonia',
    updated_at: '2022-11-11',
    summary: 'WHO highlights fast breathing, lower chest indrawing, feeding difficulty, and low oxygen as dangerous pneumonia features in children and supports early antibiotic treatment when indicated.',
    tags: ['child', 'pneumonia', 'respiratory', 'oxygen', 'fever']
  },
  {
    id: 'who-imci-danger-signs',
    title: 'Exploratory meeting to review new evidence for IMCI danger signs',
    organization: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/WHO-MCA-19.02',
    updated_at: '2019-10-17',
    summary: 'WHO IMCI danger signs include convulsions, inability to drink, unconsciousness or drowsiness, vomiting everything, severe dehydration, and stridor in a calm child.',
    tags: ['child', 'imci', 'danger-signs', 'convulsions', 'feeding']
  }
];

export function citationById(id: string, whyItApplies: string): GuidelineCitation {
  const item = GUIDELINE_PACK.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Unknown guideline citation id: ${id}`);
  }
  return {
    id: item.id,
    title: item.title,
    organization: item.organization,
    url: item.url,
    updated_at: item.updated_at,
    summary: item.summary,
    why_it_applies: whyItApplies
  };
}
