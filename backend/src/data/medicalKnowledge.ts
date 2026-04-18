import { DifferentialDiagnosis, SafetySignal, TreatmentRecommendation } from '../models/Clinical';

export interface KnowledgeRule {
  id: string;
  condition: string;
  source: string;
  sourceUrl: string;
  keywords: string[];
  redFlags: string[];
  tests: string[];
  actions: string[];
  diagnosis: DifferentialDiagnosis;
}

export const MEDICAL_KNOWLEDGE_RULES: KnowledgeRule[] = [
  {
    id: 'cdc-heart-attack-warning-signs',
    condition: 'Acute coronary syndrome / heart attack warning signs',
    source: 'CDC heart attack symptoms',
    sourceUrl: 'https://www.cdc.gov/heart-disease/about/heart-attack.html',
    keywords: ['chest pain', 'chest discomfort', 'jaw pain', 'left arm', 'shortness of breath', 'cold sweat', 'lightheaded', 'nausea'],
    redFlags: ['Chest discomfort with shortness of breath, sweating, nausea, jaw/back/arm pain, or faintness requires emergency referral.'],
    tests: ['ECG now if available', 'Troponin if available', 'Repeat blood pressure and oxygen saturation'],
    actions: ['Keep patient resting and monitored.', 'Arrange urgent emergency transfer for suspected acute coronary syndrome.'],
    diagnosis: {
      name: 'Acute coronary syndrome',
      confidence: 0.84,
      reasoning: 'CDC warning signs include chest discomfort, shortness of breath, sweating, nausea, lightheadedness, and upper-body pain.'
    }
  },
  {
    id: 'aha-stroke-fast',
    condition: 'Stroke warning signs',
    source: 'American Heart Association FAST stroke signs',
    sourceUrl: 'https://www.heart.org/en/about-us/heart-attack-and-stroke-symptoms',
    keywords: ['facial droop', 'face drooping', 'arm weakness', 'slurred speech', 'speech difficulty', 'unilateral weakness'],
    redFlags: ['FAST symptoms require immediate emergency referral even if they improve.'],
    tests: ['FAST screen', 'Blood glucose', 'Blood pressure', 'Time last known well'],
    actions: ['Record symptom onset time.', 'Arrange immediate stroke pathway transfer.'],
    diagnosis: {
      name: 'Acute stroke or TIA',
      confidence: 0.88,
      reasoning: 'FAST signs include face drooping, arm weakness, and speech difficulty.'
    }
  },
  {
    id: 'who-sepsis-emergency',
    condition: 'Sepsis warning signs',
    source: 'WHO sepsis fact sheet',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/sepsis',
    keywords: ['fever', 'low temperature', 'shivering', 'confusion', 'difficulty breathing', 'weak pulse', 'low blood pressure', 'low urine'],
    redFlags: ['Possible sepsis is a medical emergency when infection symptoms combine with confusion, breathing difficulty, weak pulse, hypotension, or low urine output.'],
    tests: ['Repeat vital signs', 'Blood glucose', 'CBC if available', 'Local infection testing', 'Urine output assessment'],
    actions: ['Escalate urgently.', 'Assess airway, breathing, circulation, disability, and exposure.'],
    diagnosis: {
      name: 'Sepsis or serious infection',
      confidence: 0.79,
      reasoning: 'WHO describes sepsis as emergency deterioration with fever/low temperature, confusion, breathing difficulty, high heart rate, weak pulse or low blood pressure.'
    }
  },
  {
    id: 'cdc-who-dengue-warning',
    condition: 'Dengue with warning signs',
    source: 'CDC dengue warning signs and WHO dengue fact sheet',
    sourceUrl: 'https://www.cdc.gov/dengue/signs-symptoms/index.html',
    keywords: ['fever', 'eye pain', 'rash', 'joint pain', 'bone pain', 'belly pain', 'abdominal pain', 'persistent vomiting', 'bleeding gums', 'nose bleeding', 'restless'],
    redFlags: ['Dengue warning signs include abdominal pain, persistent vomiting, mucosal bleeding, lethargy, restlessness, or blood in stool/vomit.'],
    tests: ['Dengue test if available', 'CBC/platelets if available', 'Hydration status', 'Warning-sign reassessment'],
    actions: ['Avoid aspirin and ibuprofen when dengue is suspected.', 'Refer or monitor closely if warning signs are present.'],
    diagnosis: {
      name: 'Dengue or other febrile viral illness',
      confidence: 0.68,
      reasoning: 'CDC/WHO dengue guidance highlights fever with aches, rash, nausea/vomiting, and warning signs such as abdominal pain or bleeding.'
    }
  },
  {
    id: 'who-pneumonia-risk',
    condition: 'Pneumonia / respiratory infection',
    source: 'WHO pneumonia overview',
    sourceUrl: 'https://www.who.int/health-topics/pneumonia/',
    keywords: ['cough', 'shortness of breath', 'difficulty breathing', 'fever', 'chills', 'fast breathing', 'lower chest indrawing'],
    redFlags: ['Cough or fever with difficult breathing, low oxygen, fast breathing, or chest indrawing needs urgent review.'],
    tests: ['Respiratory rate', 'Oxygen saturation', 'Temperature', 'Chest exam', 'Referral assessment'],
    actions: ['Check oxygen saturation and respiratory rate.', 'Refer urgently if hypoxic or severe respiratory distress.'],
    diagnosis: {
      name: 'Pneumonia or acute respiratory infection',
      confidence: 0.66,
      reasoning: 'WHO pneumonia symptoms include cough, shortness of breath, fever, sweating, and shaking chills.'
    }
  }
];

export function matchKnowledgeRules(text: string) {
  const normalized = text.toLowerCase();
  return MEDICAL_KNOWLEDGE_RULES
    .map((rule) => ({
      rule,
      matches: rule.keywords.filter((keyword) => normalized.includes(keyword)).length
    }))
    .filter((item) => item.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .map((item) => item.rule);
}

export function addKnowledgeRedFlags(text: string, flags: SafetySignal[]) {
  for (const rule of matchKnowledgeRules(text)) {
    const urgentRule = rule.id.includes('heart') || rule.id.includes('stroke') || rule.id.includes('sepsis');
    for (const message of rule.redFlags) {
      if (!flags.some((flag) => flag.message === message)) {
        flags.push({ level: urgentRule ? 'red' : 'amber', message });
      }
    }
  }
}

export function addKnowledgeDifferentials(text: string, items: DifferentialDiagnosis[]) {
  for (const rule of matchKnowledgeRules(text)) {
    if (!items.some((item) => item.name === rule.diagnosis.name)) {
      items.push(rule.diagnosis);
    }
  }
}

export function applyKnowledgeTreatment(text: string, treatment: TreatmentRecommendation) {
  for (const rule of matchKnowledgeRules(text)) {
    for (const test of rule.tests) {
      if (!treatment.suggested_tests.includes(test)) treatment.suggested_tests.push(test);
    }
    for (const action of rule.actions) {
      if (!treatment.immediate_actions.includes(action)) treatment.immediate_actions.push(action);
    }
  }
  return treatment;
}
