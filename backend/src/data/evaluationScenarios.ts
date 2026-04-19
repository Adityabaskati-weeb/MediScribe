import { ClinicalIntake, Urgency } from '../models/Clinical';

export interface EvaluationScenario {
  id: string;
  name: string;
  category: 'cardiac' | 'maternal' | 'pediatric' | 'infectious' | 'respiratory' | 'neurology' | 'general';
  expectedDiagnosisKeywords: string[];
  expectedUrgency: Urgency;
  expectedRedFlag: boolean;
  offlineExpected: boolean;
  intake: ClinicalIntake;
}

export const EVALUATION_SCENARIOS: EvaluationScenario[] = [
  {
    id: 'acs-shock',
    name: 'Shock-range chest pain',
    category: 'cardiac',
    expectedDiagnosisKeywords: ['acute coronary'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 58, gender: 'female', known_conditions: ['hypertension'] },
      chief_complaint: 'Crushing chest pain with sweating',
      symptoms: ['shortness of breath', 'left arm pain'],
      vitals: { systolic_bp: 84, diastolic_bp: 56, oxygen_saturation: 89, respiratory_rate: 32 },
      offline_captured: true
    }
  },
  {
    id: 'acs-jaw-pain',
    name: 'Chest discomfort with jaw pain',
    category: 'cardiac',
    expectedDiagnosisKeywords: ['acute coronary'],
    expectedUrgency: 'emergent',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 63, gender: 'male', known_conditions: ['diabetes'] },
      chief_complaint: 'Chest discomfort with jaw pain and nausea',
      symptoms: ['cold sweat', 'lightheaded'],
      vitals: { systolic_bp: 132, diastolic_bp: 84, oxygen_saturation: 96 },
      offline_captured: true
    }
  },
  {
    id: 'acs-diabetes-sweat',
    name: 'Diabetic patient with sweating and chest pressure',
    category: 'cardiac',
    expectedDiagnosisKeywords: ['acute coronary'],
    expectedUrgency: 'emergent',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 52, gender: 'female', known_conditions: ['diabetes'] },
      chief_complaint: 'Chest pain and sweating after walking',
      symptoms: ['left arm heaviness', 'shortness of breath'],
      vitals: { systolic_bp: 146, diastolic_bp: 92, oxygen_saturation: 95 },
      offline_captured: true
    }
  },
  {
    id: 'stroke-fast',
    name: 'FAST stroke symptoms',
    category: 'neurology',
    expectedDiagnosisKeywords: ['stroke'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 67, gender: 'male', known_conditions: ['hypertension'] },
      chief_complaint: 'Facial droop with slurred speech',
      symptoms: ['unilateral weakness', 'arm weakness'],
      vitals: { systolic_bp: 168, diastolic_bp: 96, glucose_mg_dl: 118 },
      offline_captured: true
    }
  },
  {
    id: 'stroke-transient',
    name: 'Transient speech difficulty',
    category: 'neurology',
    expectedDiagnosisKeywords: ['stroke'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 71, gender: 'female' },
      chief_complaint: 'Speech difficulty and face drooping for 20 minutes',
      symptoms: ['weakness on one side'],
      vitals: { systolic_bp: 154, diastolic_bp: 88 },
      offline_captured: true
    }
  },
  {
    id: 'postpartum-hypertension',
    name: 'Postpartum headache with severe BP',
    category: 'maternal',
    expectedDiagnosisKeywords: ['postpartum', 'undifferentiated'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 29, gender: 'female', postpartum_days: 5 },
      chief_complaint: 'Severe headache and visual symptoms postpartum',
      symptoms: ['high blood pressure', 'visual changes'],
      vitals: { systolic_bp: 178, diastolic_bp: 112 },
      offline_captured: true
    }
  },
  {
    id: 'postpartum-bleeding',
    name: 'Postpartum bleeding and visual changes',
    category: 'maternal',
    expectedDiagnosisKeywords: ['postpartum', 'undifferentiated'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 24, gender: 'female', postpartum_days: 2 },
      chief_complaint: 'Heavy bleeding postpartum with severe headache',
      symptoms: ['visual changes', 'weakness'],
      vitals: { systolic_bp: 88, diastolic_bp: 54, heart_rate: 122 },
      offline_captured: true
    }
  },
  {
    id: 'pregnancy-bleeding',
    name: 'Pregnancy bleeding danger sign',
    category: 'maternal',
    expectedDiagnosisKeywords: ['pregnancy', 'maternal'],
    expectedUrgency: 'emergent',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 31, gender: 'female', pregnancy_weeks: 32 },
      chief_complaint: 'Pregnancy with bleeding and abdominal pain',
      symptoms: ['dizziness'],
      vitals: { systolic_bp: 104, diastolic_bp: 70, heart_rate: 112 },
      offline_captured: true
    }
  },
  {
    id: 'child-pneumonia',
    name: 'Child pneumonia risk',
    category: 'pediatric',
    expectedDiagnosisKeywords: ['pneumonia', 'respiratory'],
    expectedUrgency: 'urgent',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 4, gender: 'male' },
      chief_complaint: 'Child with fever cough fast breathing',
      symptoms: ['cough', 'fever', 'fast breathing'],
      vitals: { oxygen_saturation: 91, respiratory_rate: 38, temperature_c: 39.2 },
      offline_captured: true
    }
  },
  {
    id: 'infant-not-feeding',
    name: 'Infant danger signs',
    category: 'pediatric',
    expectedDiagnosisKeywords: ['infant', 'pediatric'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 1, gender: 'female' },
      chief_complaint: 'Infant not feeding and lethargic with convulsion',
      symptoms: ['blue lips', 'fever'],
      vitals: { temperature_c: 39.3, respiratory_rate: 44 },
      offline_captured: true
    }
  },
  {
    id: 'pediatric-dehydration',
    name: 'Child diarrhea dehydration',
    category: 'pediatric',
    expectedDiagnosisKeywords: ['undifferentiated'],
    expectedUrgency: 'urgent',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 3, gender: 'male' },
      chief_complaint: 'Child with diarrhea and vomiting',
      symptoms: ['reduced urine', 'dry mouth'],
      vitals: { heart_rate: 128, temperature_c: 38.2 },
      offline_captured: true
    }
  },
  {
    id: 'dengue-warning',
    name: 'Dengue warning signs',
    category: 'infectious',
    expectedDiagnosisKeywords: ['dengue'],
    expectedUrgency: 'urgent',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 19, gender: 'male' },
      chief_complaint: 'Fever with abdominal pain and persistent vomiting',
      symptoms: ['rash', 'bleeding gums', 'joint pain'],
      vitals: { systolic_bp: 102, diastolic_bp: 70, temperature_c: 39 },
      offline_captured: true
    }
  },
  {
    id: 'dengue-rash',
    name: 'Febrile rash with bone pain',
    category: 'infectious',
    expectedDiagnosisKeywords: ['dengue'],
    expectedUrgency: 'urgent',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 22, gender: 'female' },
      chief_complaint: 'Fever eye pain rash and bone pain',
      symptoms: ['nausea', 'joint pain'],
      vitals: { temperature_c: 38.9, heart_rate: 104 },
      offline_captured: true
    }
  },
  {
    id: 'sepsis-hypotension',
    name: 'Fever with hypotension and confusion',
    category: 'infectious',
    expectedDiagnosisKeywords: ['sepsis'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 46, gender: 'male' },
      chief_complaint: 'Fever rigors confusion and low blood pressure',
      symptoms: ['low urine', 'weak pulse'],
      vitals: { systolic_bp: 82, diastolic_bp: 48, heart_rate: 126, temperature_c: 39.4 },
      offline_captured: true
    }
  },
  {
    id: 'sepsis-breathing',
    name: 'Infection with difficult breathing',
    category: 'infectious',
    expectedDiagnosisKeywords: ['sepsis'],
    expectedUrgency: 'emergent',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 61, gender: 'female' },
      chief_complaint: 'Fever with confusion and difficulty breathing',
      symptoms: ['shivering', 'weak pulse'],
      vitals: { systolic_bp: 98, diastolic_bp: 62, respiratory_rate: 31 },
      offline_captured: true
    }
  },
  {
    id: 'pneumonia-hypoxia',
    name: 'Pneumonia with low oxygen',
    category: 'respiratory',
    expectedDiagnosisKeywords: ['pneumonia', 'respiratory'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 43, gender: 'female' },
      chief_complaint: 'Cough fever and shortness of breath',
      symptoms: ['difficulty breathing', 'chills'],
      vitals: { oxygen_saturation: 88, respiratory_rate: 34, temperature_c: 39.1 },
      offline_captured: true
    }
  },
  {
    id: 'respiratory-infection',
    name: 'Routine respiratory infection',
    category: 'respiratory',
    expectedDiagnosisKeywords: ['respiratory'],
    expectedUrgency: 'urgent',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 36, gender: 'female' },
      chief_complaint: 'Cough sputum and fever',
      symptoms: ['sore throat'],
      vitals: { oxygen_saturation: 98, temperature_c: 38.4 },
      offline_captured: true
    }
  },
  {
    id: 'asthma-wheeze',
    name: 'Wheeze with shortness of breath',
    category: 'respiratory',
    expectedDiagnosisKeywords: ['asthma', 'obstructive'],
    expectedUrgency: 'routine',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 27, gender: 'male', known_conditions: ['asthma'] },
      chief_complaint: 'Wheeze and shortness of breath',
      symptoms: ['asthma symptoms'],
      vitals: { oxygen_saturation: 95, respiratory_rate: 24 },
      offline_captured: true
    }
  },
  {
    id: 'anaphylaxis',
    name: 'Possible anaphylaxis',
    category: 'general',
    expectedDiagnosisKeywords: ['anaphylaxis', 'allergic'],
    expectedUrgency: 'emergent',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 18, gender: 'female', allergies: ['peanut'] },
      chief_complaint: 'Throat tightness and lip swelling after peanut',
      symptoms: ['rash', 'breathing difficulty'],
      vitals: { systolic_bp: 92, diastolic_bp: 58, oxygen_saturation: 94 },
      offline_captured: true
    }
  },
  {
    id: 'severe-hypertension',
    name: 'Severe hypertension range BP',
    category: 'general',
    expectedDiagnosisKeywords: ['undifferentiated'],
    expectedUrgency: 'emergent',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 55, gender: 'male', known_conditions: ['hypertension'] },
      chief_complaint: 'Severe headache with very high BP',
      symptoms: ['dizziness'],
      vitals: { systolic_bp: 186, diastolic_bp: 124 },
      offline_captured: true
    }
  },
  {
    id: 'dka-risk',
    name: 'Diabetes vomiting and hyperglycemia',
    category: 'general',
    expectedDiagnosisKeywords: ['diabetic ketoacidosis'],
    expectedUrgency: 'urgent',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 41, gender: 'female', known_conditions: ['diabetes'] },
      chief_complaint: 'Diabetic patient vomiting with high glucose',
      symptoms: ['abdominal pain', 'weakness'],
      vitals: { glucose_mg_dl: 328, heart_rate: 112 },
      offline_captured: true
    }
  },
  {
    id: 'snake-bite-shock',
    name: 'Snake bite with shock signs',
    category: 'general',
    expectedDiagnosisKeywords: ['snake bite', 'envenomation'],
    expectedUrgency: 'immediate',
    expectedRedFlag: true,
    offlineExpected: true,
    intake: {
      patient: { age_years: 33, gender: 'male' },
      chief_complaint: 'Snake bite with confusion and low blood pressure',
      symptoms: ['swelling', 'drowsy'],
      vitals: { systolic_bp: 86, diastolic_bp: 52, heart_rate: 120 },
      offline_captured: true
    }
  },
  {
    id: 'fracture-fall',
    name: 'Fall with swollen wrist',
    category: 'general',
    expectedDiagnosisKeywords: ['undifferentiated'],
    expectedUrgency: 'routine',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 44, gender: 'female' },
      chief_complaint: 'Fall with wrist swelling and pain',
      symptoms: ['possible fracture', 'joint pain'],
      vitals: { systolic_bp: 122, diastolic_bp: 78 },
      offline_captured: true
    }
  },
  {
    id: 'routine-fever-cough',
    name: 'Mild fever and cough',
    category: 'respiratory',
    expectedDiagnosisKeywords: ['respiratory'],
    expectedUrgency: 'routine',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 34, gender: 'female' },
      chief_complaint: 'Mild fever and cough for two days',
      symptoms: ['drinking fluids', 'no breathing difficulty'],
      vitals: { systolic_bp: 120, diastolic_bp: 80, oxygen_saturation: 98, temperature_c: 37.8 },
      offline_captured: true
    }
  },
  {
    id: 'routine-body-ache',
    name: 'Body ache without danger signs',
    category: 'general',
    expectedDiagnosisKeywords: ['undifferentiated'],
    expectedUrgency: 'routine',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 25, gender: 'male' },
      chief_complaint: 'Body ache after farm work',
      symptoms: ['fatigue', 'no fever', 'no chest pain'],
      vitals: { systolic_bp: 118, diastolic_bp: 76, oxygen_saturation: 99 },
      offline_captured: true
    }
  },
  {
    id: 'unknown-primary-care',
    name: 'Incomplete primary care presentation',
    category: 'general',
    expectedDiagnosisKeywords: ['undifferentiated'],
    expectedUrgency: 'routine',
    expectedRedFlag: false,
    offlineExpected: true,
    intake: {
      patient: { age_years: 47, gender: 'unknown' },
      chief_complaint: 'Tired and not feeling well',
      symptoms: ['needs more history'],
      vitals: { systolic_bp: 126, diastolic_bp: 82 },
      offline_captured: true
    }
  }
];
